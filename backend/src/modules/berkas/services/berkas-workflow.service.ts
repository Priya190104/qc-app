import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { BerkasStatus } from '@prisma/client';
import {
  TransitionBerkasDto,
  AssignKKSDto,
  ApproveBerkasDto,
  ReviseBerkasDto,
  UpdateDataUkurDto,
  ValidatePengukuranDto,
  UpdateDataPemetaanDto,
  ValidatePemetaanDto,
} from '../dto/workflow.dto';
import { isValidTransition, REVISION_TARGETS } from '@/common/constants/berkas-status';

@Injectable()
export class BerkasWorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get berkas by status (for specific role pages)
   */
  async getBerkasByStatus(status: BerkasStatus) {
    return this.prisma.berkas.findMany({
      where: { status },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        petugasUkur: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          },
        },
        puLapang: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          },
        },
        petugasPemetaan: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Generic transition to next status with validation
   */
  async transitionStatus(berkasId: string, transitionDto: TransitionBerkasDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (!isValidTransition(berkas.status, transitionDto.newStatus)) {
      throw new BadRequestException(
        `Transisi dari ${berkas.status} ke ${transitionDto.newStatus} tidak diizinkan`
      );
    }

    // Create history record
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: berkas.status,
        newStatus: transitionDto.newStatus,
        changedById: userId,
        reason: transitionDto.reason,
      },
    });

    // Update berkas status
    return this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        status: transitionDto.newStatus,
      },
      include: {
        createdBy: true,
        petugasUkur: true,
        puLapang: true,
        petugasKKS: true,
      },
    });
  }

  /**
   * OPERATOR DATA UKUR: Update data ukur and move to next status
   */
  async updateDataUkur(berkasId: string, updateDto: UpdateDataUkurDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status !== BerkasStatus.DI_OPERATOR_DATA_UKUR) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Update berkas data
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        petugasUkurId: updateDto.petugasUkurId,
        noSTP: updateDto.noSTP,
        tglSTP: updateDto.tglSTP ? new Date(updateDto.tglSTP) : undefined,
        noSHATNIBEL: updateDto.noSHATNIBEL,
        kegiatan: updateDto.kegiatan,
        namaPemohon: updateDto.namaPemohon,
        kecamatan: updateDto.kecamatan,
        desa: updateDto.desa,
        namaProsedur: updateDto.namaProsedur,
        luasPendaftaran: updateDto.luasPendaftaran ? BigInt(updateDto.luasPendaftaran) : undefined,
      },
    });

    return updatedBerkas;
  }

  async lanjutkanKePetugasUkur(berkasId: string, userId: string) {
    return this.transitionStatus(
      berkasId,
      {
        newStatus: BerkasStatus.DI_PETUGAS_UKUR,
        reason: 'Data ukur telah diperbarui, dilanjutkan ke Petugas Ukur',
      },
      userId
    );
  }

  /**
   * PETUGAS UKUR: Validate pengukuran and move to next status
   */
  async validatePengukuran(berkasId: string, validateDto: ValidatePengukuranDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    // Check if this is a revision case
    const isRevision =
      berkas.status === BerkasStatus.REVISI_KKS || berkas.status === BerkasStatus.REVISI_KASI;

    if (!isRevision && berkas.status !== BerkasStatus.DI_PETUGAS_UKUR) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Determine next status
    let newStatus: BerkasStatus;
    let reason: string;

    if (isRevision) {
      // Return to the source (KKS or Kepala Seksi)
      if (berkas.status === BerkasStatus.REVISI_KKS) {
        newStatus = BerkasStatus.DI_KKS;
        reason = validateDto.notes || 'Revisi pengukuran selesai, dikembalikan ke KKS';
      } else {
        newStatus = BerkasStatus.DI_KEPALA_SEKSI;
        reason = validateDto.notes || 'Revisi pengukuran selesai, dikembalikan ke Kepala Seksi';
      }
    } else {
      // Normal flow: continue to Operator Data Pemetaan
      newStatus = BerkasStatus.DI_OPERATOR_DATA_PEMETAAN;
      reason = validateDto.notes || 'Pengukuran telah divalidasi';
    }

    // Update berkas with PU Lapang if provided
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        puLapangId: validateDto.puLapangId,
        status: newStatus,
      },
    });

    // Create history
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: berkas.status,
        newStatus,
        changedById: userId,
        reason,
      },
    });

    return updatedBerkas;
  }

  /**
   * OPERATOR DATA PEMETAAN: Update data pemetaan
   */
  async updateDataPemetaan(berkasId: string, updateDto: UpdateDataPemetaanDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status !== BerkasStatus.DI_OPERATOR_DATA_PEMETAAN) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Update berkas data
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        petugasPemetaanId: updateDto.petugasPemetaanId,
        luasHasilUkur: updateDto.luasHasilUkur,
        nib: updateDto.nib,
        nibel: updateDto.nibel,
        jumlahBidang: updateDto.jumlahBidang,
        noSU: updateDto.noSU,
      },
    });

    return updatedBerkas;
  }

  async lanjutkanKePetugasPemetaan(berkasId: string, userId: string) {
    return this.transitionStatus(
      berkasId,
      {
        newStatus: BerkasStatus.DI_PETUGAS_PEMETAAN,
        reason: 'Data pemetaan telah diperbarui, dilanjutkan ke Petugas Pemetaan',
      },
      userId
    );
  }

  /**
   * PETUGAS PEMETAAN: Validate pemetaan and move to PEMILIHAN_KKS
   */
  async validatePemetaan(berkasId: string, validateDto: ValidatePemetaanDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    // Check if this is a revision case
    const isRevision =
      berkas.status === BerkasStatus.REVISI_KKS || berkas.status === BerkasStatus.REVISI_KASI;

    if (!isRevision && berkas.status !== BerkasStatus.DI_PETUGAS_PEMETAAN) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Determine next status
    let newStatus: BerkasStatus;
    let reason: string;

    if (isRevision) {
      // Return to the source (KKS or Kepala Seksi)
      if (berkas.status === BerkasStatus.REVISI_KKS) {
        newStatus = BerkasStatus.DI_KKS;
        reason = validateDto.notes || 'Revisi pemetaan selesai, dikembalikan ke KKS';
      } else {
        newStatus = BerkasStatus.DI_KEPALA_SEKSI;
        reason = validateDto.notes || 'Revisi pemetaan selesai, dikembalikan ke Kepala Seksi';
      }
    } else {
      // Normal flow: continue to PEMILIHAN_KKS
      newStatus = BerkasStatus.PEMILIHAN_KKS;
      reason = validateDto.notes || 'Pemetaan telah divalidasi';
    }

    // Update status
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        status: newStatus,
      },
    });

    // Create history
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: berkas.status,
        newStatus,
        changedById: userId,
        reason,
      },
    });

    return updatedBerkas;
  }

  /**
   * OPERATOR DATA BERKAS: Assign KKS and move to DI_KKS
   */
  async assignKKS(berkasId: string, assignDto: AssignKKSDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status !== BerkasStatus.PEMILIHAN_KKS) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Verify petugas KKS exists
    const petugasKKS = await this.prisma.petugas.findUnique({
      where: { id: assignDto.petugasKKSId },
    });

    if (!petugasKKS) {
      throw new NotFoundException('Petugas KKS tidak ditemukan');
    }

    // Update berkas with KKS assignment
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        petugasKKSId: assignDto.petugasKKSId,
        status: BerkasStatus.DI_KKS,
      },
      include: {
        petugasKKS: true,
      },
    });

    // Create history
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: BerkasStatus.PEMILIHAN_KKS,
        newStatus: BerkasStatus.DI_KKS,
        changedById: userId,
        reason: `KKS ditugaskan ke ${petugasKKS.nama} (${petugasKKS.nip})`,
      },
    });

    return updatedBerkas;
  }

  /**
   * KKS: Approve berkas (ACC) and move to DI_KEPALA_SEKSI
   */
  async approveByKKS(berkasId: string, approveDto: ApproveBerkasDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status !== BerkasStatus.DI_KKS) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Update status to DI_KEPALA_SEKSI
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        status: BerkasStatus.DI_KEPALA_SEKSI,
      },
    });

    // Create history
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: BerkasStatus.DI_KKS,
        newStatus: BerkasStatus.DI_KEPALA_SEKSI,
        changedById: userId,
        reason: approveDto.notes || 'Berkas disetujui oleh KKS',
      },
    });

    return updatedBerkas;
  }

  /**
   * KKS: Revise berkas and send back to specific status
   */
  async reviseByKKS(berkasId: string, reviseDto: ReviseBerkasDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status !== BerkasStatus.DI_KKS) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Validate revision target
    const validTargets = REVISION_TARGETS[BerkasStatus.DI_KKS];
    if (!validTargets.includes(reviseDto.revisionTarget)) {
      throw new BadRequestException('Target revisi tidak valid');
    }

    // Update berkas - status becomes REVISI_KKS regardless of target
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        status: BerkasStatus.REVISI_KKS,
        revisionCount: { increment: 1 },
        lastRevisionReason: reviseDto.reason,
        lastRevisionFrom: `${BerkasStatus.DI_KKS}|${reviseDto.revisionTarget}`, // Store both source and target
      },
    });

    // Create history
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: BerkasStatus.DI_KKS,
        newStatus: BerkasStatus.REVISI_KKS,
        changedById: userId,
        reason: `REVISI dari KKS ke ${reviseDto.revisionTarget}: ${reviseDto.reason}`,
      },
    });

    return updatedBerkas;
  }

  /**
   * KEPALA SEKSI: Approve berkas (ACC) and mark as SELESAI
   */
  async approveByKepalaSeksi(berkasId: string, approveDto: ApproveBerkasDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status !== BerkasStatus.DI_KEPALA_SEKSI) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Update status to SELESAI
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        status: BerkasStatus.SELESAI,
        approvedById: userId,
      },
    });

    // Create history
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: BerkasStatus.DI_KEPALA_SEKSI,
        newStatus: BerkasStatus.SELESAI,
        changedById: userId,
        reason: approveDto.notes || 'Berkas disetujui oleh Kepala Seksi',
      },
    });

    return updatedBerkas;
  }

  /**
   * KEPALA SEKSI: Revise berkas and send back to specific status
   */
  async reviseByKepalaSeksi(berkasId: string, reviseDto: ReviseBerkasDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id: berkasId },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status !== BerkasStatus.DI_KEPALA_SEKSI) {
      throw new BadRequestException('Berkas tidak dalam status yang sesuai');
    }

    // Validate revision target
    const validTargets = REVISION_TARGETS[BerkasStatus.DI_KEPALA_SEKSI];
    if (!validTargets.includes(reviseDto.revisionTarget)) {
      throw new BadRequestException('Target revisi tidak valid');
    }

    // Determine new status based on target
    let newStatus: BerkasStatus;
    if (reviseDto.revisionTarget === 'KKS') {
      newStatus = BerkasStatus.DI_KKS; // Send back to KKS directly
    } else {
      newStatus = BerkasStatus.REVISI_KASI; // Send to Petugas for revision
    }

    // Update berkas
    const updatedBerkas = await this.prisma.berkas.update({
      where: { id: berkasId },
      data: {
        status: newStatus,
        revisionCount: { increment: 1 },
        lastRevisionReason: reviseDto.reason,
        lastRevisionFrom: `${BerkasStatus.DI_KEPALA_SEKSI}|${reviseDto.revisionTarget}`, // Store both source and target
      },
    });

    // Create history
    await this.prisma.berkasHistory.create({
      data: {
        berkasId,
        oldStatus: BerkasStatus.DI_KEPALA_SEKSI,
        newStatus,
        changedById: userId,
        reason: `REVISI dari Kepala Seksi ke ${reviseDto.revisionTarget}: ${reviseDto.reason}`,
      },
    });

    return updatedBerkas;
  }

  /**
   * Get berkas history
   */
  async getBerkasHistory(berkasId: string) {
    return this.prisma.berkasHistory.findMany({
      where: { berkasId },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        changedAt: 'desc',
      },
    });
  }
}

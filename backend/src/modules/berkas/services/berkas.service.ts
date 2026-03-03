import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateBerkasDto, UpdateBerkasDto } from '../dto/berkas.dto';
import { BerkasStatus } from '@prisma/client';

@Injectable()
export class BerkasService {
  constructor(private prisma: PrismaService) {}

  async create(createBerkasDto: CreateBerkasDto, userId: string) {
    // Check if nomor already exists among non-closed berkas (outside transaction to avoid lock)
    const existingBerkas = await this.prisma.berkas.findFirst({
      where: {
        nomor: createBerkasDto.nomor,
        isClosed: false,
      },
      select: { id: true },
    });

    if (existingBerkas) {
      throw new BadRequestException(`Berkas dengan nomor ${createBerkasDto.nomor} sudah ada`);
    }

    // Use $transaction to ensure all 3 operations are atomic
    // If any step fails, the entire operation is rolled back automatically
    const updatedBerkas = await this.prisma.$transaction(async (tx) => {
      const berkas = await tx.berkas.create({
        data: {
          nomor: createBerkasDto.nomor,
          kegiatan: createBerkasDto.kegiatan,
          tanggalBerkas: createBerkasDto.tanggalBerkas
            ? new Date(createBerkasDto.tanggalBerkas)
            : null,
          tahunBerkas: createBerkasDto.tahunBerkas,
          namaPemohon: createBerkasDto.namaPemohon,
          kecamatan: createBerkasDto.kecamatan,
          desa: createBerkasDto.desa,
          namaProsedur: createBerkasDto.namaProsedur,
          luasPendaftaran: createBerkasDto.luasPendaftaran
            ? BigInt(createBerkasDto.luasPendaftaran)
            : null,
          di302: createBerkasDto.di302,
          di305: createBerkasDto.di305,
          kks: createBerkasDto.kks,
          deskripsi: createBerkasDto.deskripsi,
          // Create directly with final status to reduce one UPDATE round-trip
          status: BerkasStatus.DI_OPERATOR_DATA_UKUR,
          createdById: userId,
        },
      });

      // Create history record in same transaction
      await tx.berkasHistory.create({
        data: {
          berkasId: berkas.id,
          oldStatus: BerkasStatus.DIBUAT,
          newStatus: BerkasStatus.DI_OPERATOR_DATA_UKUR,
          changedById: userId,
          reason: 'Berkas dibuat dan otomatis masuk ke Operator Data Ukur',
        },
      });

      return berkas;
    });

    return updatedBerkas;
  }

  async findAll(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    desa?: string;
    kecamatan?: string;
    tahunBerkas?: number;
    status?: string;
    includeClosed?: boolean;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Only filter by isClosed if explicitly requested
    if (!filters?.includeClosed) {
      where.isClosed = false; // Only show active berkas by default
    }

    // Search filter (nomor or nama pemohon)
    if (filters?.search) {
      where.OR = [
        { nomor: { contains: filters.search, mode: 'insensitive' } },
        { namaPemohon: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Desa filter
    if (filters?.desa) {
      where.desa = { contains: filters.desa, mode: 'insensitive' };
    }

    // Kecamatan filter
    if (filters?.kecamatan) {
      where.kecamatan = { contains: filters.kecamatan, mode: 'insensitive' };
    }

    // Tahun berkas filter
    if (filters?.tahunBerkas) {
      where.tahunBerkas = filters.tahunBerkas;
    }

    // Status filter
    if (filters?.status) {
      where.status = filters.status;
    }

    // Execute queries in parallel for better performance
    const [berkas, total] = await Promise.all([
      this.prisma.berkas.findMany({
        where,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          approvedBy: {
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
          petugasKKS: {
            select: {
              id: true,
              nama: true,
              nip: true,
              jabatan: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.berkas.count({ where }),
    ]);

    // Return paginated response
    return {
      data: berkas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Keep the old method for backward compatibility
  async findAllNoPagination() {
    return this.prisma.berkas.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
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
        petugasKKS: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
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
        petugasKKS: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          },
        },
        history: true,
      },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    return berkas;
  }

  async update(id: string, updateBerkasDto: UpdateBerkasDto, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    const updatedBerkas = await this.prisma.berkas.update({
      where: { id },
      data: {
        kegiatan: updateBerkasDto.kegiatan,
        tanggalBerkas: updateBerkasDto.tanggalBerkas
          ? new Date(updateBerkasDto.tanggalBerkas)
          : undefined,
        tahunBerkas: updateBerkasDto.tahunBerkas,
        namaPemohon: updateBerkasDto.namaPemohon,
        kecamatan: updateBerkasDto.kecamatan,
        desa: updateBerkasDto.desa,
        namaProsedur: updateBerkasDto.namaProsedur,
        luasPendaftaran: updateBerkasDto.luasPendaftaran
          ? BigInt(updateBerkasDto.luasPendaftaran)
          : undefined,
        di302: updateBerkasDto.di302,
        di305: updateBerkasDto.di305,
        kks: updateBerkasDto.kks,
        status: updateBerkasDto.status ? (updateBerkasDto.status as BerkasStatus) : undefined,
        deskripsi: updateBerkasDto.deskripsi,
        // KKS Workflow Fields
        petugasUkurId: updateBerkasDto.petugasUkurId,
        puLapangId: updateBerkasDto.puLapangId,
        noSTP: updateBerkasDto.noSTP,
        tglSTP: updateBerkasDto.tglSTP ? new Date(updateBerkasDto.tglSTP) : undefined,
        noSHATNIBEL: updateBerkasDto.noSHATNIBEL,
        luasHasilUkur: updateBerkasDto.luasHasilUkur,
        nib: updateBerkasDto.nib,
        nibel: updateBerkasDto.nibel,
        jumlahBidang: updateBerkasDto.jumlahBidang,
        noSU: updateBerkasDto.noSU,
      },
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
      },
    });

    return updatedBerkas;
  }

  async closeBerkas(id: string, userId: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    if (berkas.status === BerkasStatus.SELESAI) {
      throw new BadRequestException('Berkas yang sudah selesai tidak dapat ditutup');
    }

    if (berkas.isClosed) {
      throw new BadRequestException('Berkas sudah ditutup sebelumnya');
    }

    await this.prisma.berkas.update({
      where: { id },
      data: {
        status: BerkasStatus.DITUTUP,
        isClosed: true,
        closedAt: new Date(),
        closedById: userId,
      },
    });

    return { message: 'Berkas berhasil ditutup' };
  }

  async remove(id: string) {
    const berkas = await this.prisma.berkas.findUnique({
      where: { id },
    });

    if (!berkas) {
      throw new NotFoundException('Berkas tidak ditemukan');
    }

    await this.prisma.berkas.delete({
      where: { id },
    });

    return { message: 'Berkas berhasil dihapus' };
  }

  async findByStatus(status: string) {
    const berkas = await this.prisma.berkas.findMany({
      where: {
        status: status as BerkasStatus,
        isClosed: false, // Exclude closed berkas
      },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return berkas;
  }
}

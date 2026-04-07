import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '@/config/prisma.service';
import { BerkasStatus } from '@prisma/client';

// Cache TTL constants (in milliseconds)
const CACHE_TTL_METRICS = 30_000; // 30 seconds — dashboard metrics tolerate slight staleness
const CACHE_TTL_PETUGAS = 60_000; // 60 seconds — petugas stats change less frequently

// Cache key constants
const CACHE_KEY_METRICS = 'dashboard:metrics';
const CACHE_KEY_PETUGAS_STATS = 'dashboard:petugas-stats';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getMetrics(dateFrom?: string, dateTo?: string) {
    // Only cache when no date filters (date-filtered queries are unique per request)
    const useCache = !dateFrom && !dateTo;

    if (useCache) {
      const cached = await this.cacheManager.get<any>(CACHE_KEY_METRICS);
      if (cached) {
        return cached;
      }
    }

    // Build where clause for date filtering
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // OPTIMIZED: Use groupBy instead of 13 separate count queries
    // This reduces 13 queries to just 2 queries
    const [statusCounts, totalBerkas] = await Promise.all([
      this.prisma.berkas.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.berkas.count({ where }),
    ]);

    // Convert array to object for easy access
    const statusMap: Record<string, number> = {};
    statusCounts.forEach((item) => {
      statusMap[item.status] = item._count;
    });

    // Extract counts with defaults
    const dibuat = statusMap[BerkasStatus.DIBUAT] || 0;
    const diOperatorDataUkur = statusMap[BerkasStatus.DI_OPERATOR_DATA_UKUR] || 0;
    const diPetugasUkur = statusMap[BerkasStatus.DI_PETUGAS_UKUR] || 0;
    const diOperatorDataPemetaan = statusMap[BerkasStatus.DI_OPERATOR_DATA_PEMETAAN] || 0;
    const diPetugasPemetaan = statusMap[BerkasStatus.DI_PETUGAS_PEMETAAN] || 0;
    const pemilihanKKS = statusMap[BerkasStatus.PEMILIHAN_KKS] || 0;
    const diKKS = statusMap[BerkasStatus.DI_KKS] || 0;
    const revisiKKS = statusMap[BerkasStatus.REVISI_KKS] || 0;
    const diKepalaSeksi = statusMap[BerkasStatus.DI_KEPALA_SEKSI] || 0;
    const revisiKasi = statusMap[BerkasStatus.REVISI_KASI] || 0;
    const selesai = statusMap[BerkasStatus.SELESAI] || 0;
    const ditutup = statusMap[BerkasStatus.DITUTUP] || 0;

    // Calculate in process (all statuses except SELESAI and DITUTUP)
    const inProcessBerkas = totalBerkas - selesai - ditutup;

    const result = {
      summary: {
        totalBerkas,
        inProcessBerkas,
        completedBerkas: selesai,
        ditutup,
      },
      statusDistribution: {
        dibuat,
        diOperatorDataUkur,
        diPetugasUkur,
        diOperatorDataPemetaan,
        diPetugasPemetaan,
        pemilihanKKS,
        diKKS,
        revisiKKS,
        diKepalaSeksi,
        revisiKasi,
        selesai,
        ditutup,
      },
    };

    if (useCache) {
      await this.cacheManager.set(CACHE_KEY_METRICS, result, CACHE_TTL_METRICS);
    }

    return result;
  }

  async getPetugasStats() {
    // Cache petugas stats — changes slowly
    const cached = await this.cacheManager.get<any>(CACHE_KEY_PETUGAS_STATS);
    if (cached) {
      return cached;
    }

    // Get all petugas ukur and pemetaan in parallel
    const [petugasUkur, petugasPemetaan] = await Promise.all([
      this.prisma.petugas.findMany({
        where: { departemen: 'Petugas Ukur' },
        select: { id: true, nama: true, nip: true },
      }),
      this.prisma.petugas.findMany({
        where: { departemen: 'Petugas Pemetaan' },
        select: { id: true, nama: true, nip: true },
      }),
    ]);

    // Count berkas for each petugas ukur and pemetaan simultaneously
    const [petugasUkurStats, petugasPemetaanStats] = await Promise.all([
      Promise.all(
        petugasUkur.map(async (petugas) => {
          const [jumlahProses, jumlahRevisi] = await Promise.all([
            this.prisma.berkas.count({
              where: { petugasUkurId: petugas.id, status: BerkasStatus.DI_PETUGAS_UKUR },
            }),
            this.prisma.berkas.count({
              where: {
                petugasUkurId: petugas.id,
                status: { in: [BerkasStatus.REVISI_KKS, BerkasStatus.REVISI_KASI] },
                lastRevisionFrom: { endsWith: '|PETUGAS_UKUR' },
              },
            }),
          ]);
          return {
            id: petugas.id,
            nama: petugas.nama,
            nip: petugas.nip,
            departemen: 'PETUGAS_UKUR',
            jumlahProses,
            jumlahRevisi,
          };
        })
      ),
      Promise.all(
        petugasPemetaan.map(async (petugas) => {
          const [jumlahProses, jumlahRevisi] = await Promise.all([
            this.prisma.berkas.count({
              where: { petugasPemetaanId: petugas.id, status: BerkasStatus.DI_PETUGAS_PEMETAAN },
            }),
            this.prisma.berkas.count({
              where: {
                petugasPemetaanId: petugas.id,
                status: { in: [BerkasStatus.REVISI_KKS, BerkasStatus.REVISI_KASI] },
                lastRevisionFrom: { endsWith: '|PETUGAS_PEMETAAN' },
              },
            }),
          ]);
          return {
            id: petugas.id,
            nama: petugas.nama,
            nip: petugas.nip,
            departemen: 'PETUGAS_PEMETAAN',
            jumlahProses,
            jumlahRevisi,
          };
        })
      ),
    ]);

    const result = {
      petugasUkur: petugasUkurStats,
      petugasPemetaan: petugasPemetaanStats,
    };

    await this.cacheManager.set(CACHE_KEY_PETUGAS_STATS, result, CACHE_TTL_PETUGAS);
    return result;
  }

  /**
   * Call this to invalidate dashboard caches after berkas status changes.
   * Used by BerkasWorkflowService to keep stats fresh.
   */
  async invalidateDashboardCache() {
    await Promise.all([
      this.cacheManager.del(CACHE_KEY_METRICS),
      this.cacheManager.del(CACHE_KEY_PETUGAS_STATS),
    ]);
  }

  async getActivities(page = 1, limit = 50, userId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log: any) => ({
        id: log.id,
        user: log.user,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        description: log.description,
        timestamp: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentChanges(limit = 10) {
    // Since berkas module has been removed, return empty changes
    return [];
  }

  async getPetugasBerkas(petugasId: string, tipe: 'ukur' | 'pemetaan') {
    const isUkur = tipe === 'ukur';

    const berkasList = await this.prisma.berkas.findMany({
      where: isUkur
        ? {
            petugasUkurId: petugasId,
            OR: [
              { status: BerkasStatus.DI_PETUGAS_UKUR },
              {
                status: { in: [BerkasStatus.REVISI_KKS, BerkasStatus.REVISI_KASI] },
                lastRevisionFrom: { endsWith: '|PETUGAS_UKUR' },
              },
            ],
          }
        : {
            petugasPemetaanId: petugasId,
            OR: [
              { status: BerkasStatus.DI_PETUGAS_PEMETAAN },
              {
                status: { in: [BerkasStatus.REVISI_KKS, BerkasStatus.REVISI_KASI] },
                lastRevisionFrom: { endsWith: '|PETUGAS_PEMETAAN' },
              },
            ],
          },
      select: {
        id: true,
        nomor: true,
        namaPemohon: true,
        kegiatan: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = berkasList.map((b, index) => ({
      no: index + 1,
      id: b.id,
      nomor: b.nomor,
      namaPemohon: b.namaPemohon || '-',
      kegiatan: b.kegiatan || '-',
      jenis:
        b.status === BerkasStatus.DI_PETUGAS_UKUR || b.status === BerkasStatus.DI_PETUGAS_PEMETAAN
          ? 'Proses'
          : 'Revisi',
    }));

    return { data: result, total: result.length };
  }
}

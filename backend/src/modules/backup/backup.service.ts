import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/config/prisma.service';
import { BerkasStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private prisma: PrismaService) {
    // Pastikan folder backups ada
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  // ============================================================
  // CRON JOBS
  // ============================================================

  /**
   * Setiap tanggal 1 pukul 02:00 — buat backup bulanan
   */
  @Cron('0 2 1 * *', { name: 'monthly-backup' })
  async handleMonthlyBackup() {
    this.logger.log('⏰ Cron: memulai backup bulanan...');
    await this.createBackup();
  }

  /**
   * Setiap tanggal 1 pukul 03:00 — hapus data lama (1 jam setelah backup)
   */
  @Cron('0 3 1 * *', { name: 'monthly-cleanup' })
  async handleMonthlyCleanup() {
    this.logger.log('⏰ Cron: memulai cleanup data lama...');
    await this.deleteOldBerkas();
    await this.deleteOldBackups();
  }

  // ============================================================
  // BACKUP LOGIC
  // ============================================================

  /**
   * Buat backup semua data berkas ke file JSON.
   * Dipanggil otomatis setiap bulan, atau bisa dipicu manual via API.
   */
  async createBackup(): Promise<{
    filename: string;
    fileSizeBytes: number;
    totalBerkas: number;
  }> {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const filename = `backup_${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    try {
      // Ambil SEMUA berkas beserta relasi lengkap
      const allBerkas = await this.prisma.berkas.findMany({
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          petugasUkur: { select: { id: true, nama: true, nip: true } },
          puLapang: { select: { id: true, nama: true, nip: true } },
          petugasPemetaan: { select: { id: true, nama: true, nip: true } },
          petugasKKS: { select: { id: true, nama: true, nip: true } },
          history: {
            orderBy: { changedAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const payload = {
        backupDate: now.toISOString(),
        appVersion: '1.0.0',
        totalBerkas: allBerkas.length,
        data: allBerkas,
      };

      // Tulis ke file JSON
      const jsonContent = JSON.stringify(
        payload,
        (_, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      );

      fs.writeFileSync(filePath, jsonContent, 'utf-8');

      const fileSizeBytes = fs.statSync(filePath).size;

      // Simpan metadata ke database
      await this.prisma.backupLog.create({
        data: {
          filename,
          filePath,
          fileSizeBytes: BigInt(fileSizeBytes),
          totalBerkas: allBerkas.length,
          status: 'SUCCESS',
        },
      });

      this.logger.log(
        `✅ Backup berhasil: ${filename} (${allBerkas.length} berkas, ${(fileSizeBytes / 1024).toFixed(1)} KB)`
      );

      return { filename, fileSizeBytes, totalBerkas: allBerkas.length };
    } catch (error) {
      // Hapus file parsial jika ada error
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await this.prisma.backupLog.create({
        data: {
          filename,
          filePath,
          fileSizeBytes: BigInt(0),
          totalBerkas: 0,
          status: 'FAILED',
          errorMessage: String(error),
        },
      });

      this.logger.error(`❌ Backup gagal: ${error}`);
      throw error;
    }
  }

  // ============================================================
  // CLEANUP LOGIC
  // ============================================================

  /**
   * Hapus berkas yang dibuat lebih dari 2 tahun lalu,
   * hanya jika statusnya SELESAI atau DITUTUP (berkas tidak aktif).
   * Berkas yang masih dalam proses TIDAK akan dihapus.
   */
  async deleteOldBerkas(): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date(Date.now() - TWO_YEARS_MS);

    // Cari dulu untuk logging
    const toDelete = await this.prisma.berkas.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: [BerkasStatus.SELESAI, BerkasStatus.DITUTUP] },
      },
      select: { id: true, nomor: true, createdAt: true, status: true },
    });

    if (toDelete.length === 0) {
      this.logger.log('🗑️  Tidak ada berkas lama yang perlu dihapus');
      return { deletedCount: 0 };
    }

    // Hapus — BerkasHistory akan ikut terhapus karena onDelete: Cascade
    const result = await this.prisma.berkas.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: [BerkasStatus.SELESAI, BerkasStatus.DITUTUP] },
      },
    });

    this.logger.warn(
      `🗑️  Berkas lama dihapus: ${result.count} berkas (dibuat sebelum ${cutoffDate.toISOString()})`
    );

    return { deletedCount: result.count };
  }

  /**
   * Hapus file backup dan record DB yang lebih dari 2 tahun.
   */
  async deleteOldBackups(): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date(Date.now() - TWO_YEARS_MS);

    const oldBackups = await this.prisma.backupLog.findMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    if (oldBackups.length === 0) {
      this.logger.log('🗑️  Tidak ada backup lama yang perlu dihapus');
      return { deletedCount: 0 };
    }

    // Hapus file fisik
    for (const backup of oldBackups) {
      if (fs.existsSync(backup.filePath)) {
        fs.unlinkSync(backup.filePath);
        this.logger.warn(`🗑️  File backup dihapus: ${backup.filename}`);
      }
    }

    // Hapus record dari DB
    await this.prisma.backupLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    return { deletedCount: oldBackups.length };
  }

  // ============================================================
  // LIST & READ HELPERS (untuk controller)
  // ============================================================

  async listBackups(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [backups, total] = await Promise.all([
      this.prisma.backupLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.backupLog.count(),
    ]);

    return {
      data: backups.map((b) => ({
        ...b,
        fileSizeBytes: b.fileSizeBytes.toString(),
        fileSizeKB: Number(b.fileSizeBytes / BigInt(1024)).toFixed(1),
        fileSizeMB: (Number(b.fileSizeBytes) / (1024 * 1024)).toFixed(2),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBackupFile(id: string): Promise<{
    filename: string;
    filePath: string;
    exists: boolean;
  }> {
    const backup = await this.prisma.backupLog.findUnique({ where: { id } });
    if (!backup) throw new Error('Backup tidak ditemukan');

    return {
      filename: backup.filename,
      filePath: backup.filePath,
      exists: fs.existsSync(backup.filePath),
    };
  }

  async deleteBackupById(id: string): Promise<void> {
    const backup = await this.prisma.backupLog.findUnique({ where: { id } });
    if (!backup) throw new Error('Backup tidak ditemukan');

    if (fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    await this.prisma.backupLog.delete({ where: { id } });
  }

  async getStats() {
    const [total, success, failed, latest] = await Promise.all([
      this.prisma.backupLog.count(),
      this.prisma.backupLog.count({ where: { status: 'SUCCESS' } }),
      this.prisma.backupLog.count({ where: { status: 'FAILED' } }),
      this.prisma.backupLog.findFirst({ orderBy: { createdAt: 'desc' } }),
    ]);

    const cutoffDate = new Date(Date.now() - TWO_YEARS_MS);
    const oldBerkasCount = await this.prisma.berkas.count({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: [BerkasStatus.SELESAI, BerkasStatus.DITUTUP] },
      },
    });

    return {
      totalBackups: total,
      successBackups: success,
      failedBackups: failed,
      latestBackup: latest
        ? {
            ...latest,
            fileSizeBytes: latest.fileSizeBytes.toString(),
          }
        : null,
      nextScheduled: 'Tanggal 1 setiap bulan, pukul 02:00',
      oldBerkasEligibleForDeletion: oldBerkasCount,
      retentionPolicy: '2 tahun untuk berkas SELESAI/DITUTUP dan file backup',
    };
  }
}

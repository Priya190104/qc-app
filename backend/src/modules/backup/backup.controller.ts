import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Res,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/common/guards/admin.guard';
import { BackupService } from './backup.service';

@ApiTags('Backup')
@ApiBearerAuth()
@Controller('backup')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * GET /backup/stats
   * Statistik backup: total, sukses, gagal, jadwal berikutnya
   */
  @Get('stats')
  @ApiOperation({ summary: '[Admin] Statistik backup sistem' })
  async getStats() {
    return this.backupService.getStats();
  }

  /**
   * GET /backup
   * Daftar semua backup (paginasi)
   */
  @Get()
  @ApiOperation({ summary: '[Admin] Daftar semua backup' })
  async listBackups(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.backupService.listBackups(parseInt(page), parseInt(limit));
  }

  /**
   * POST /backup
   * Picu backup manual (tanpa menunggu jadwal cron)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Picu backup manual' })
  async triggerManualBackup() {
    const result = await this.backupService.createBackup();
    return {
      message: 'Backup berhasil dibuat',
      ...result,
      fileSizeKB: (result.fileSizeBytes / 1024).toFixed(1),
    };
  }

  /**
   * POST /backup/cleanup
   * Jalankan cleanup manual: hapus berkas & backup > 2 tahun
   */
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Jalankan cleanup data lama secara manual' })
  async triggerManualCleanup() {
    const [berkasResult, backupResult] = await Promise.all([
      this.backupService.deleteOldBerkas(),
      this.backupService.deleteOldBackups(),
    ]);

    return {
      message: 'Cleanup selesai',
      deletedBerkas: berkasResult.deletedCount,
      deletedBackups: backupResult.deletedCount,
    };
  }

  /**
   * GET /backup/:id/download
   * Download file backup JSON
   */
  @Get(':id/download')
  @ApiOperation({ summary: '[Admin] Download file backup' })
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
    const { filename, filePath, exists } = await this.backupService.getBackupFile(id);

    if (!exists) {
      throw new NotFoundException('File backup tidak ditemukan di server (mungkin sudah dihapus)');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  }

  /**
   * DELETE /backup/:id
   * Hapus satu backup secara manual
   */
  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Hapus backup tertentu' })
  async deleteBackup(@Param('id') id: string) {
    await this.backupService.deleteBackupById(id);
    return { message: 'Backup berhasil dihapus' };
  }
}

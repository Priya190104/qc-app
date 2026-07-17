import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { BerkasImportExportService } from '../services/berkas-import-export.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Berkas Import/Export')
@Controller('berkas/import-export')
export class BerkasImportExportController {
  constructor(private readonly importExportService: BerkasImportExportService) {}

  @Get('export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export berkas to Excel' })
  async exportBerkas(
    @Query('ids') ids?: string,
    @Query('search') search?: string,
    @Query('desa') desa?: string,
    @Query('kecamatan') kecamatan?: string,
    @Query('tahunBerkas') tahunBerkas?: string,
    @Query('tanggalDari') tanggalDari?: string,
    @Query('tanggalSampai') tanggalSampai?: string,
    @Res() res?: Response
  ) {
    // @Res() is always injected by NestJS — the optional type is required only
    // because TypeScript disallows a required param after optional @Query params.
    const response = res!;
    try {
      const berkasIds = ids ? ids.split(',').map((id) => id.trim()) : undefined;
      const result = await this.importExportService.exportToExcel({
        berkasIds,
        search,
        desa,
        kecamatan,
        tahunBerkas: tahunBerkas ? parseInt(tahunBerkas) : undefined,
        tanggalDari,
        tanggalSampai,
      });

      response.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      response.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      response.send(result.data);
    } catch (error: any) {
      if (!response.headersSent) {
        response.status(400).json({ success: false, message: `Export gagal: ${error.message}` });
      }
    }
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import berkas from Excel' })
  async importBerkas(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      return {
        success: false,
        message: 'File tidak ditemukan',
      };
    }

    // Validate file type
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return {
        success: false,
        message: 'Format file tidak didukung. Gunakan Excel (.xlsx, .xls) atau CSV (.csv)',
      };
    }

    return this.importExportService.importFromExcel(file.buffer, req.user.id);
  }
}

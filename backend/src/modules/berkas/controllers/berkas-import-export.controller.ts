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
    @Res() res: Response
  ) {
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

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(400).json({ success: false, message: `Export gagal: ${error.message}` });
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

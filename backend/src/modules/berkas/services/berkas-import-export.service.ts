import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { BerkasStatus } from '@prisma/client';
import * as XLSX from 'xlsx';

@Injectable()
export class BerkasImportExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Export berkas data to Excel
   */
  async exportToExcel(options?: {
    berkasIds?: string[];
    search?: string;
    desa?: string;
    kecamatan?: string;
    tahunBerkas?: number;
    tanggalDari?: string;
    tanggalSampai?: string;
  }) {
    try {
      const { berkasIds, search, desa, kecamatan, tahunBerkas, tanggalDari, tanggalSampai } =
        options || {};

      // Build where clause
      const where: any = {};

      if (berkasIds && berkasIds.length > 0) {
        where.id = { in: berkasIds };
      }

      if (search) {
        where.OR = [
          { nomor: { contains: search, mode: 'insensitive' } },
          { namaPemohon: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (desa) {
        where.desa = { contains: desa, mode: 'insensitive' };
      }

      if (kecamatan) {
        where.kecamatan = { contains: kecamatan, mode: 'insensitive' };
      }

      if (tahunBerkas) {
        where.tahunBerkas = tahunBerkas;
      }

      if (tanggalDari || tanggalSampai) {
        where.tanggalBerkas = {};
        if (tanggalDari) {
          where.tanggalBerkas.gte = new Date(tanggalDari);
        }
        if (tanggalSampai) {
          // Include full day of tanggalSampai
          const endDate = new Date(tanggalSampai);
          endDate.setHours(23, 59, 59, 999);
          where.tanggalBerkas.lte = endDate;
        }
      }

      const berkasList = await this.prisma.berkas.findMany({
        where,
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          petugasUkur: {
            select: { nama: true, nip: true },
          },
          puLapang: {
            select: { nama: true, nip: true },
          },
          petugasPemetaan: {
            select: { nama: true, nip: true },
          },
          petugasKKS: {
            select: { nama: true, nip: true },
          },
          history: {
            include: {
              User: {
                select: { firstName: true, lastName: true },
              },
            },
            orderBy: { changedAt: 'asc' },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform data for Excel
      const excelData = berkasList.map((berkas, index) => ({
        'No.': index + 1,
        'No. Berkas': berkas.nomor,
        'Nama Pemohon': berkas.namaPemohon || '',
        'Tanggal Masuk': berkas.tanggalBerkas
          ? new Date(berkas.tanggalBerkas).toLocaleDateString('id-ID')
          : '',
        'Tahun Berkas': berkas.tahunBerkas || '',
        Kegiatan: berkas.kegiatan || '',
        Desa: berkas.desa || '',
        Kecamatan: berkas.kecamatan || '',
        'Nama Prosedur': berkas.namaProsedur || '',
        'Luas Pendaftaran (m²)': berkas.luasPendaftaran?.toString() || '',
        'DI 302': berkas.di302 || '',
        'DI 305': berkas.di305 || '',
        'Petugas Ukur': berkas.petugasUkur
          ? `${berkas.petugasUkur.nama} (${berkas.petugasUkur.nip})`
          : '',
        'PU Lapang': berkas.puLapang ? `${berkas.puLapang.nama} (${berkas.puLapang.nip})` : '',
        'No. STP': berkas.noSTP || '',
        'Tgl. STP': berkas.tglSTP ? new Date(berkas.tglSTP).toLocaleDateString('id-ID') : '',
        'No. SHAT/NIBEL': berkas.noSHATNIBEL || '',
        'Petugas Pemetaan': berkas.petugasPemetaan
          ? `${berkas.petugasPemetaan.nama} (${berkas.petugasPemetaan.nip})`
          : '',
        'Luas Hasil Ukur (m²)': berkas.luasHasilUkur?.toString() || '',
        NIB: berkas.nib || '',
        NIBEL: berkas.nibel || '',
        'No. SU': berkas.noSU || '',
        'Jumlah Bidang': berkas.jumlahBidang?.toString() || '',
        KKS: berkas.petugasKKS
          ? `${berkas.petugasKKS.nama} (${berkas.petugasKKS.nip})`
          : berkas.kks || '',
        Status: berkas.status,
        Deskripsi: berkas.deskripsi || '',
        Pembuat: berkas.createdBy
          ? `${berkas.createdBy.firstName} ${berkas.createdBy.lastName}`
          : '',
        'Tanggal Dibuat': new Date(berkas.createdAt).toLocaleDateString('id-ID'),
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Berkas');

      // ── Sheet 2: History Berkas ──────────────────────────────────────
      const historyData: Record<string, any>[] = [];
      berkasList.forEach((berkas) => {
        if (berkas.history && berkas.history.length > 0) {
          berkas.history.forEach((h) => {
            historyData.push({
              'No. Berkas': berkas.nomor,
              'Nama Pemohon': berkas.namaPemohon || '',
              'Status Lama': h.oldStatus || '-',
              'Status Baru': h.newStatus || '-',
              Alasan: h.reason || '',
              'Diubah Oleh': h.User ? `${h.User.firstName} ${h.User.lastName}`.trim() : '',
              'Tanggal Perubahan': new Date(h.changedAt).toLocaleString('id-ID'),
            });
          });
        }
      });

      if (historyData.length > 0) {
        const wsHistory = XLSX.utils.json_to_sheet(historyData);
        XLSX.utils.book_append_sheet(wb, wsHistory, 'History Berkas');

        const historyColWidths = [
          { wch: 15 }, // No. Berkas
          { wch: 22 }, // Nama Pemohon
          { wch: 28 }, // Status Lama
          { wch: 28 }, // Status Baru
          { wch: 35 }, // Alasan
          { wch: 22 }, // Diubah Oleh
          { wch: 22 }, // Tanggal Perubahan
        ];
        wsHistory['!cols'] = historyColWidths;

        // Style header history sheet
        const historyHeaders = Object.keys(historyData[0]);
        for (let i = 0; i < historyHeaders.length; i++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
          if (wsHistory[cellRef]) {
            wsHistory[cellRef].s = {
              font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
              fill: { fgColor: { rgb: '2E7D32' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: {
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } },
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
              },
            };
          }
        }
        wsHistory['!freeze'] = { xSplit: 0, ySplit: 1 };
      }
      // ── End Sheet 2 ─────────────────────────────────────────────────

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // No.
        { wch: 15 }, // No. Berkas
        { wch: 22 }, // Nama Pemohon
        { wch: 15 }, // Tanggal Masuk
        { wch: 12 }, // Tahun Berkas
        { wch: 20 }, // Kegiatan
        { wch: 15 }, // Desa
        { wch: 15 }, // Kecamatan
        { wch: 22 }, // Nama Prosedur
        { wch: 20 }, // Luas Pendaftaran
        { wch: 12 }, // DI 302
        { wch: 12 }, // DI 305
        { wch: 28 }, // Petugas Ukur
        { wch: 28 }, // PU Lapang
        { wch: 15 }, // No. STP
        { wch: 15 }, // Tgl. STP
        { wch: 18 }, // No. SHAT/NIBEL
        { wch: 28 }, // Petugas Pemetaan
        { wch: 20 }, // Luas Hasil Ukur
        { wch: 15 }, // NIB
        { wch: 15 }, // NIBEL
        { wch: 15 }, // No. SU
        { wch: 15 }, // Jumlah Bidang
        { wch: 28 }, // KKS
        { wch: 14 }, // Status
        { wch: 30 }, // Deskripsi
        { wch: 20 }, // Pembuat
        { wch: 15 }, // Tanggal Dibuat
      ];
      ws['!cols'] = columnWidths;

      // Apply header styling and formatting
      const headers = Object.keys(excelData[0] || {});
      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
        },
      };

      const cellStyle = {
        alignment: { vertical: 'center', wrapText: true },
        border: {
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
        },
      };

      // Apply styles to cells
      for (let i = 0; i < headers.length; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
        ws[cellRef].s = headerStyle;
      }

      // Apply borders to data cells
      for (let row = 1; row <= excelData.length; row++) {
        for (let col = 0; col < headers.length; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellRef]) {
            ws[cellRef].s = cellStyle;
          }
        }
      }

      // Freeze header row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      // Write to buffer
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      return {
        success: true,
        message: `${berkasList.length} berkas berhasil diexport`,
        data: buffer,
        filename: `Data_Berkas_${new Date().getTime()}.xlsx`,
      };
    } catch (error: any) {
      throw new BadRequestException(`Export gagal: ${error.message}`);
    }
  }

  /**
   * Import berkas data from Excel
   */
  async importFromExcel(fileBuffer: Buffer, userId: string) {
    try {
      // Read workbook
      const wb = XLSX.read(fileBuffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);

      if (!Array.isArray(data) || data.length === 0) {
        throw new BadRequestException('File Excel kosong atau format tidak valid');
      }

      // Validate required columns
      const requiredColumns = ['No. Berkas', 'Nama Pemohon'];
      const firstRow = data[0] as Record<string, any>;
      const hasRequiredColumns = requiredColumns.every((col) => col in firstRow);

      if (!hasRequiredColumns) {
        throw new BadRequestException(`Excel harus memiliki kolom: ${requiredColumns.join(', ')}`);
      }

      // Transform and validate data
      const imported = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i] as Record<string, any>;
          const nomor = row['No. Berkas']?.toString().trim();

          if (!nomor) {
            errors.push(`Baris ${i + 2}: No. Berkas tidak boleh kosong`);
            continue;
          }

          // Check if nomor already exists among non-closed berkas
          const existing = await this.prisma.berkas.findFirst({
            where: {
              nomor,
              isClosed: false,
            },
          });

          if (existing) {
            errors.push(`Baris ${i + 2}: No. Berkas ${nomor} sudah ada di database`);
            continue;
          }

          // Parse date
          let tanggalBerkas = null;
          if (row['Tanggal Masuk']) {
            try {
              tanggalBerkas = new Date(row['Tanggal Masuk']);
              if (isNaN(tanggalBerkas.getTime())) {
                tanggalBerkas = null;
              }
            } catch {
              tanggalBerkas = null;
            }
          }

          // Parse tahun berkas
          let tahunBerkas = null;
          if (row['Tahun Berkas']) {
            const tahun = parseInt(row['Tahun Berkas'], 10);
            if (!isNaN(tahun)) {
              tahunBerkas = tahun;
            }
          }

          // Parse luas pendaftaran
          let luasPendaftaran = null;
          if (row['Luas Pendaftaran']) {
            const luas = BigInt(row['Luas Pendaftaran']);
            if (luas > 0n) {
              luasPendaftaran = luas;
            }
          }

          imported.push({
            nomor,
            nama: row['Nama Pemohon']?.toString().trim() || 'Data dari Import',
            namaPemohon: row['Nama Pemohon']?.toString().trim(),
            kegiatan: row['Kegiatan']?.toString().trim(),
            tanggalBerkas,
            tahunBerkas,
            desa: row['Desa']?.toString().trim(),
            kecamatan: row['Kecamatan']?.toString().trim(),
            namaProsedur: row['Nama Prosedur']?.toString().trim(),
            luasPendaftaran,
            di302: row['DI 302']?.toString().trim(),
            di305: row['DI 305']?.toString().trim(),
            kks: row['KKS']?.toString().trim(),
            deskripsi: row['Deskripsi']?.toString().trim(),
            status: (row['Status']?.toString().trim() as BerkasStatus) || BerkasStatus.DIBUAT,
            createdById: userId,
          });
        } catch (error: any) {
          errors.push(`Baris ${i + 2}: ${error.message}`);
        }
      }

      if (imported.length === 0) {
        throw new BadRequestException(
          `Tidak ada data valid untuk diimport. Errors: ${errors.join('; ')}`
        );
      }

      // Bulk create
      const created = await this.prisma.berkas.createMany({
        data: imported,
        skipDuplicates: true,
      });

      return {
        success: true,
        message: `${created.count} berkas berhasil diimport`,
        data: {
          imported: created.count,
          total: data.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(`Import gagal: ${error.message}`);
    }
  }
}

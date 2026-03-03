import { Module } from '@nestjs/common';
import { BerkasService } from './services/berkas.service';
import { BerkasImportExportService } from './services/berkas-import-export.service';
import { BerkasWorkflowService } from './services/berkas-workflow.service';
import { BerkasController } from './controllers/berkas.controller';
import { BerkasImportExportController } from './controllers/berkas-import-export.controller';
import { BerkasWorkflowController } from './controllers/berkas-workflow.controller';
import { PrismaModule } from '@/config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BerkasController, BerkasImportExportController, BerkasWorkflowController],
  providers: [BerkasService, BerkasImportExportService, BerkasWorkflowService],
  exports: [BerkasService, BerkasImportExportService, BerkasWorkflowService],
})
export class BerkasModule {}

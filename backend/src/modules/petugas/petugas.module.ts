import { Module } from '@nestjs/common';
import { PetugasService } from './services/petugas.service';
import { PetugasController } from './controllers/petugas.controller';
import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PetugasController],
  providers: [PetugasService],
  exports: [PetugasService],
})
export class PetugasModule {}

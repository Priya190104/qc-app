import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreatePetugasDto } from '../dto/create-petugas.dto';
import { UpdatePetugasDto } from '../dto/update-petugas.dto';

@Injectable()
export class PetugasService {
  constructor(private prisma: PrismaService) {}

  async create(createPetugasDto: CreatePetugasDto) {
    // Check if NIP + departemen combination already exists
    const existingPetugas = await this.prisma.petugas.findFirst({
      where: {
        nip: createPetugasDto.nip,
        departemen: createPetugasDto.departemen ?? null,
      },
    });

    if (existingPetugas) {
      throw new BadRequestException(
        'Petugas dengan NIP ini sudah terdaftar di departemen yang sama'
      );
    }

    const petugas = await this.prisma.petugas.create({
      data: {
        nama: createPetugasDto.nama,
        nip: createPetugasDto.nip,
        departemen: createPetugasDto.departemen,
        isActive: createPetugasDto.isActive !== false,
      },
    });

    return petugas;
  }

  async findAll(page = 1, limit = 20, isActive?: boolean, departemen?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (departemen) {
      where.departemen = departemen;
    }

    const [petugas, total] = await Promise.all([
      this.prisma.petugas.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      this.prisma.petugas.count({ where }),
    ]);

    return {
      data: petugas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const petugas = await this.prisma.petugas.findUnique({
      where: { id },
    });

    if (!petugas) {
      throw new NotFoundException('Petugas not found');
    }

    return petugas;
  }

  async update(id: string, updatePetugasDto: UpdatePetugasDto) {
    const petugas = await this.prisma.petugas.findUnique({
      where: { id },
    });

    if (!petugas) {
      throw new NotFoundException('Petugas not found');
    }

    // Check if updated NIP + departemen combination is already used by another petugas
    const newNip = updatePetugasDto.nip ?? petugas.nip;
    const newDepartemen =
      updatePetugasDto.departemen !== undefined ? updatePetugasDto.departemen : petugas.departemen;

    if (newNip !== petugas.nip || newDepartemen !== petugas.departemen) {
      const existingCombination = await this.prisma.petugas.findFirst({
        where: {
          nip: newNip,
          departemen: newDepartemen ?? null,
          NOT: { id },
        },
      });

      if (existingCombination) {
        throw new BadRequestException(
          'Petugas dengan NIP ini sudah terdaftar di departemen yang sama'
        );
      }
    }

    const updatedPetugas = await this.prisma.petugas.update({
      where: { id },
      data: {
        nama: updatePetugasDto.nama,
        nip: updatePetugasDto.nip,
        departemen: updatePetugasDto.departemen,
        isActive: updatePetugasDto.isActive,
      },
    });

    return updatedPetugas;
  }

  async delete(id: string) {
    const petugas = await this.prisma.petugas.findUnique({
      where: { id },
    });

    if (!petugas) {
      throw new NotFoundException('Petugas not found');
    }

    await this.prisma.petugas.delete({
      where: { id },
    });

    return { message: 'Petugas deleted successfully' };
  }
}

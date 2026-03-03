import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreatePetugasDto } from '../dto/create-petugas.dto';
import { UpdatePetugasDto } from '../dto/update-petugas.dto';

@Injectable()
export class PetugasService {
  constructor(private prisma: PrismaService) {}

  async create(createPetugasDto: CreatePetugasDto) {
    // Check if NIP already exists
    const existingPetugas = await this.prisma.petugas.findUnique({
      where: { nip: createPetugasDto.nip },
    });

    if (existingPetugas) {
      throw new BadRequestException('NIP already exists');
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
        orderBy: { createdAt: 'desc' },
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

    // Check if NIP is being updated and if it's already used by another petugas
    if (updatePetugasDto.nip && updatePetugasDto.nip !== petugas.nip) {
      const existingNip = await this.prisma.petugas.findUnique({
        where: { nip: updatePetugasDto.nip },
      });

      if (existingNip) {
        throw new BadRequestException('NIP already exists');
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

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    // Check if role name already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new BadRequestException('Role name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        permissions: createRoleDto.permissions || [],
        isActive: createRoleDto.isActive !== false,
      },
    });

    return role;
  }

  async findAll(page = 1, limit = 20, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        description: updateRoleDto.description,
        permissions: updateRoleDto.permissions,
        isActive: updateRoleDto.isActive,
      },
    });

    return updatedRole;
  }

  async delete(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.userRoles.length > 0) {
      throw new BadRequestException('Cannot delete role with active users');
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }
}

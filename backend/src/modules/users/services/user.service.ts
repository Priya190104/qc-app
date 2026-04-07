import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { BerkasStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user with roles
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phoneNumber: createUserDto.phoneNumber,
        roles: createUserDto.roleIds
          ? {
              create: createUserDto.roleIds.map((roleId) => ({
                roleId,
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.formatUserResponse(user);
  }

  async findAll(page = 1, limit = 20, search?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user: any) => this.formatUserResponse(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user and roles
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        phoneNumber: updateUserDto.phoneNumber,
        isActive: updateUserDto.isActive,
        ...(hashedPassword && { password: hashedPassword }),
        roles: updateUserDto.roleIds
          ? {
              deleteMany: {}, // Delete all current roles
              create: updateUserDto.roleIds.map((roleId) => ({
                roleId,
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.formatUserResponse(updatedUser);
  }

  async delete(id: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has active berkas
    const berkasCount = await this.prisma.berkas.count({
      where: {
        createdById: id,
        status: { not: BerkasStatus.SELESAI },
      },
    });

    if (berkasCount > 0) {
      throw new BadRequestException('Cannot delete user with active berkas');
    }

    // Delete user (cascade delete roles)
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password changed successfully' };
  }

  private formatUserResponse(user: any) {
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      roles: userWithoutPassword.roles
        ? userWithoutPassword.roles.map((ur: any) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: ur.role.permissions,
          }))
        : [],
    };
  }
}

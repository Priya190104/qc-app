import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateUmuxDto } from './dto/create-umux.dto';

/** UMUX-Lite score formula: ((Q1 + Q3 + (8−Q2) + (8−Q4)) − 4) / 24 × 100 */
function calcUmuxScore(q1: number, q2: number, q3: number, q4: number): number {
  return Math.round(((q1 + q3 + (8 - q2) + (8 - q4) - 4) / 24) * 100);
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submitUmux(userId: string, dto: CreateUmuxDto) {
    const score = calcUmuxScore(dto.q1, dto.q2, dto.q3, dto.q4);
    const response = await this.prisma.umuxResponse.create({
      data: {
        userId,
        q1: dto.q1,
        q2: dto.q2,
        q3: dto.q3,
        q4: dto.q4,
        score,
      },
    });
    return response;
  }

  async findAll(limit = 1000) {
    const responses = await this.prisma.umuxResponse.findMany({
      take: Math.min(limit, 5000),
      orderBy: { submittedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roles: {
              select: {
                role: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return responses.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: `${r.user.firstName} ${r.user.lastName}`.trim(),
      userEmail: r.user.email,
      userRole: r.user.roles[0]?.role?.name ?? '',
      responses: { q1: r.q1, q2: r.q2, q3: r.q3, q4: r.q4 },
      score: r.score,
      submittedAt: r.submittedAt,
    }));
  }
}

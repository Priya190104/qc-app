import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateUmuxDto } from './dto/create-umux.dto';

/** UMUX-Lite score formula: ((q1−1) + (7−q2) + (q3−1) + (7−q4)) / 24 × 100, rounded to 1 decimal place */
function calcUmuxScore(q1: number, q2: number, q3: number, q4: number): number {
  return Math.round(((q1 - 1 + (7 - q2) + (q3 - 1) + (7 - q4)) / 24) * 1000) / 10;
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submitUmux(userId: string, dto: CreateUmuxDto) {
    const score = calcUmuxScore(dto.q1, dto.q2, dto.q3, dto.q4);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        roles: { select: { role: { select: { name: true } } }, take: 1 },
      },
    });

    const response = await this.prisma.umuxResponse.create({
      data: {
        userId,
        q1: dto.q1,
        q2: dto.q2,
        q3: dto.q3,
        q4: dto.q4,
        score,
        snapshotName: user ? `${user.firstName} ${user.lastName}`.trim() : null,
        snapshotEmail: user?.email ?? null,
        snapshotRole: user?.roles[0]?.role?.name ?? null,
      },
    });
    return response;
  }

  /**
   * Returns whether the given user has already submitted a UMUX survey
   * during the current calendar month.
   * Used by the frontend to decide whether to display the survey popup.
   */
  async getStatus(userId: string): Promise<{ hasSurveyedThisMonth: boolean }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const count = await this.prisma.umuxResponse.count({
      where: {
        userId,
        submittedAt: { gte: startOfMonth },
      },
    });

    return { hasSurveyedThisMonth: count > 0 };
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
      userName: r.user
        ? `${r.user.firstName} ${r.user.lastName}`.trim()
        : (r.snapshotName ?? '[Akun Dihapus]'),
      userEmail: r.user?.email ?? r.snapshotEmail ?? '',
      userRole: r.user?.roles[0]?.role?.name ?? '',
      responses: { q1: r.q1, q2: r.q2, q3: r.q3, q4: r.q4 },
      score: r.score,
      submittedAt: r.submittedAt,
    }));
  }
}

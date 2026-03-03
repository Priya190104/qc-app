import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../config/prisma.service';

/**
 * Extracts JWT from either:
 * 1. Authorization: Bearer <token>  header (standard, backward compatible)
 * 2. accessToken httpOnly cookie     (more secure — not accessible by JS)
 *
 * The extractor tries each option in order and uses the first non-null result.
 */
const extractJwtFromCookieOrHeader = (req: any): string | null => {
  // Try httpOnly cookie first
  if (req?.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  // Fallback to Bearer token in Authorization header
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      // passReqToCallback required so our extractor can read req.cookies
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((ur: any) => ur.role.name),
      permissions: this.mergePermissions(user.roles),
    };
  }

  private mergePermissions(userRoles: any[]): string[] {
    const permissions = new Set<string>();

    userRoles.forEach((userRole) => {
      const rolePermissions = userRole.role.permissions as string[];
      rolePermissions.forEach((permission) => permissions.add(permission));
    });

    return Array.from(permissions);
  }
}

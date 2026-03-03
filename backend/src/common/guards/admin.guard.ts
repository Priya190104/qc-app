import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Guards an endpoint so only users with role 'Administrator' or 'Admin' can access it.
 * Must be used AFTER JwtAuthGuard (which populates request.user).
 *
 * Example:
 *   @UseGuards(JwtAuthGuard, AdminGuard)
 *   @Get('backup')
 *   listBackups() {}
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Akses ditolak');
    }

    const roles: string[] = (user.roles ?? []).map((r: string) => r.toLowerCase().trim());

    const isAdmin = roles.some((r) => r === 'administrator' || r === 'admin');

    if (!isAdmin) {
      throw new ForbiddenException('Hanya Administrator yang dapat mengakses fitur ini');
    }

    return true;
  }
}

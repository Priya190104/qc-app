import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  getMetrics(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.dashboardService.getMetrics(dateFrom, dateTo);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get user activities' })
  getActivities(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string
  ) {
    return this.dashboardService.getActivities(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      userId
    );
  }

  @Get('recent-changes')
  @ApiOperation({ summary: 'Get recent berkas changes' })
  getRecentChanges(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentChanges(limit ? parseInt(limit) : 10);
  }

  @Get('petugas-stats')
  @ApiOperation({ summary: 'Get petugas statistics' })
  getPetugasStats() {
    return this.dashboardService.getPetugasStats();
  }

  @Get('petugas-berkas')
  @ApiOperation({ summary: 'Get berkas list for a specific petugas' })
  getPetugasBerkas(
    @Query('petugasId') petugasId: string,
    @Query('tipe') tipe: 'ukur' | 'pemetaan'
  ) {
    return this.dashboardService.getPetugasBerkas(petugasId, tipe);
  }
}

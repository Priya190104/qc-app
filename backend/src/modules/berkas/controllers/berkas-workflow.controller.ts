import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BerkasWorkflowService } from '../services/berkas-workflow.service';
import {
  TransitionBerkasDto,
  AssignKKSDto,
  ApproveBerkasDto,
  ReviseBerkasDto,
  UpdateDataUkurDto,
  ValidatePengukuranDto,
  UpdateDataPemetaanDto,
  ValidatePemetaanDto,
} from '../dto/workflow.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { BerkasStatus } from '@prisma/client';

@ApiTags('Berkas Workflow')
@Controller('berkas/workflow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BerkasWorkflowController {
  constructor(private readonly workflowService: BerkasWorkflowService) {}

  /**
   * Get berkas by status for specific role pages
   */
  @Get('status/:status')
  @ApiOperation({ summary: 'Get berkas by status for role-specific pages' })
  async getBerkasByStatus(@Param('status') status: string) {
    return this.workflowService.getBerkasByStatus(status as BerkasStatus);
  }

  /**
   * Generic transition endpoint (for testing/admin)
   */
  @Post(':id/transition')
  @ApiOperation({ summary: 'Transition berkas to new status' })
  async transitionStatus(
    @Param('id') id: string,
    @Body() transitionDto: TransitionBerkasDto,
    @Request() req: any
  ) {
    return this.workflowService.transitionStatus(id, transitionDto, req.user.id);
  }

  /**
   * OPERATOR DATA UKUR endpoints
   */
  @Put(':id/operator-ukur/update')
  @ApiOperation({ summary: '[Operator Data Ukur] Update data ukur' })
  async updateDataUkur(
    @Param('id') id: string,
    @Body() updateDto: UpdateDataUkurDto,
    @Request() req: any
  ) {
    return this.workflowService.updateDataUkur(id, updateDto, req.user.id);
  }

  @Post(':id/operator-ukur/lanjutkan')
  @ApiOperation({ summary: '[Operator Data Ukur] Lanjutkan ke Petugas Ukur' })
  async lanjutkanKePetugasUkur(@Param('id') id: string, @Request() req: any) {
    return this.workflowService.lanjutkanKePetugasUkur(id, req.user.id);
  }

  /**
   * PETUGAS UKUR endpoints
   */
  @Post(':id/petugas-ukur/validate')
  @ApiOperation({ summary: '[Petugas Ukur] Validate pengukuran' })
  async validatePengukuran(
    @Param('id') id: string,
    @Body() validateDto: ValidatePengukuranDto,
    @Request() req: any
  ) {
    return this.workflowService.validatePengukuran(id, validateDto, req.user.id);
  }

  /**
   * OPERATOR DATA PEMETAAN endpoints
   */
  @Put(':id/operator-pemetaan/update')
  @ApiOperation({ summary: '[Operator Data Pemetaan] Update data pemetaan' })
  async updateDataPemetaan(
    @Param('id') id: string,
    @Body() updateDto: UpdateDataPemetaanDto,
    @Request() req: any
  ) {
    return this.workflowService.updateDataPemetaan(id, updateDto, req.user.id);
  }

  @Post(':id/operator-pemetaan/lanjutkan')
  @ApiOperation({ summary: '[Operator Data Pemetaan] Lanjutkan ke Petugas Pemetaan' })
  async lanjutkanKePetugasPemetaan(@Param('id') id: string, @Request() req: any) {
    return this.workflowService.lanjutkanKePetugasPemetaan(id, req.user.id);
  }

  /**
   * PETUGAS PEMETAAN endpoints
   */
  @Post(':id/petugas-pemetaan/validate')
  @ApiOperation({ summary: '[Petugas Pemetaan] Validate pemetaan' })
  async validatePemetaan(
    @Param('id') id: string,
    @Body() validateDto: ValidatePemetaanDto,
    @Request() req: any
  ) {
    return this.workflowService.validatePemetaan(id, validateDto, req.user.id);
  }

  /**
   * OPERATOR DATA BERKAS - KKS Assignment
   */
  @Post(':id/assign-kks')
  @ApiOperation({ summary: '[Operator Data Berkas] Assign KKS to berkas' })
  async assignKKS(@Param('id') id: string, @Body() assignDto: AssignKKSDto, @Request() req: any) {
    return this.workflowService.assignKKS(id, assignDto, req.user.id);
  }

  /**
   * KKS endpoints
   */
  @Post(':id/kks/approve')
  @ApiOperation({ summary: '[KKS] Approve berkas (ACC)' })
  async approveByKKS(
    @Param('id') id: string,
    @Body() approveDto: ApproveBerkasDto,
    @Request() req: any
  ) {
    return this.workflowService.approveByKKS(id, approveDto, req.user.id);
  }

  @Post(':id/kks/revise')
  @ApiOperation({ summary: '[KKS] Revise berkas with target selection' })
  async reviseByKKS(
    @Param('id') id: string,
    @Body() reviseDto: ReviseBerkasDto,
    @Request() req: any
  ) {
    return this.workflowService.reviseByKKS(id, reviseDto, req.user.id);
  }

  /**
   * KEPALA SEKSI endpoints
   */
  @Post(':id/kepala-seksi/approve')
  @ApiOperation({ summary: '[Kepala Seksi] Approve berkas (ACC)' })
  async approveByKepalaSeksi(
    @Param('id') id: string,
    @Body() approveDto: ApproveBerkasDto,
    @Request() req: any
  ) {
    return this.workflowService.approveByKepalaSeksi(id, approveDto, req.user.id);
  }

  @Post(':id/kepala-seksi/revise')
  @ApiOperation({ summary: '[Kepala Seksi] Revise berkas with target selection' })
  async reviseByKepalaSeksi(
    @Param('id') id: string,
    @Body() reviseDto: ReviseBerkasDto,
    @Request() req: any
  ) {
    return this.workflowService.reviseByKepalaSeksi(id, reviseDto, req.user.id);
  }

  /**
   * Get berkas history/timeline
   */
  @Get(':id/history')
  @ApiOperation({ summary: 'Get berkas workflow history' })
  async getBerkasHistory(@Param('id') id: string) {
    return this.workflowService.getBerkasHistory(id);
  }
}

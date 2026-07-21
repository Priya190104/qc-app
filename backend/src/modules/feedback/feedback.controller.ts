import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/common/guards/admin.guard';
import { FeedbackService } from './feedback.service';
import { CreateUmuxDto } from './dto/create-umux.dto';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('umux')
  @ApiOperation({ summary: 'Submit respons survei UMUX' })
  async submitUmux(@Request() req: any, @Body() dto: CreateUmuxDto) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.feedbackService.submitUmux(userId, dto);
  }

  @Get('umux/status')
  @ApiOperation({ summary: 'Cek status pengisian UMUX bulan berjalan' })
  async getStatus(@Request() req: any) {
    const userId = req.user?.sub ?? req.user?.id;
    return this.feedbackService.getStatus(userId);
  }

  @Get('umux')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Ambil semua respons UMUX (admin only)' })
  async findAll(@Query('limit', new DefaultValuePipe(1000), ParseIntPipe) limit: number) {
    const data = await this.feedbackService.findAll(limit);
    return { data };
  }
}

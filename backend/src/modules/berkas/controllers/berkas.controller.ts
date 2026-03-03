import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BerkasService } from '../services/berkas.service';
import { CreateBerkasDto, UpdateBerkasDto } from '../dto/berkas.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Berkas')
@Controller('berkas')
export class BerkasController {
  constructor(private readonly berkasService: BerkasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new berkas' })
  async create(@Body() createBerkasDto: CreateBerkasDto, @Request() req: any) {
    return this.berkasService.create(createBerkasDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all berkas with pagination and filter' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by nomor or nama pemohon',
  })
  @ApiQuery({ name: 'desa', required: false, type: String, description: 'Filter by desa' })
  @ApiQuery({
    name: 'kecamatan',
    required: false,
    type: String,
    description: 'Filter by kecamatan',
  })
  @ApiQuery({
    name: 'tahunBerkas',
    required: false,
    type: Number,
    description: 'Filter by tahun berkas',
  })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({
    name: 'includeClosed',
    required: false,
    type: String,
    description: 'Include closed berkas (true/false)',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('desa') desa?: string,
    @Query('kecamatan') kecamatan?: string,
    @Query('tahunBerkas') tahunBerkas?: string,
    @Query('status') status?: string,
    @Query('includeClosed') includeClosed?: string
  ) {
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      desa,
      kecamatan,
      tahunBerkas: tahunBerkas ? parseInt(tahunBerkas) : undefined,
      status,
      includeClosed: includeClosed === 'true',
    };
    return this.berkasService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get berkas by id' })
  async findById(@Param('id') id: string) {
    return this.berkasService.findById(id);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get berkas by status' })
  async findByStatus(@Param('status') status: string) {
    return this.berkasService.findByStatus(status);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close berkas (soft delete)' })
  async close(@Param('id') id: string, @Request() req: any) {
    return this.berkasService.closeBerkas(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update berkas by id' })
  async update(
    @Param('id') id: string,
    @Body() updateBerkasDto: UpdateBerkasDto,
    @Request() req: any
  ) {
    return this.berkasService.update(id, updateBerkasDto, req.user.id);
  }
}

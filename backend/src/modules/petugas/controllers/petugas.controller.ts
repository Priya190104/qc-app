import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { PetugasService } from '../services/petugas.service';
import { CreatePetugasDto } from '../dto/create-petugas.dto';
import { UpdatePetugasDto } from '../dto/update-petugas.dto';

@ApiTags('Petugas')
@ApiBearerAuth()
@Controller('petugas')
@UseGuards(JwtAuthGuard)
export class PetugasController {
  constructor(private petugasService: PetugasService) {}

  @Post()
  @ApiOperation({ summary: 'Create new petugas' })
  create(@Body(ValidationPipe) createPetugasDto: CreatePetugasDto) {
    return this.petugasService.create(createPetugasDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all petugas' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
    @Query('departemen') departemen?: string,
  ) {
    return this.petugasService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      isActive ? isActive === 'true' : undefined,
      departemen,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get petugas by ID' })
  findById(@Param('id') id: string) {
    return this.petugasService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update petugas' })
  update(@Param('id') id: string, @Body(ValidationPipe) updatePetugasDto: UpdatePetugasDto) {
    return this.petugasService.update(id, updatePetugasDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete petugas' })
  delete(@Param('id') id: string) {
    return this.petugasService.delete(id);
  }
}

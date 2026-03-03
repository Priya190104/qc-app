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
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  create(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('isActive') isActive?: string) {
    return this.roleService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      isActive ? isActive === 'true' : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  findById(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body(ValidationPipe) updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}

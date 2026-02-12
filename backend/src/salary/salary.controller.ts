import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateMonthlySalaryDto } from './dto/create-salary.dto';
import { UpdateMonthlySalaryDto } from './dto/update-salary.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';

@Controller('salary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createSalaryDto: CreateMonthlySalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('month') month?: string, @Query('userId') userId?: string) {
    return this.salaryService.findAll(month, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateSalaryDto: UpdateMonthlySalaryDto) {
    return this.salaryService.update(id, updateSalaryDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.salaryService.remove(id);
  }
}

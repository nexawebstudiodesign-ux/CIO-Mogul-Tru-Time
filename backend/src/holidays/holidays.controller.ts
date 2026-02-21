import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Controller('holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaysController {
  constructor(private holidaysService: HolidaysService) {}

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  list() {
    return this.holidaysService.listHolidays();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateHolidayDto) {
    return this.holidaysService.createHoliday(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.holidaysService.updateHoliday(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.holidaysService.deleteHoliday(id);
  }
}

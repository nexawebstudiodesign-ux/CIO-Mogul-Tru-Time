import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.USER)
  create(@Req() req: { user?: { id?: string } }, @Body() dto: CreateAttendanceDto) {
    return this.attendanceService.createAttendance(req.user?.id ?? '', dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  list(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.listAttendance(query);
  }

  @Get('me')
  @Roles(Role.USER)
  listMine(@Req() req: { user?: { id?: string } }) {
    return this.attendanceService.listMyAttendance(req.user?.id ?? '');
  }
}

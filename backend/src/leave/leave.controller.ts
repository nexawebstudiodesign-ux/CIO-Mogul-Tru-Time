import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { AdminCreateLeaveDto } from './dto/admin-create-leave.dto';
import { AdminUpdateLeaveDto } from './dto/admin-update-leave.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';

@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post()
  @Roles(Role.USER)
  apply(@Req() req: { user?: { id?: string } }, @Body() dto: ApplyLeaveDto) {
    return this.leaveService.applyLeave(req.user?.id ?? '', dto);
  }

  @Get('me')
  @Roles(Role.USER)
  listMine(@Req() req: { user?: { id?: string } }) {
    return this.leaveService.listMyLeaves(req.user?.id ?? '');
  }

  @Delete('cancel/:id')
  @Roles(Role.USER)
  cancelLeave(@Req() req: { user?: { id?: string } }, @Param('id') id: string) {
    return this.leaveService.cancelLeave(req.user?.id ?? '', id);
  }

  @Get()
  @Roles(Role.ADMIN)
  listAll(@Query('status') status?: string) {
    return this.leaveService.listAllLeaves(status);
  }

  @Post('admin')
  @Roles(Role.ADMIN)
  adminCreate(@Body() dto: AdminCreateLeaveDto) {
    return this.leaveService.adminCreateLeave(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateLeaveDto) {
    return this.leaveService.adminUpdateLeave(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  adminDelete(@Param('id') id: string) {
    return this.leaveService.adminDeleteLeave(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeaveStatusDto) {
    return this.leaveService.updateStatus(id, dto);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: { user?: { id?: string } }) {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedException('Invalid session')
    }
    return this.usersService.getMe(userId)
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  list() {
    return this.usersService.listUsers();
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Delete(':id/permanent')
  @Roles(Role.ADMIN)
  removePermanently(@Param('id') id: string) {
    return this.usersService.permanentlyDeleteUser(id);
  }

  @Patch(':id/restore')
  @Roles(Role.ADMIN)
  restore(@Param('id') id: string) {
    return this.usersService.restoreUser(id);
  }

  @Patch(':id/leave-balance')
  @Roles(Role.ADMIN)
  updateLeaveBalance(@Param('id') id: string, @Body() dto: UpdateLeaveBalanceDto) {
    return this.usersService.updateLeaveBalance(id, dto);
  }

  @Post(':id/reset-password')
  @Roles(Role.ADMIN)
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto);
  }
}

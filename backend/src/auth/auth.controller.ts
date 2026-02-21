import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminSignupDto } from './dto/admin-signup.dto';
import { AdminPasswordLoginDto } from './dto/admin-password-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin-signup')
  adminSignup(@Body() dto: AdminSignupDto) {
    return this.authService.adminSignup(dto);
  }

  @Post('admin-password-login')
  adminPasswordLogin(@Body() dto: AdminPasswordLoginDto) {
    return this.authService.adminPasswordLogin(dto);
  }
}

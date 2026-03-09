import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { EmailLoginDto } from './dto/email-login.dto';
import { AdminSignupDto } from './dto/admin-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('email-login')
  emailLogin(@Body() dto: EmailLoginDto) {
    return this.authService.emailLogin(dto);
  }

  @Post('admin-signup')
  adminSignup(@Body() dto: AdminSignupDto) {
    return this.authService.adminSignup(dto);
  }


}

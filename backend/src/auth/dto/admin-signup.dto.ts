import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminSignupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  setupToken: string;
}

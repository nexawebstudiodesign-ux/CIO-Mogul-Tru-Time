import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  leaveBalance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  casualBalance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sickBalance?: number;
}

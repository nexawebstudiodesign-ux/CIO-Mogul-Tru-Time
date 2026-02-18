import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  casualBalance?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sickBalance?: number;
}

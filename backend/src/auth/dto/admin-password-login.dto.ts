import { IsString, MinLength } from 'class-validator';

export class AdminPasswordLoginDto {
  @IsString()
  @MinLength(4)
  password: string;
}

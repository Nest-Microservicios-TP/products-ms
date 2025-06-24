import { PartialType } from '@nestjs/mapped-types';
import { CreateUserCartDto } from './create-user-cart.dto';
import { IsDate, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateUserCartDto extends PartialType(CreateUserCartDto) {
  @IsNumber()
  @IsPositive()
  id: number
}

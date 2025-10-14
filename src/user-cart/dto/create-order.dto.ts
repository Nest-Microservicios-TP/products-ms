import { Type } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";

export class CreateOrderDto {
  
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public userId: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public productId: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public quantity: number;

  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @IsPositive()
  @Type(() => Number)
  public totalPrice: number;
}

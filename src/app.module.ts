import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UserCartModule } from './user-cart/user-cart.module';

@Module({
  imports: [ProductsModule,  UserCartModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

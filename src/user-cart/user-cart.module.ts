import { Module } from '@nestjs/common';
import { UserCartService } from './user-cart.service';
import { UserCartController } from './user-cart.controller';
import { ProductsModule } from 'src/products/products.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, envs, ORDER_SERVICE } from 'src/config';

@Module({
  controllers: [UserCartController],
  providers: [UserCartService],
  imports: [ProductsModule,
     ClientsModule.register([

      { 
        name: AUTH_SERVICE, 
        transport: Transport.TCP,
        options: {
          host: envs.auth_ms_host,
          port: envs.auth_ms_port
        }
      }
      
    
    ]),
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.order_ms_host,
          port: envs.order_ms_port
        }
      },
    ])
  ]
})
export class UserCartModule {}

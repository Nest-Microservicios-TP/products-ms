import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserCartDto } from './dto/create-user-cart.dto';
import { UpdateUserCartDto } from './dto/update-user-cart.dto';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserCartService extends PrismaClient implements OnModuleInit{


  private readonly logger = new Logger('CartService')
  
    onModuleInit() {
      this.$connect()
      this.logger.log('Database Connected')
    }
  


  async create(createUserCartDto: CreateUserCartDto) {
    return await this.cart.create({data: createUserCartDto})
  }

  async findAll() {
    const carts = await this.cart.findMany()

    if (carts.length === 0) {
      throw new RpcException({
        message: `Carts Not Found`,
        status: HttpStatus.NOT_FOUND
      })
    }

    return carts;
  }

  async findOne(id: number) {
    const cart = await this.cart.findFirst({ where: { id } })

    if (!cart) {
      throw new RpcException({
        message: `Cart Not Found`,
        status: HttpStatus.NOT_FOUND
      })
    }

    return cart
  }

  async update(id: number, updateUserCartDto: UpdateUserCartDto) {

    const {id: __, ...data} = updateUserCartDto

    if (!updateUserCartDto) {
      throw new RpcException({
        message: `Send a valid Dto`,
        status: HttpStatus.BAD_REQUEST
      })
    }
    
     await this.findOne(id)

    return this.cart.update({
      where: {id},
      data: data
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    const cart = await this.cart.update({
      where: {id},
      data: {
        available: false
      }
    })

    return cart
  }
}

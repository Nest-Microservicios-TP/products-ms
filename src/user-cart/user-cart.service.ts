import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserCartDto } from './dto/create-user-cart.dto';
import { UpdateUserCartDto } from './dto/update-user-cart.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from 'src/products/products.service';
import { AUTH_SERVICE, ORDER_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class UserCartService extends PrismaClient implements OnModuleInit {

  constructor(
    @Inject(AUTH_SERVICE) private readonly userClient: ClientProxy,
    @Inject(ORDER_SERVICE) private readonly orderClient: ClientProxy,
    private readonly productsService: ProductsService
  ) {
    super();
  }

  private readonly logger = new Logger('CartService')

  onModuleInit() {
    this.$connect()
    this.logger.log('Database Connected')
  }



  async create(createUserCartDto: CreateUserCartDto) {
    //Verifico si el producto existe
    const product = await this.productsService.findOne(createUserCartDto.idProduct)

    //Verifico si el producto tiene stock
    if (product.stock < createUserCartDto.quantity) {
      throw new RpcException({
        message: `Not Enough Stock`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    //Verifico si el usuario existe
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'findUserById' }, { id: createUserCartDto.idUser })
    ).catch(() => {
      throw new RpcException({
        message: 'User Not Found',
        status: HttpStatus.NOT_FOUND,
      });
    });



    //Si tengo stock actualizo el producto
    await this.productsService.update(createUserCartDto.idProduct, { stock: product.stock - createUserCartDto.quantity })

    //Creo el carrito y le agrego el total de lo que va a costar
    return await this.cart.create({ data: { totalPrice: product.price * createUserCartDto.quantity, ...createUserCartDto } })
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

  async findAllByUser(idUser: number) {

    //Verifico si el usuario existe
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'findUserById' }, { id: idUser })
    ).catch(() => {
      throw new RpcException({
        message: 'User Not Found',
        status: HttpStatus.NOT_FOUND,
      });
    });

    const carts = await this.cart.findMany({ where: { idUser } })



    if (carts.length === 0) {
      throw new RpcException({
        message: `Carts Not Found`,
        status: HttpStatus.NOT_FOUND
      })
    }

    return carts
  }

  async update(id: number, updateUserCartDto: UpdateUserCartDto) {

    const { id: __, ...data } = updateUserCartDto

    if (!updateUserCartDto) {
      throw new RpcException({
        message: `Send a valid Dto`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    await this.findOne(id)

    return this.cart.update({
      where: { id },
      data: data
    })
  }

  async remove(id: number) {
    const beforeCart = await this.findOne(id)

    //Verifico si el carrito ya fue eliminado
    if (!beforeCart.available) {
      throw new RpcException({
        message: `Cart Already Deleted`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    //Le devuelvo el stock al producto
    const product = await this.productsService.findOne(beforeCart.idProduct)
    await this.productsService.update(beforeCart.idProduct, { stock: product.stock + beforeCart.quantity })

    //Deshabilito el carrito
    const afterCart = await this.cart.update({
      where: { id },
      data: {
        available: false
      }
    })

    return afterCart
  }

  async buyCart(id: number) {
    const beforeCart = await this.findOne(id)

    //Verifico si el carrito ya fue comprado
    if (!beforeCart.available) {
      throw new RpcException({
        message: `Cart Already Bougth`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    //Deshabilito el carrito y lo paso a comprado
    const cart = await this.cart.update({
      where: { id },
      data: {
        available: false,
        bought: true
      }
    })

    //Creo la factura

    try {
      const response = await firstValueFrom(
        this.orderClient.send(
          { cmd: 'createOrder' },
          {
            userId: cart.idUser,
            productId: cart.idProduct,
            quantity: cart.quantity,
            totalPrice: cart.totalPrice,
          },
        ),
      );


    } catch (err) {
      throw new RpcException({
        message: 'Failed Creating Order',
        status: HttpStatus.BAD_GATEWAY,
      });
    }

    return cart
  }
}

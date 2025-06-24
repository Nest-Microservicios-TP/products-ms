import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserCartService } from './user-cart.service';
import { CreateUserCartDto } from './dto/create-user-cart.dto';
import { UpdateUserCartDto } from './dto/update-user-cart.dto';

@Controller()
export class UserCartController {
  constructor(private readonly userCartService: UserCartService) {}

  @MessagePattern({cmd: 'createUserCart'})
  create(@Payload() createUserCartDto: CreateUserCartDto) {
    return this.userCartService.create(createUserCartDto);
  }

  @MessagePattern({cmd: 'findAllUserCart'})
  findAll() {
    return this.userCartService.findAll();
  }

  @MessagePattern({cmd: 'findOneUserCart'})
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.userCartService.findOne(id);
  }

  @MessagePattern({cmd: 'updateUserCart'})
  update(@Payload() updateUserCartDto: UpdateUserCartDto) {
    console.log(updateUserCartDto)
    return this.userCartService.update(updateUserCartDto.id, updateUserCartDto);
  }

  @MessagePattern({cmd: 'removeUserCart'})
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.userCartService.remove(id);
  }
}

import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getAllOrders() {
    return this.ordersService.getAll()
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getById(id)
  }

  @Post()
  async createOrder(@Body() orderDto: CreateOrderDto) {
    return this.ordersService.create(orderDto)
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() orderDto: UpdateOrderDto) {
    return this.ordersService.update(id, orderDto)
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.delete(id)
  }
}

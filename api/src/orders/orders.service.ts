import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Order, OrderDocument } from '../schemas/order.schema'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>) {}

  async getAll() {
    return this.orderModel.find()
  }

  async getById(id: string) {
    const order = await this.orderModel.findById(id)
    if (!order) throw new NotFoundException('Заказ не найден')
    return order
  }

  async create(orderDto: CreateOrderDto) {
    return await this.orderModel.create(orderDto)
  }

  async update(id: string, orderDto: UpdateOrderDto) {
    const order = await this.orderModel.findByIdAndUpdate(id, orderDto, { new: true })
    if (!order) {
      throw new NotFoundException('Заказ не найден')
    }
    return order
  }

  async delete(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id)
    if (!order) throw new NotFoundException('Заказ не найден')
    return { message: 'Заказ успешно удалён' }
  }
}

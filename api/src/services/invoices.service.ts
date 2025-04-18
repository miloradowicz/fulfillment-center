import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema'
import { CreateInvoiceDto, InvoiceServiceDto } from '../dto/create-invoice.dto'
import { UpdateInvoiceDto } from '../dto/update-invoice.dto'
import { CounterService } from './counter.service'
import { Service, ServiceDocument } from '../schemas/service.schema'

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Service.name) private readonly serviceModel: Model<ServiceDocument>,
    private readonly counterService: CounterService,
  ) {}

  private calculateTotalAmount(
    services: (InvoiceServiceDto & { type: 'внутренняя' | 'внешняя' })[],
    discount?: number,
  ): number {
    return services.reduce((total, { service_price = 0, service_amount = 1, type }) => {
      let finalPrice = service_price
      if (type === 'внутренняя' && discount && discount > 0) {
        finalPrice = service_price * (1 - discount / 100)
      }
      return total + (finalPrice * service_amount)
    }, 0)
  }

  private determineStatus(
    paid_amount: number = 0,
    totalAmount: number,
  ): 'в ожидании' | 'оплачено' | 'частично оплачено' {
    if (paid_amount === 0) {
      return 'в ожидании'
    } else if (paid_amount === totalAmount) {
      return 'оплачено'
    } else {
      return 'частично оплачено'
    }
  }

  async getAll() {
    return this.invoiceModel.find({ isArchived: false }).populate('client services.service').sort({ createdAt: -1 })
  }

  async getOne(id: string) {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('client services.service')
      .populate({ path: 'logs.user', select: '-password -token' })

    if (!invoice) throw new NotFoundException('Счёт не найден.')
    if (invoice.isArchived) throw new ForbiddenException('Счёт находится в архиве.')

    return invoice
  }

  async getArchived() {
    return this.invoiceModel.find({ isArchived: true }).populate('client services.service').sort({ createdAt: -1 })
  }

  async getArchivedOne(id: string, populate = false) {
    let invoice: InvoiceDocument | null

    if (populate) {
      invoice = await this.invoiceModel
        .findById(id)
        .populate('client')
        .populate('services.service')
        .populate({ path: 'logs.user', select: '-password -token' })
    } else {
      invoice = await this.invoiceModel.findById(id)
    }

    if (!invoice) throw new NotFoundException('Счёт не найден.')

    if (!invoice.isArchived) throw new ForbiddenException('Счёт не находится в архиве.')

    return invoice
  }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const sequenceNumber = await this.counterService.getNextSequence('invoice')
    const invoiceNumber = `INV-${ sequenceNumber }`

    const populatedServices = await Promise.all(
      createInvoiceDto.services.map(async item => {
        const serviceDoc = await this.serviceModel.findById(item.service).lean()
        if (!serviceDoc) {
          throw new Error(`Услуга с ID  ${ item.service.toString() } не найдена`)
        }
        return {
          ...item,
          type: serviceDoc.type,
        }
      })
    )

    const totalAmount  = this.calculateTotalAmount(
      populatedServices,
      createInvoiceDto.discount,
    )

    const status = this.determineStatus(createInvoiceDto.paid_amount, totalAmount)

    const newInvoice = new this.invoiceModel({
      ...createInvoiceDto,
      invoiceNumber,
      totalAmount: totalAmount,
      status: status,
    })

    return await newInvoice.save()
  }

  async update(id: string, updateDto: UpdateInvoiceDto) {
    const existing = await this.invoiceModel.findById(id)

    if (!existing) throw new NotFoundException('Счёт не найден.')

    const servicesToUse = (updateDto.services ?? existing.services) as InvoiceServiceDto[]

    const populatedServices = await Promise.all(
      servicesToUse.map(async item => {
        const serviceDoc = await this.serviceModel.findById(item.service).lean()
        if (!serviceDoc) {
          throw new Error(`Услуга с ID ${ item.service.toString() } не найдена`)
        }
        return {
          ...item,
          type: serviceDoc.type,
        }
      })
    )

    const discountToUse = updateDto.discount ?? existing.discount

    const paid_amount = updateDto.paid_amount ?? existing.paid_amount

    const totalAmount = this.calculateTotalAmount(
      populatedServices,
      discountToUse,
    )

    updateDto.status = this.determineStatus(paid_amount, totalAmount)

    return this.invoiceModel.findByIdAndUpdate(id, updateDto, { new: true }).populate('client services.service')
  }

  async archive(id: string) {
    const invoice = await this.invoiceModel.findById(id)

    if (!invoice) throw new NotFoundException('Счёт не найден.')
    if (invoice.isArchived) throw new ForbiddenException('Счёт уже в архиве.')

    invoice.isArchived = true
    await invoice.save()

    return { message: 'Счёт перемещён в архив.' }
  }

  async delete(id: string) {
    const invoice = await this.invoiceModel.findByIdAndDelete(id)

    if (!invoice) throw new NotFoundException('Счёт не найден.')

    return { message: 'Счёт успешно удалён.' }
  }
}

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Arrival, ArrivalDocument } from '../schemas/arrival.schema'
import { UpdateArrivalDto } from '../dto/update-arrival.dto'
import { CounterService } from './counter.service'
import { CreateArrivalDto } from '../dto/create-arrival.dto'
import { FilesService } from './files.service'
import { StockManipulationService } from './stock-manipulation.service'

export interface DocumentObject {
  document: string
}

@Injectable()
export class ArrivalsService {
  constructor(
    @InjectModel(Arrival.name) private readonly arrivalModel: Model<ArrivalDocument>,
    private readonly counterService: CounterService,
    private readonly filesService: FilesService,
    private readonly stockManipulationService: StockManipulationService,
  ) {}

  async getAllByClient(clientId: string, populate: boolean) {
    const unarchived = this.arrivalModel.find({ isArchived: false })

    if (populate) {
      return (await unarchived.find({ client: clientId }).populate('client')).reverse()
    }

    return (await unarchived.find({ client: clientId })).reverse()
  }

  async getAll(populate: boolean) {
    const unarchived = this.arrivalModel.find({ isArchived: false })

    if (populate) {
      return (await unarchived.populate('client stock shipping_agent').exec()).reverse()
    }

    return (await unarchived).reverse()
  }

  async getArchivedAll(populate: boolean) {
    const archived = this.arrivalModel.find({ isArchived: true })

    if (populate) {
      return (await archived.populate('client stock shipping_agent').exec()).reverse()
    }

    return (await archived).reverse()
  }

  async getOne(id: string, populate: boolean) {
    let arrival: ArrivalDocument | null

    if (populate) {
      arrival = await this.arrivalModel
        .findById(id)
        .populate('client products.product defects.product received_amount.product stock shipping_agent services.service')
        .populate({ path: 'logs.user', select: '-password -token' })
    } else {
      arrival = await this.arrivalModel.findById(id)
    }

    if (!arrival) throw new NotFoundException('Поставка не найдена.')

    if (arrival.isArchived) throw new ForbiddenException('Поставка в архиве.')

    return arrival
  }

  async getArchivedOne(id: string, populate: boolean) {
    let arrival: ArrivalDocument | null

    if (populate) {
      arrival = await this.arrivalModel
        .findById(id)
        .populate('client products.product defects.product received_amount.product stock shipping_agent services.service')
        .populate({ path: 'logs.user', select: '-password -token' })
    } else {
      arrival = await this.arrivalModel.findById(id)
    }

    if (!arrival) throw new NotFoundException('Поставка не найдена.')
    if (!arrival.isArchived) throw new ForbiddenException('Эта поставка не в архиве.')

    return arrival
  }

  async doStocking(arrival: ArrivalDocument) {
    if (
      (arrival.arrival_status === 'получена' || arrival.arrival_status === 'отсортирована') &&
      arrival.received_amount?.length
    ) {
      await this.stockManipulationService.increaseProductStock(arrival.stock, arrival.received_amount)
    }

    if (arrival.arrival_status === 'отсортирована' && arrival.defects?.length) {
      await this.stockManipulationService.decreaseProductStock(arrival.stock, arrival.defects)
    }
  }

  async undoStocking(arrival: ArrivalDocument) {
    if (
      (arrival.arrival_status === 'получена' || arrival.arrival_status === 'отсортирована') &&
      arrival.received_amount.length
    ) {
      await this.stockManipulationService.decreaseProductStock(arrival.stock, arrival.received_amount)
    }

    if (arrival.arrival_status === 'отсортирована' && arrival.defects.length) {
      await this.stockManipulationService.increaseProductStock(arrival.stock, arrival.defects)
    }
  }

  async create(arrivalDto: CreateArrivalDto, files: Array<Express.Multer.File> = []) {
    let documents: DocumentObject[] = []

    if (files.length > 0) {
      documents = files.map(file => ({
        document: this.filesService.getFilePath(file.filename),
      }))
    }

    if (arrivalDto.documents) {
      if (typeof arrivalDto.documents === 'string') {
        try {
          arrivalDto.documents = JSON.parse(arrivalDto.documents) as DocumentObject[]
        } catch (_e) {
          arrivalDto.documents = []
        }
      }

      const formattedDocs = Array.isArray(arrivalDto.documents)
        ? arrivalDto.documents.map((doc: DocumentObject | string) =>
          typeof doc === 'string' ? { document: doc } : doc,
        )
        : []

      documents = [...formattedDocs, ...documents]
    }

    const sequenceNumber = await this.counterService.getNextSequence('arrival')

    const newArrival = await this.arrivalModel.create({
      ...arrivalDto,
      documents,
      arrivalNumber: `ARL-${ sequenceNumber }`,
    })

    if (
      (newArrival.arrival_status === 'получена' || newArrival.arrival_status === 'отсортирована') &&
      !newArrival.received_amount?.length
    ) {
      throw new BadRequestException('Заполните список полученных товаров.')
    }

    this.stockManipulationService.init()

    await this.doStocking(newArrival)

    await this.stockManipulationService.saveStock(newArrival.stock)
    return newArrival
  }

  async update(id: string, arrivalDto: UpdateArrivalDto, files: Array<Express.Multer.File> = []) {
    const existingArrival = await this.arrivalModel.findById(id)
    if (!existingArrival) throw new NotFoundException('Поставка не найдена')

    if (files.length > 0) {
      const documentPaths = files.map(file => ({
        document: this.filesService.getFilePath(file.filename),
      }))
      arrivalDto.documents = [...(existingArrival.documents || []), ...documentPaths]
    }

    if (!Array.isArray(arrivalDto.services)) {
      arrivalDto.services = []
    }

    const updateData = { ...arrivalDto, services: arrivalDto.services }

    const previousStatus = existingArrival.arrival_status
    const newStatus = updateData.arrival_status ?? previousStatus

    this.stockManipulationService.init()

    if (previousStatus === 'ожидается доставка' && (newStatus === 'отсортирована' || newStatus === 'получена')) {
      if (!updateData.received_amount?.length) {
        throw new BadRequestException('Заполните список полученных товаров для смены статуса поставки.')
      }
    }

    if (previousStatus === 'получена' && newStatus === 'получена' && !updateData.received_amount?.length) {
      throw new BadRequestException('Для статуса "получена" укажите полученные товары')
    }

    const previousStock = existingArrival.stock
    await this.undoStocking(existingArrival)

    const updatedArrival = existingArrival.set(updateData)
    const newStock = updatedArrival.stock
    await this.doStocking(updatedArrival)

    await this.stockManipulationService.saveStock(previousStock)
    await this.stockManipulationService.saveStock(newStock)
    await updatedArrival.save()
    return await updatedArrival.populate('received_amount.product')
  }

  async archive(id: string) {
    const arrival = await this.arrivalModel.findByIdAndUpdate(id, { isArchived: true })

    if (!arrival) throw new NotFoundException('Поставка не найдена.')

    if (arrival.isArchived) throw new ForbiddenException('Поставка уже в архиве.')

    return { message: 'Поставка перемещена в архив.' }
  }

  async delete(id: string) {
    const arrival = await this.arrivalModel.findByIdAndDelete(id)
    if (!arrival) throw new NotFoundException('Поставка не найдена.')


    this.stockManipulationService.init()

    await this.undoStocking(arrival)

    await this.stockManipulationService.saveStock(arrival.stock)
    return { message: 'Поставка успешно удалена.' }
  }
}

/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ArrivalsService } from '../src/services/arrivals.service'
import { getModelToken } from '@nestjs/mongoose'
import { Arrival, ArrivalDocument } from '../src/schemas/arrival.schema'
import { CounterService } from '../src/services/counter.service'
import { FilesService } from '../src/services/files.service'
import { StockManipulationService } from '../src/services/stock-manipulation.service'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { CreateArrivalDto } from '../src/dto/create-arrival.dto'
import { UpdateArrivalDto } from '../src/dto/update-arrival.dto'
import { Readable } from 'stream'
import { Invoice, InvoiceDocument } from '../src/schemas/invoice.schema'
import { LogsService } from '../src/services/logs.service'
type MockFile = Express.Multer.File
describe('ArrivalsService', () => {
  let service: ArrivalsService
  let arrivalModel: Model<ArrivalDocument>
  let invoiceModel: Model<InvoiceDocument>
  let counterService: CounterService
  let filesService: FilesService
  let logsService: LogsService
  let stockManipulationService: StockManipulationService
  const mockArrival = {
    _id: new mongoose.Types.ObjectId().toString(),
    arrivalNumber: 'ARL-1',
    client: new mongoose.Types.ObjectId(),
    stock: new mongoose.Types.ObjectId(),
    shipping_agent: new mongoose.Types.ObjectId(),
    arrival_status: 'ожидается доставка' as const,
    isArchived: false,
    documents: [],
    products: [],
    received_amount: [],
    defects: [],
    services: [],
    arrival_date: new Date(),
    sent_amount: '',
    pickup_location: '',
    logs: [],
    populate: jest.fn().mockImplementation(function () {
      return this
    }),
    exec: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(this),
    set: jest.fn().mockImplementation(function (data) {
      Object.assign(this, data)
      return this
    }),
    toObject: jest.fn().mockReturnThis(),
    deleteOne: jest.fn().mockResolvedValue(true),
  }
  const mockUserId = new mongoose.Types.ObjectId()
  const mockArrivalArray = [
    { ...mockArrival },
    {
      ...mockArrival,
      _id: new mongoose.Types.ObjectId().toString(),
      arrivalNumber: 'ARL-2',
    },
  ]
  const mockInvoiceModel = {
    exists: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(false),
    findOne: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue({ status: 'оплачено' }),
  };
  const mockArchivedArrival = {
    ...mockArrival,
    isArchived: true,
  }
  const mockArrivalReceived = {
    ...mockArrival,
    arrival_status: 'получена',
    received_amount: [{ product: new mongoose.Types.ObjectId(), amount: 10 }],
  }
  const mockFindQuery = {
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockArrivalArray),
    reverse: jest.fn().mockReturnValue(mockArrivalArray),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArrivalsService,
        {
          provide: getModelToken(Arrival.name),
          useValue: {
            find: jest.fn().mockImplementation(() => mockFindQuery),
            findById: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockReturnThis(),
              lean: jest.fn().mockResolvedValue(mockArrival),
              exec: jest.fn().mockReturnThis(),
            })),
            findByIdAndUpdate: jest.fn().mockResolvedValue(mockArrival),
            findByIdAndDelete: jest.fn().mockResolvedValue(mockArrival),
            create: jest.fn().mockResolvedValue(mockArrival),
            exists: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
        {
          provide: CounterService,
          useValue: {
            getNextSequence: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: LogsService,
          useValue: {
            createLog: jest.fn(),
            generateLogForCreate: jest.fn().mockResolvedValue({
              action: 'create',
              timestamp: new Date(),
              user: mockUserId,
            }),
            trackChanges: jest.fn().mockReturnValue({
              action: 'update',
              timestamp: new Date(),
              user: mockUserId,
            }),
            generateLogForArchive: jest.fn().mockReturnValue({
              action: 'archive',
              timestamp: new Date(),
              user: mockUserId,
            }),
          },
        },
        {
          provide: FilesService,
          useValue: {
            getFilePath: jest.fn().mockImplementation(filename => `uploads/${ filename }`),
          },
        },
        {
          provide: StockManipulationService,
          useValue: {
            init: jest.fn(),
            increaseProductStock: jest.fn(),
            decreaseProductStock: jest.fn(),
            increaseDefectStock: jest.fn(),
            decreaseDefectStock: jest.fn(),
            saveStock: jest.fn(),
          },
        },
      ],
    }).compile()
    service = module.get<ArrivalsService>(ArrivalsService)
    logsService = module.get<LogsService>(LogsService)
    arrivalModel = module.get<Model<ArrivalDocument>>(getModelToken(Arrival.name))
    invoiceModel = module.get<Model<InvoiceDocument>>(getModelToken(Invoice.name))
    counterService = module.get<CounterService>(CounterService)
    filesService = module.get<FilesService>(FilesService)
    stockManipulationService = module.get<StockManipulationService>(StockManipulationService)
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getAllByClient', () => {
    it('should return all unarchived arrivals for a client without populating', async () => {
      const clientId = new mongoose.Types.ObjectId().toString()
      const result = await service.getAllByClient(clientId, false)
      expect(mockFindQuery.find).toHaveBeenCalledWith({ client: clientId })
      expect(result).toEqual(mockArrivalArray)
    })
    it('should return all unarchived arrivals for a client with populating', async () => {
      const clientId = new mongoose.Types.ObjectId().toString()
      const result = await service.getAllByClient(clientId, true)
      expect(mockFindQuery.find).toHaveBeenCalledWith({ client: clientId })
      expect(mockFindQuery.populate).toHaveBeenCalledWith('client')
      expect(result).toEqual(mockArrivalArray)
    })
  })
  describe('getAll', () => {
    it('should return all unarchived arrivals without populating', async () => {
      const result = await service.getAll(false)
      expect(arrivalModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(result).toEqual(mockArrivalArray)
    })
    it('should return all unarchived arrivals with populating', async () => {
      const result = await service.getAll(true)
      expect(arrivalModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(mockFindQuery.populate).toHaveBeenCalledWith('client stock shipping_agent')
      expect(result).toEqual(mockArrivalArray)
    })
  })
  describe('getArchivedAll', () => {
    it('should return all archived arrivals without populating', async () => {
      const archivedArrivals = [{ ...mockArrival, isArchived: true }]
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedArrivals)
      }
      jest.spyOn(arrivalModel, 'find').mockReturnValue(mockQuery as any)
      const result = await service.getArchivedAll(false)
      expect(arrivalModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(result).toEqual(archivedArrivals.reverse())
    })
    it('should return all archived arrivals with populating', async () => {
      const archivedArrivals = [{ ...mockArrival, isArchived: true }]
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedArrivals)
      }
      jest.spyOn(arrivalModel, 'find').mockReturnValue(mockQuery as any)
      const result = await service.getArchivedAll(true)
      expect(arrivalModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: 'client stock shipping_agent',
        select: 'name'
      })
      expect(result).toEqual(archivedArrivals.reverse())
    })
  })
  describe('getOne', () => {
    it('should return arrival with payment status when populated', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockArrival)
      }
      jest.spyOn(arrivalModel, 'findById').mockReturnValue(mockQuery as any)
      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ status: 'оплачено' })
      } as any)
      const result = await service.getOne('arrival-id', true)
      expect(result).toEqual({
        ...mockArrival,
        paymentStatus: 'оплачено'
      })
    })
    it('should return arrival without payment status when no invoice', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockArrival)
      }
      jest.spyOn(arrivalModel, 'findById').mockReturnValue(mockQuery as any)
      jest.spyOn(invoiceModel, 'findOne').mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      } as any)
      const result = await service.getOne('arrival-id', false)
      expect(result).toEqual({
        ...mockArrival,
        paymentStatus: null
      })
    })
    it('should throw NotFoundException when arrival not found', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null)
      }
      jest.spyOn(arrivalModel, 'findById').mockReturnValue(mockQuery as any)
      await expect(service.getOne('non-existent-id', false))
        .rejects.toThrow('Поставка не найдена.')
    })
    it('should throw ForbiddenException when arrival is archived', async () => {
      const mockQuery = {
        lean: jest.fn().mockResolvedValue({ ...mockArrival, isArchived: true })
      }
      jest.spyOn(arrivalModel, 'findById').mockReturnValue(mockQuery as any)
      await expect(service.getOne('arrival-id', false))
        .rejects.toThrow('Поставка в архиве.')
    })
  })
  describe('getArchivedOne', () => {
    it('should return archived arrival with populating', async () => {
      const archivedArrival = { ...mockArrival, isArchived: true }
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      }
      jest.spyOn(arrivalModel, 'findById').mockReturnValue(mockQuery as any)
      mockQuery.populate
        .mockReturnValueOnce(mockQuery) 
        .mockResolvedValueOnce(archivedArrival) 
      const result = await service.getArchivedOne('arrival-id', true)
      expect(result).toEqual(archivedArrival)
    })
    it('should return archived arrival without populating', async () => {
      const archivedArrival = { ...mockArrival, isArchived: true }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(archivedArrival as any)
      const result = await service.getArchivedOne('arrival-id', false)
      expect(result).toEqual(archivedArrival)
    })
    it('should throw NotFoundException when arrival not found', async () => {
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(null)
      await expect(service.getArchivedOne('non-existent-id', false))
        .rejects.toThrow('Поставка не найдена.')
    })
    it('should throw ForbiddenException when arrival not archived', async () => {
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(mockArrival as any)
      await expect(service.getArchivedOne('arrival-id', false))
        .rejects.toThrow('Эта поставка не в архиве.')
    })
  })
  describe('doStocking', () => {
    it('should increase product stock when arrival is received', async () => {
      const arrival = {
        ...mockArrival,
        arrival_status: 'получена' as const,
        received_amount: [{ product: 'product-id', amount: 10 }]
      }
      await service.doStocking(arrival as any)
      expect(stockManipulationService.increaseProductStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.received_amount
      )
    })
    it('should handle defects when arrival is sorted', async () => {
      const arrival = {
        ...mockArrival,
        arrival_status: 'отсортирована' as const,
        received_amount: [{ product: 'product-id', amount: 10 }],
        defects: [{ product: 'product-id', amount: 2 }]
      }
      await service.doStocking(arrival as any)
      expect(stockManipulationService.increaseProductStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.received_amount
      )
      expect(stockManipulationService.decreaseProductStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.defects
      )
      expect(stockManipulationService.increaseDefectStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.defects
      )
    })
    it('should not manipulate stock when arrival is pending', async () => {
      const arrival = {
        ...mockArrival,
        arrival_status: 'ожидается доставка' as const
      }
      await service.doStocking(arrival as any)
      expect(stockManipulationService.increaseProductStock).not.toHaveBeenCalled()
      expect(stockManipulationService.decreaseProductStock).not.toHaveBeenCalled()
    })
  })
  describe('undoStocking', () => {
    it('should decrease product stock when undoing received arrival', async () => {
      const arrival = {
        ...mockArrival,
        arrival_status: 'получена' as const,
        received_amount: [{ product: 'product-id', amount: 10 }]
      }
      await service.undoStocking(arrival as any)
      expect(stockManipulationService.decreaseProductStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.received_amount
      )
    })
    it('should handle defects when undoing sorted arrival', async () => {
      const arrival = {
        ...mockArrival,
        arrival_status: 'отсортирована' as const,
        received_amount: [{ product: 'product-id', amount: 10 }],
        defects: [{ product: 'product-id', amount: 2 }]
      }
      await service.undoStocking(arrival as any)
      expect(stockManipulationService.decreaseProductStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.received_amount
      )
      expect(stockManipulationService.increaseProductStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.defects
      )
      expect(stockManipulationService.decreaseDefectStock).toHaveBeenCalledWith(
        arrival.stock,
        arrival.defects
      )
    })
  })
  describe('create', () => {
    it('should create arrival with files', async () => {
      const arrivalDto = {
        client: 'client-id',
        stock: 'stock-id',
        arrival_status: 'ожидается доставка' as const,
        arrival_date: new Date()
      }
      const files = [{ filename: 'test.pdf' }] as Express.Multer.File[]
      const result = await service.create(arrivalDto as any, files, mockUserId)
      expect(counterService.getNextSequence).toHaveBeenCalledWith('arrival')
      expect(logsService.generateLogForCreate).toHaveBeenCalledWith(mockUserId)
      expect(stockManipulationService.init).toHaveBeenCalled()
      expect(result).toEqual(mockArrival)
    })
    it('should handle documents as string', async () => {
      const arrivalDto = {
        client: 'client-id',
        stock: 'stock-id',
        arrival_status: 'ожидается доставка' as const,
        arrival_date: new Date(),
        documents: JSON.stringify([{ document: 'existing.pdf' }])
      }
      await service.create(arrivalDto as any, [], mockUserId)
      expect(stockManipulationService.init).toHaveBeenCalled()
    })
    it('should handle invalid JSON documents', async () => {
      const arrivalDto = {
        client: 'client-id',
        stock: 'stock-id',
        arrival_status: 'ожидается доставка' as const,
        arrival_date: new Date(),
        documents: 'invalid-json'
      }
      await service.create(arrivalDto as any, [], mockUserId)
      expect(stockManipulationService.init).toHaveBeenCalled()
    })
    it('should throw BadRequestException when received status without received_amount', async () => {
      const arrivalDto = {
        client: 'client-id',
        stock: 'stock-id',
        arrival_status: 'получена' as const,
        arrival_date: new Date()
      }
      const mockArrivalWithoutReceived = {
        ...mockArrival,
        arrival_status: 'получена',
        received_amount: []
      }
      jest.spyOn(arrivalModel, 'create').mockResolvedValue(mockArrivalWithoutReceived as any)
      await expect(service.create(arrivalDto as any, [], mockUserId))
        .rejects.toThrow('Заполните список полученных товаров.')
    })
  })
  describe('update', () => {
    it('should update arrival successfully', async () => {
      const updateDto = {
        arrival_status: 'получена' as const,
        received_amount: [{ product: 'product-id', amount: 10 }]
      }
      const existingArrival = {
        ...mockArrival,
        arrival_status: 'ожидается доставка',
        toObject: jest.fn().mockReturnValue(mockArrival),
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(mockArrival),
        populate: jest.fn().mockResolvedValue(mockArrival),
        logs: []
      }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(existingArrival as any)
      const result = await service.update('arrival-id', updateDto as any, [], mockUserId)
      expect(logsService.trackChanges).toHaveBeenCalled()
      expect(stockManipulationService.init).toHaveBeenCalled()
      expect(existingArrival.save).toHaveBeenCalled()
    })
    it('should throw NotFoundException when arrival not found', async () => {
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(null)
      await expect(service.update('non-existent-id', {}, [], mockUserId))
        .rejects.toThrow('Поставка не найдена')
    })
    it('should handle files in update', async () => {
      const existingArrival = {
        ...mockArrival,
        toObject: jest.fn().mockReturnValue(mockArrival),
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(mockArrival),
        populate: jest.fn().mockResolvedValue(mockArrival),
        logs: [],
        documents: [{ document: 'existing.pdf' }]
      }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(existingArrival as any)
      const files = [{ filename: 'new.pdf' }] as Express.Multer.File[]
      await service.update('arrival-id', {}, files, mockUserId)
      expect(filesService.getFilePath).toHaveBeenCalledWith('new.pdf')
    })
    it('should throw BadRequestException when changing to received without received_amount', async () => {
      const updateDto = {
        arrival_status: 'получена' as const
      }
      const existingArrival = {
        ...mockArrival,
        arrival_status: 'ожидается доставка'
      }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(existingArrival as any)
      await expect(service.update('arrival-id', updateDto as any, [], mockUserId))
        .rejects.toThrow('Заполните список полученных товаров для смены статуса поставки.')
    })
    it('should throw BadRequestException when received status without received_amount', async () => {
      const updateDto = {
        arrival_status: 'получена' as const
      }
      const existingArrival = {
        ...mockArrival,
        arrival_status: 'получена'
      }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(existingArrival as any)
      await expect(service.update('arrival-id', updateDto as any, [], mockUserId))
        .rejects.toThrow('Для статуса "получена" укажите полученные товары')
    })
  })
  describe('archive', () => {
    it('should archive arrival successfully', async () => {
      const arrival = {
        ...mockArrival,
        arrival_status: 'получена',
        isArchived: false,
        logs: [],
        save: jest.fn().mockResolvedValue(mockArrival)
      }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      jest.spyOn(invoiceModel, 'exists').mockResolvedValue(false as any)
      const result = await service.archive('arrival-id', mockUserId)
      expect(arrival.isArchived).toBe(true)
      expect(logsService.generateLogForArchive).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Поставка перемещена в архив.' })
    })
    it('should throw NotFoundException when arrival not found', async () => {
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(null)
      await expect(service.archive('non-existent-id', mockUserId))
        .rejects.toThrow('Поставка не найдена.')
    })
    it('should throw ForbiddenException when arrival already archived', async () => {
      const arrival = { ...mockArrival, isArchived: true }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      await expect(service.archive('arrival-id', mockUserId))
        .rejects.toThrow('Поставка уже в архиве.')
    })
    it('should throw ForbiddenException when arrival is pending', async () => {
      const arrival = { ...mockArrival, arrival_status: 'ожидается доставка', isArchived: false }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      await expect(service.archive('arrival-id', mockUserId))
        .rejects.toThrow('Поставку можно архивировать только после получения')
    })
    it('should throw ForbiddenException when has unpaid invoice', async () => {
      const arrival = { ...mockArrival, arrival_status: 'получена', isArchived: false }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      jest.spyOn(invoiceModel, 'exists').mockReturnValue({
        exec: jest.fn().mockResolvedValue(true)
      } as any)
      await expect(service.archive('arrival-id', mockUserId))
        .rejects.toThrow('Поставка не может быть перемещена в архив, так как она не оплачена.')
    })
  })
  describe('unarchive', () => {
    it('should unarchive arrival successfully', async () => {
      const arrival = {
        ...mockArrival,
        isArchived: true,
        logs: [],
        save: jest.fn().mockResolvedValue(mockArrival)
      }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      const result = await service.unarchive('arrival-id', mockUserId)
      expect(arrival.isArchived).toBe(false)
      expect(result).toEqual({ message: 'Клиент восстановлен из архива' })
    })
    it('should throw NotFoundException when arrival not found', async () => {
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(null)
      await expect(service.unarchive('non-existent-id', mockUserId))
        .rejects.toThrow('Поставка не найден')
    })
    it('should throw ForbiddenException when arrival not archived', async () => {
      const arrival = { ...mockArrival, isArchived: false }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      await expect(service.unarchive('arrival-id', mockUserId))
        .rejects.toThrow('Поставка не находится в архиве')
    })
  })
  describe('cancel', () => {
    it('should cancel arrival and undo stocking', async () => {
      const arrival = { ...mockArrival, stock: 'stock-id' }
      jest.spyOn(arrivalModel, 'findByIdAndDelete').mockResolvedValue(arrival as any)
      const result = await service.cancel('arrival-id')
      expect(stockManipulationService.init).toHaveBeenCalled()
      expect(stockManipulationService.saveStock).toHaveBeenCalledWith('stock-id')
      expect(result).toEqual({ message: 'Поставка успешно отменена.' })
    })
    it('should throw NotFoundException when arrival not found', async () => {
      jest.spyOn(arrivalModel, 'findByIdAndDelete').mockResolvedValue(null)
      await expect(service.cancel('non-existent-id'))
        .rejects.toThrow('Поставка не найдена.')
    })
  })
  describe('delete', () => {
    it('should delete received arrival without unpaid invoice', async () => {
      const arrival = {
        ...mockArrival,
        arrival_status: 'получена',
        deleteOne: jest.fn().mockResolvedValue(true)
      }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      jest.spyOn(invoiceModel, 'exists').mockResolvedValue(false as any)
      const result = await service.delete('arrival-id')
      expect(arrival.deleteOne).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Поставка удалена' })
    })
    it('should throw NotFoundException when arrival not found', async () => {
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(null)
      await expect(service.delete('non-existent-id'))
        .rejects.toThrow('Поставка не найдена.')
    })
    it('should throw ForbiddenException when arrival is pending', async () => {
      const arrival = { ...mockArrival, arrival_status: 'ожидается доставка' }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      await expect(service.delete('arrival-id'))
        .rejects.toThrow('Поставку можно удалить только после получения')
    })
    it('should throw ForbiddenException when has unpaid invoice', async () => {
      const arrival = { ...mockArrival, arrival_status: 'получена' }
      jest.spyOn(arrivalModel, 'findById').mockResolvedValue(arrival as any)
      jest.spyOn(invoiceModel, 'exists').mockReturnValue({
        exec: jest.fn().mockResolvedValue(true)
      } as any)
      await expect(service.delete('arrival-id'))
        .rejects.toThrow('Поставка не может быть удалена, так как она не оплачена.')
    })
  })
})

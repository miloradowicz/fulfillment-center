/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { StocksService } from '../src/services/stocks.service'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Stock, StockDocument } from '../src/schemas/stock.schema'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { CreateStockDto } from '../src/dto/create-stock.dto'
import { UpdateStockDto } from '../src/dto/update-stock.dto'
import { CreateWriteOffDto } from '../src/dto/create-write-off.dto'
import { StockManipulationService } from 'src/services/stock-manipulation.service'
import { LogsService } from '../src/services/logs.service'
import { Product } from '../src/schemas/product.schema'
import { Arrival, ArrivalDocument } from '../src/schemas/arrival.schema'
import { Order, OrderDocument } from '../src/schemas/order.schema'
describe('StocksService', () => {
  let service: StocksService
  let stockModel: Model<StockDocument>
  let arrivalModel: Model<ArrivalDocument>
  let orderModel: Model<OrderDocument>
  let stockManipulationService: StockManipulationService
  let logsService: LogsService
  let mockProductModel: any
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockStock = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Test Stock',
    address: 'Test Address',
    client: new mongoose.Types.ObjectId().toString(),
    isArchived: false,
    products: [],
    defects: [],
    write_offs: [],
    logs: [],
    save: jest.fn().mockImplementation(function () {
      return this
    }),
    toObject: jest.fn().mockImplementation(function() {
      return { ...this }
    }),
    set: jest.fn(),
  }
  const mockArchivedStock = {
    ...mockStock,
    isArchived: true,
  }
  const mockStockArray = [
    { ...mockStock },
    {
      ...mockStock,
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Test Stock 2',
    },
  ]
  const mockLog = {
    user: mockUserId,
    action: 'создание',
    date: new Date(),
    changes: []
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: StockManipulationService,
          useValue: {
            init: jest.fn(),
            decreaseProductStock: jest.fn(),
            increaseProductStock: jest.fn(),
            testStockProducts: jest.fn().mockReturnValue(true),
            saveStock: jest.fn(),
          },
        },
        {
          provide: getModelToken('Arrival'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken('Order'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken(Stock.name),
          useValue: {
            find: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(mockStockArray),
              reverse: jest.fn().mockReturnValue(mockStockArray),
            })),
            findById: jest.fn().mockImplementation(() => ({
              populate: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue(mockStock),
            })),
            findByIdAndUpdate: jest.fn().mockResolvedValue(mockStock),
            findByIdAndDelete: jest.fn().mockResolvedValue(mockStock),
            create: jest.fn().mockResolvedValue(mockStock),
          },
        },
        {
          provide: getModelToken(Product.name),
          useValue: {
            find: jest.fn().mockResolvedValue([
              { _id: 'product-id-1', name: 'Product 1', isArchived: false },
            ]),
          },
        },
        {
          provide: getModelToken(Arrival.name),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken(Order.name),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: LogsService,
          useValue: {
            generateLogForCreate: jest.fn().mockReturnValue(mockLog),
            trackChanges: jest.fn().mockReturnValue(mockLog),
            generateLogForArchive: jest.fn().mockReturnValue(mockLog),
          },
        },
      ],
    }).compile()
    service = module.get<StocksService>(StocksService)
    stockModel = module.get<Model<StockDocument>>(getModelToken(Stock.name))
    arrivalModel = module.get<Model<ArrivalDocument>>(getModelToken(Arrival.name))
    orderModel = module.get<Model<OrderDocument>>(getModelToken(Order.name))
    stockManipulationService = module.get<StockManipulationService>(StockManipulationService)
    logsService = module.get<LogsService>(LogsService)
    mockProductModel = module.get<Model<Product>>(getModelToken(Product.name))
    jest.clearAllMocks()
  })
  it('должен быть определен', () => {
    expect(service).toBeDefined()
  })
  describe('getAll', () => {
    it('должен возвращать все неархивированные склады', async () => {
      const result = await service.getAll()
      expect(stockModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(result).toEqual(mockStockArray)
    })
    it('должен возвращать склады в обратном порядке', async () => {
      const reversedArray = [...mockStockArray].reverse()
      jest.spyOn(stockModel, 'find').mockImplementation(() => ({
        reverse: jest.fn().mockReturnValue(reversedArray),
      }) as any)
      const result = await service.getAll()
      expect(result).toEqual(reversedArray)
    })
  })
  describe('getAllArchived', () => {
    it('должен возвращать все архивированные склады', async () => {
      const archivedStocks = [mockArchivedStock]
      jest.spyOn(stockModel, 'find').mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(archivedStocks),
      }) as any)
      const result = await service.getAllArchived()
      expect(stockModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(result).toEqual(archivedStocks)
    })
  })
  describe('getOne', () => {
    it('должен возвращать склад по id с популяцией', async () => {
      const result = await service.getOne(mockStock._id)
      expect(stockModel.findById).toHaveBeenCalledWith(mockStock._id)
      expect(result).toEqual(mockStock)
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockImplementation(
        () =>
          ({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(null),
          }) as any,
      )
      await expect(service.getOne('nonexistent-id')).rejects.toThrow(
        new NotFoundException('Склад не найден.')
      )
    })
    it('должен выбрасывать ForbiddenException если склад архивирован', async () => {
      jest.spyOn(stockModel, 'findById').mockImplementation(
        () =>
          ({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockArchivedStock),
          }) as any,
      )
      await expect(service.getOne(mockArchivedStock._id)).rejects.toThrow(
        new ForbiddenException('Склад в архиве.')
      )
    })
    it('должен правильно настраивать популяцию полей', async () => {
      const populateSpy = jest.fn().mockReturnThis()
      jest.spyOn(stockModel, 'findById').mockImplementation(() => ({
        populate: populateSpy,
        exec: jest.fn().mockResolvedValue(mockStock),
      }) as any)
      await service.getOne(mockStock._id)
      expect(populateSpy).toHaveBeenCalledWith({
        path: 'products.product defects.product write_offs.product',
        populate: { path: 'client' },
      })
      expect(populateSpy).toHaveBeenCalledWith({ 
        path: 'logs.user', 
        select: '-password -token' 
      })
    })
  })
  describe('getArchivedById', () => {
    it('должен возвращать архивированный склад по id', async () => {
      jest.spyOn(stockModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(mockArchivedStock),
          }) as any,
      )
      const result = await service.getArchivedById(mockArchivedStock._id)
      expect(stockModel.findById).toHaveBeenCalledWith(mockArchivedStock._id)
      expect(result).toEqual(mockArchivedStock)
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(null),
          }) as any,
      )
      await expect(service.getArchivedById('nonexistent-id')).rejects.toThrow(
        new NotFoundException('Склад не найден.')
      )
    })
    it('должен выбрасывать ForbiddenException если склад не архивирован', async () => {
      jest.spyOn(stockModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(mockStock),
          }) as any,
      )
      await expect(service.getArchivedById(mockStock._id)).rejects.toThrow(
        new ForbiddenException('Этот склад не в архиве.')
      )
    })
  })
  describe('create', () => {
    it('должен создавать новый склад с логом', async () => {
      const createStockDto: CreateStockDto = {
        name: 'New Test Stock',
        address: 'New Test Address',
        products: [],
      }
      jest.spyOn(stockModel, 'create').mockResolvedValue(mockStock as any)
      const result = await service.create(createStockDto, mockUserId)
      expect(logsService.generateLogForCreate).toHaveBeenCalledWith(mockUserId)
      expect(stockModel.create).toHaveBeenCalledWith({
        ...createStockDto,
        logs: [mockLog],
      })
      expect(result).toEqual(mockStock)
    })
    it('должен создавать склад с пустыми массивами по умолчанию', async () => {
      const createStockDto: CreateStockDto = {
        name: 'New Test Stock',
        address: 'New Test Address',
        products: [],
      }
      await service.create(createStockDto, mockUserId)
      expect(stockModel.create).toHaveBeenCalledWith({
        ...createStockDto,
        logs: [mockLog],
      })
    })
  })
  describe('update', () => {
    it('должен обновлять склад и добавлять лог изменений', async () => {
      const updateStockDto: UpdateStockDto = {
        name: 'Updated Test Stock',
        address: 'Updated Test Address',
      }
      const mockStockWithMethods = {
        ...mockStock,
        toObject: jest.fn().mockReturnValue(mockStock),
        set: jest.fn(),
        logs: { push: jest.fn() },
        save: jest.fn().mockResolvedValue(mockStock)
      }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockWithMethods)
      const result = await service.update(mockStock._id, updateStockDto, mockUserId)
      expect(logsService.trackChanges).toHaveBeenCalledWith(
        mockStock,
        updateStockDto,
        mockUserId
      )
      expect(mockStockWithMethods.set).toHaveBeenCalledWith(updateStockDto)
      expect(mockStockWithMethods.logs.push).toHaveBeenCalledWith(mockLog)
      expect(mockStockWithMethods.save).toHaveBeenCalled()
      expect(result).toEqual(mockStock)
    })
    it('должен обновлять склад без добавления лога если изменений нет', async () => {
      const updateStockDto: UpdateStockDto = {
        name: 'Updated Test Stock',
      }
      const mockStockWithMethods = {
        ...mockStock,
        toObject: jest.fn().mockReturnValue(mockStock),
        set: jest.fn(),
        logs: { push: jest.fn() },
        save: jest.fn().mockResolvedValue(mockStock)
      }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockWithMethods)
      jest.spyOn(logsService, 'trackChanges').mockReturnValue(null)
      const result = await service.update(mockStock._id, updateStockDto, mockUserId)
      expect(mockStockWithMethods.set).toHaveBeenCalledWith(updateStockDto)
      expect(mockStockWithMethods.logs.push).not.toHaveBeenCalled()
      expect(result).toEqual(mockStock)
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockResolvedValue(null)
      await expect(service.update('nonexistent-id', { name: 'Updated' }, mockUserId))
        .rejects.toThrow(new NotFoundException('Склад не найден.'))
    })
  })
  describe('doStocking', () => {
    it('должен уменьшать количество товара на складе при наличии списаний', async () => {
      const stockId = new mongoose.Types.ObjectId()
      const writeOffs = [{ product: new mongoose.Types.ObjectId(), amount: 5, reason: 'damaged' }]
      await service.doStocking(stockId, writeOffs as any)
      expect(stockManipulationService.decreaseProductStock).toHaveBeenCalledWith(stockId, writeOffs)
    })
    it('не должен манипулировать складом при отсутствии списаний', async () => {
      const stockId = new mongoose.Types.ObjectId()
      const writeOffs = []
      await service.doStocking(stockId, writeOffs)
      expect(stockManipulationService.decreaseProductStock).not.toHaveBeenCalled()
    })
    it('не должен манипулировать складом при null списаниях', async () => {
      const stockId = new mongoose.Types.ObjectId()
      await service.doStocking(stockId, null as any)
      expect(stockManipulationService.decreaseProductStock).not.toHaveBeenCalled()
    })
    it('не должен манипулировать складом при undefined списаниях', async () => {
      const stockId = new mongoose.Types.ObjectId()
      await service.doStocking(stockId, undefined as any)
      expect(stockManipulationService.decreaseProductStock).not.toHaveBeenCalled()
    })
  })
  describe('undoStocking', () => {
    it('должен увеличивать количество товара на складе при наличии списаний', async () => {
      const stockId = new mongoose.Types.ObjectId()
      const writeOffs = [{ product: new mongoose.Types.ObjectId(), amount: 5, reason: 'damaged' }]
      await service.undoStocking(stockId, writeOffs as any)
      expect(stockManipulationService.increaseProductStock).toHaveBeenCalledWith(stockId, writeOffs)
    })
    it('не должен манипулировать складом при отсутствии списаний', async () => {
      const stockId = new mongoose.Types.ObjectId()
      const writeOffs = []
      await service.undoStocking(stockId, writeOffs)
      expect(stockManipulationService.increaseProductStock).not.toHaveBeenCalled()
    })
    it('не должен манипулировать складом при null списаниях', async () => {
      const stockId = new mongoose.Types.ObjectId()
      await service.undoStocking(stockId, null as any)
      expect(stockManipulationService.increaseProductStock).not.toHaveBeenCalled()
    })
  })
  describe('createWriteOff', () => {
    const writeOffDto: CreateWriteOffDto = {
      write_offs: [
        { product: new mongoose.Types.ObjectId(), amount: 5, reason: 'damaged' },
        { product: new mongoose.Types.ObjectId(), amount: 3, reason: 'expired' }
      ]
    }
    it('должен создавать списание товара', async () => {
      const mockStockWithMethods = {
        ...mockStock,
        _id: new mongoose.Types.ObjectId(),
        write_offs: { push: jest.fn() },
        toObject: jest.fn().mockReturnValue({ ...mockStock, write_offs: [] }),
        save: jest.fn().mockResolvedValue(mockStock),
        logs: { push: jest.fn() }
      }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockWithMethods)
      const result = await service.createWriteOff(mockStock._id, writeOffDto, mockUserId)
      expect(stockManipulationService.init).toHaveBeenCalled()
      expect(stockManipulationService.decreaseProductStock).toHaveBeenCalledWith(
        mockStockWithMethods._id, 
        writeOffDto.write_offs
      )
      expect(stockManipulationService.testStockProducts).toHaveBeenCalledWith(
        mockStockWithMethods._id,
        writeOffDto.write_offs.map(x => x.product)
      )
      expect(stockManipulationService.saveStock).toHaveBeenCalledWith(mockStockWithMethods._id)
      expect(mockStockWithMethods.save).toHaveBeenCalled()
      expect(result).toEqual(writeOffDto)
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockResolvedValue(null)
      await expect(service.createWriteOff('non-existent-id', writeOffDto, mockUserId))
        .rejects.toThrow(new NotFoundException('Склад не найден.'))
    })
    it('должен выбрасывать BadRequestException если недостаточно товара на складе', async () => {
      const mockStockWithMethods = {
        ...mockStock,
        _id: new mongoose.Types.ObjectId(),
        write_offs: { push: jest.fn() },
        toObject: jest.fn().mockReturnValue({ ...mockStock, write_offs: [] }),
        save: jest.fn().mockResolvedValue(mockStock),
        logs: { push: jest.fn() }
      }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockWithMethods)
      jest.spyOn(stockManipulationService, 'testStockProducts').mockReturnValue(false)
      await expect(service.createWriteOff(mockStock._id, writeOffDto, mockUserId))
        .rejects.toThrow(new BadRequestException('На данном складе нет необходимого количества товара'))
    })
    it('должен добавлять лог изменений при создании списания', async () => {
      const mockStockWithMethods = {
        ...mockStock,
        _id: new mongoose.Types.ObjectId(),
        write_offs: { push: jest.fn() },
        toObject: jest.fn().mockReturnValue({ ...mockStock, write_offs: [] }),
        save: jest.fn().mockResolvedValue(mockStock),
        logs: { push: jest.fn() }
      }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockWithMethods)
      await service.createWriteOff(mockStock._id, writeOffDto, mockUserId)
      expect(logsService.trackChanges).toHaveBeenCalled()
      expect(mockStockWithMethods.logs.push).toHaveBeenCalledWith(mockLog)
    })
    it('должен добавлять списания к складу', async () => {
      const mockStockWithMethods = {
        ...mockStock,
        _id: new mongoose.Types.ObjectId(),
        write_offs: { push: jest.fn() },
        toObject: jest.fn().mockReturnValue({ ...mockStock, write_offs: [] }),
        save: jest.fn().mockResolvedValue(mockStock),
        logs: { push: jest.fn() }
      }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockWithMethods)
      await service.createWriteOff(mockStock._id, writeOffDto, mockUserId)
      expect(mockStockWithMethods.write_offs.push).toHaveBeenCalledWith(...writeOffDto.write_offs)
    })
  })
  describe('isLockedForArchive', () => {
    it('должен возвращать true если есть активные поставки', async () => {
      const stockId = new mongoose.Types.ObjectId().toString()
      const mockStockForLock = { ...mockStock, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockForLock)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([{ _id: 'arrival1' }] as any)
      const result = await service.isLockedForArchive(stockId)
      expect(arrivalModel.find).toHaveBeenCalledWith({
        stock: mockStockForLock._id,
        $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
      })
      expect(result).toBe(true)
    })
    it('должен возвращать true если есть активные заказы', async () => {
      const stockId = new mongoose.Types.ObjectId().toString()
      const mockStockForLock = { ...mockStock, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockForLock)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([])
      jest.spyOn(orderModel, 'find').mockResolvedValue([{ _id: 'order1' }] as any)
      const result = await service.isLockedForArchive(stockId)
      expect(orderModel.find).toHaveBeenCalledWith({
        stock: mockStockForLock._id,
        $or: [{ isArchived: false }, { isArchived: { $exists: false } }],
      })
      expect(result).toBe(true)
    })
    it('должен возвращать false если нет активных поставок и заказов', async () => {
      const stockId = new mongoose.Types.ObjectId().toString()
      const mockStockForLock = { ...mockStock, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockForLock)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([])
      jest.spyOn(orderModel, 'find').mockResolvedValue([])
      const result = await service.isLockedForArchive(stockId)
      expect(result).toBe(false)
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockResolvedValue(null)
      await expect(service.isLockedForArchive('non-existent-id'))
        .rejects.toThrow(new NotFoundException('Склад не найден'))
    })
  })
  describe('archive', () => {
    it('должен архивировать склад если нет активных товаров и склад не заблокирован', async () => {
      const stockId = new mongoose.Types.ObjectId('681a49b9d769618a17d85eb1')
      const stockWithoutActiveProducts = {
        _id: stockId,
        products: [],
        defects: [],
        isArchived: false,
        logs: { push: jest.fn() },
        save: jest.fn().mockResolvedValue(true),
      }
      const mockQuery = { exec: jest.fn().mockResolvedValue(stockWithoutActiveProducts) }
      jest.spyOn(stockModel, 'findById').mockReturnValue(mockQuery as any)
      jest.spyOn(service, 'isLockedForArchive').mockResolvedValue(false)
      const result = await service.archive(stockId.toString(), mockUserId)
      expect(stockWithoutActiveProducts.isArchived).toBe(true)
      expect(logsService.generateLogForArchive).toHaveBeenCalledWith(mockUserId, true)
      expect(stockWithoutActiveProducts.logs.push).toHaveBeenCalledWith(mockLog)
      expect(stockWithoutActiveProducts.save).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Склад перемещен в архив.' })
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      const mockQuery = { exec: jest.fn().mockResolvedValue(null) }
      jest.spyOn(stockModel, 'findById').mockReturnValue(mockQuery as any)
      await expect(service.archive('nonexistent-id', mockUserId)).rejects.toThrow(
        new NotFoundException('Склад не найден.')
      )
    })
    it('должен выбрасывать ForbiddenException если склад уже архивирован', async () => {
      const archivedStock = { ...mockStock, isArchived: true }
      const mockQuery = { exec: jest.fn().mockResolvedValue(archivedStock) }
      jest.spyOn(stockModel, 'findById').mockReturnValue(mockQuery as any)
      await expect(service.archive(archivedStock._id, mockUserId)).rejects.toThrow(
        new ForbiddenException('Склад уже в архиве.')
      )
    })
    it('должен выбрасывать ForbiddenException если на складе есть активные товары', async () => {
      const stockWithActiveProducts = {
        ...mockStock,
        products: [{ product: new mongoose.Types.ObjectId(), amount: 5 }],
        logs: []
      }
      const mockQuery = { exec: jest.fn().mockResolvedValue(stockWithActiveProducts) }
      jest.spyOn(stockModel, 'findById').mockReturnValue(mockQuery as any)
      await expect(service.archive(stockWithActiveProducts._id, mockUserId)).rejects.toThrow(
        new ForbiddenException('На складе ещё есть товары. Архивация невозможна.')
      )
    })
    it('должен выбрасывать ForbiddenException если склад заблокирован для архивации', async () => {
      const stockWithoutActiveProducts = {
        ...mockStock,
        products: [],
        isArchived: false,
        logs: []
      }
      const mockQuery = { exec: jest.fn().mockResolvedValue(stockWithoutActiveProducts) }
      jest.spyOn(stockModel, 'findById').mockReturnValue(mockQuery as any)
      jest.spyOn(service, 'isLockedForArchive').mockResolvedValue(true)
      await expect(service.archive(stockWithoutActiveProducts._id, mockUserId)).rejects.toThrow(
        new ForbiddenException('Склад участвует в неархивированных поставках или заказах. Архивация невозможна.')
      )
    })
  })
  describe('unarchive', () => {
    it('должен восстанавливать склад из архива', async () => {
      const mockArchivedStockWithMethods = {
        ...mockArchivedStock,
        isArchived: true,
        logs: { push: jest.fn() },
        save: jest.fn().mockResolvedValue(mockStock),
      }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockArchivedStockWithMethods)
      const result = await service.unarchive(mockArchivedStock._id, mockUserId)
      expect(mockArchivedStockWithMethods.isArchived).toBe(false)
      expect(logsService.generateLogForArchive).toHaveBeenCalledWith(mockUserId, false)
      expect(mockArchivedStockWithMethods.logs.push).toHaveBeenCalledWith(mockLog)
      expect(mockArchivedStockWithMethods.save).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Склад восстановлен из архива' })
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockResolvedValue(null)
      await expect(service.unarchive('nonexistent-id', mockUserId))
        .rejects.toThrow(new NotFoundException('Склад не найден'))
    })
    it('должен выбрасывать ForbiddenException если склад не архивирован', async () => {
      const mockActiveStock = { ...mockStock, isArchived: false }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockActiveStock)
      await expect(service.unarchive(mockStock._id, mockUserId))
        .rejects.toThrow(new ForbiddenException('Склад не находится в архиве'))
    })
  })
  describe('isLocked', () => {
    it('должен возвращать true если есть поставки', async () => {
      const stockId = new mongoose.Types.ObjectId().toString()
      const mockStockForLock = { ...mockStock, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockForLock)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([{ _id: 'arrival1' }] as any)
      const result = await service.isLocked(stockId)
      expect(arrivalModel.find).toHaveBeenCalledWith({
        stock: mockStockForLock._id,
      })
      expect(result).toBe(true)
    })
    it('должен возвращать true если есть заказы', async () => {
      const stockId = new mongoose.Types.ObjectId().toString()
      const mockStockForLock = { ...mockStock, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockForLock)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([])
      jest.spyOn(orderModel, 'find').mockResolvedValue([{ _id: 'order1' }] as any)
      const result = await service.isLocked(stockId)
      expect(orderModel.find).toHaveBeenCalledWith({
        stock: mockStockForLock._id,
      })
      expect(result).toBe(true)
    })
    it('должен возвращать false если нет поставок и заказов', async () => {
      const stockId = new mongoose.Types.ObjectId().toString()
      const mockStockForLock = { ...mockStock, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(stockModel, 'findById').mockResolvedValue(mockStockForLock)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([])
      jest.spyOn(orderModel, 'find').mockResolvedValue([])
      const result = await service.isLocked(stockId)
      expect(result).toBe(false)
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockResolvedValue(null)
      await expect(service.isLocked('non-existent-id'))
        .rejects.toThrow(new NotFoundException('Склад не найден'))
    })
  })
  describe('delete', () => {
    it('должен удалять склад если нет активных товаров и склад не заблокирован', async () => {
      const stockWithoutProducts = {
        ...mockStock,
        products: [],
      }
      jest.spyOn(stockModel, 'findById').mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(stockWithoutProducts),
      }) as any)
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      const deleteSpy = jest.spyOn(stockModel, 'findByIdAndDelete').mockResolvedValue(stockWithoutProducts as any)
      const result = await service.delete(stockWithoutProducts._id)
      expect(deleteSpy).toHaveBeenCalledWith(stockWithoutProducts._id)
      expect(result).toEqual({ message: 'Склад успешно удален.' })
    })
    it('должен выбрасывать NotFoundException если склад не найден', async () => {
      jest.spyOn(stockModel, 'findById').mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }) as any)
      await expect(service.delete('nonexistent-id'))
        .rejects.toThrow(new NotFoundException('Склад не найден.'))
    })
    it('должен выбрасывать ForbiddenException если на складе есть активные товары', async () => {
      const stockWithProducts = {
        ...mockStock,
        products: [{ product: new mongoose.Types.ObjectId(), amount: 5 }],
      }
      jest.spyOn(stockModel, 'findById').mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(stockWithProducts),
      }) as any)
      await expect(service.delete(stockWithProducts._id)).rejects.toThrow(
        new ForbiddenException('На складе есть товары. Удаление невозможно.')
      )
    })
    it('должен выбрасывать ForbiddenException если склад заблокирован', async () => {
      const stockWithoutProducts = {
        ...mockStock,
        products: [],
      }
      jest.spyOn(stockModel, 'findById').mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(stockWithoutProducts),
      }) as any)
      jest.spyOn(service, 'isLocked').mockResolvedValue(true)
      await expect(service.delete(stockWithoutProducts._id)).rejects.toThrow(
        new ForbiddenException('Склад участвует в архивироавнных поставках или заказах. Удаление невозможно.')
      )
    })
    it('должен проверять наличие товаров с количеством больше 0', async () => {
      const stockWithZeroProducts = {
        ...mockStock,
        products: [
          { product: new mongoose.Types.ObjectId(), amount: 0 },
          { product: new mongoose.Types.ObjectId(), amount: 0 }
        ],
      }
      jest.spyOn(stockModel, 'findById').mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(stockWithZeroProducts),
      }) as any)
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      const deleteSpy = jest.spyOn(stockModel, 'findByIdAndDelete').mockResolvedValue(stockWithZeroProducts as any)
      const result = await service.delete(stockWithZeroProducts._id)
      expect(deleteSpy).toHaveBeenCalledWith(stockWithZeroProducts._id)
      expect(result).toEqual({ message: 'Склад успешно удален.' })
    })
  })
})

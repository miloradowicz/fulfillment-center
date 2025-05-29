/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { OrdersService } from '../src/services/orders.service'
import { getModelToken } from '@nestjs/mongoose'
import { Order } from '../src/schemas/order.schema'
import { Task } from '../src/schemas/task.schema'
import { ProductsService } from '../src/services/products.service'
import { StocksService } from '../src/services/stocks.service'
import { FilesService } from '../src/services/files.service'
import { CounterService } from '../src/services/counter.service'
import { StockManipulationService } from '../src/services/stock-manipulation.service'
import { LogsService } from '../src/services/logs.service'
import { Invoice } from '../src/schemas/invoice.schema'
import * as mongoose from 'mongoose'
describe('OrdersService', () => {
  let service: OrdersService
  let orderModel: any
  let taskModel: any
  let productsService: any
  let stocksService: any
  let filesService: any
  let counterService: any
  let stockManipulationService: any
  let logsService: any
  let invoiceModel: any
  const mockOrder = {
    _id: 'order-id',
    orderNumber: 'ORD-123',
    client: 'client-id',
    stock: 'stock-id',
    products: [
      {
        product: 'product-id',
        amount: 5
      }
    ],
    price: 500,
    sent_at: new Date(),
    status: 'в сборке',
    isArchived: false,
    documents: [],
    save: jest.fn().mockResolvedValue(this),
    populate: jest.fn().mockReturnThis(),
    execPopulate: jest.fn().mockResolvedValue(this),
    set: jest.fn().mockReturnThis()
  }
  beforeEach(async () => {
    const orderModelFactory = jest.fn().mockImplementation((dto) => {
      return {
        ...mockOrder,
        ...dto,
        save: jest.fn().mockResolvedValue({ ...mockOrder, ...dto }),
        populate: jest.fn().mockReturnThis(),
        execPopulate: jest.fn().mockResolvedValue(this),
        set: jest.fn().mockReturnThis()
      };
    });
    Object.assign(orderModelFactory, {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn()
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: orderModelFactory
        },
        {
          provide: getModelToken(Task.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn()
          }
        },
        {
          provide: getModelToken(Invoice.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn().mockResolvedValue(null),
            exists: jest.fn().mockResolvedValue(false),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn()
          }
        },
        {
          provide: ProductsService,
          useValue: {
            updateProductAmount: jest.fn()
          }
        },
        {
          provide: StocksService,
          useValue: {
            getStockWithPopulatedProducts: jest.fn()
          }
        },
        {
          provide: FilesService,
          useValue: {
            getFilePath: jest.fn().mockImplementation(filename => `uploads/documents/${filename}`)
          }
        },
        {
          provide: CounterService,
          useValue: {
            getNextSequence: jest.fn().mockResolvedValue(123)
          }
        },
        {
          provide: StockManipulationService,
          useValue: {
            init: jest.fn(),
            testStock: jest.fn().mockReturnValue(true),
            testStockProducts: jest.fn().mockReturnValue(true),
            saveStock: jest.fn().mockResolvedValue(true),
            decreaseProductStock: jest.fn().mockResolvedValue(true),
            increaseProductStock: jest.fn().mockResolvedValue(true),
            increaseDefectStock: jest.fn().mockResolvedValue(true),
            decreaseDefectStock: jest.fn().mockResolvedValue(true)
          }
        },
        {
          provide: LogsService,
          useValue: {
            trackChanges: jest.fn(),
            generateLogForCreate: jest.fn().mockReturnValue({
              user: 'user-id',
              change: 'Создан объект',
              date: new Date()
            }),
            generateLogForArchive: jest.fn().mockReturnValue({
              user: 'user-id',
              change: 'Архивирован объект',
              date: new Date()
            })
          }
        }
      ]
    }).compile()
    service = module.get<OrdersService>(OrdersService)
    orderModel = module.get(getModelToken(Order.name))
    taskModel = module.get(getModelToken(Task.name))
    productsService = module.get<ProductsService>(ProductsService)
    stocksService = module.get<StocksService>(StocksService)
    filesService = module.get<FilesService>(FilesService)
    counterService = module.get<CounterService>(CounterService)
    stockManipulationService = module.get<StockManipulationService>(StockManipulationService)
    logsService = module.get<LogsService>(LogsService)
    invoiceModel = module.get(getModelToken(Invoice.name))
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getAll', () => {
    it('should return all non-archived orders', async () => {
      const orders = [mockOrder]
      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(orders),
        reverse: jest.fn().mockReturnValue(orders)
      })
      const result = await service.getAll(true)
      expect(orderModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(result).toEqual(orders)
    })
  })
  describe('getAllWithClient', () => {
    it('should return all non-archived orders with client data populated', async () => {
      const populatedOrders = [{ ...mockOrder, client: { _id: 'client-id', name: 'Client name' } }]
      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(populatedOrders),
        reverse: jest.fn().mockReturnValue(populatedOrders)
      })
      const result = await service.getAllWithClient()
      expect(orderModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(result).toEqual(populatedOrders)
    })
  })
  describe('getAllArchived', () => {
    it('should return all archived orders', async () => {
      const archivedOrders = [{ ...mockOrder, isArchived: true }]
      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedOrders),
        reverse: jest.fn().mockReturnValue(archivedOrders)
      })
      const result = await service.getAllArchived()
      expect(orderModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(result).toEqual(archivedOrders)
    })
  })
  describe('getById', () => {
    it('should return an order by id', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder)
      })
      const result = await service.getById('order-id')
      expect(orderModel.findById).toHaveBeenCalledWith('order-id')
      expect(result).toEqual(mockOrder)
    })
    it('should throw an error if order is not found', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })
      await expect(service.getById('non-existent-id')).rejects.toThrow('Заказ не найден')
    })
    it('should throw an error if order is archived', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockOrder, isArchived: true })
      })
      await expect(service.getById('archived-order-id')).rejects.toThrow('Заказ в архиве')
    })
  })
  describe('getByIdWithPopulate', () => {
    it('should return an order by id with populated fields', async () => {
      const populatedOrder = {
        ...mockOrder,
        client: { _id: 'client-id', name: 'Client name' },
        stock: { _id: 'stock-id', name: 'Stock name' },
        products: [{ product: { _id: 'product-id', name: 'Product name' }, amount: 5 }]
      }
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(populatedOrder)
      })
      invoiceModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ status: 'оплачен' })
      })
      const result = await service.getByIdWithPopulate('order-id')
      expect(orderModel.findById).toHaveBeenCalledWith('order-id')
      expect(result).toEqual({
        ...populatedOrder,
        paymentStatus: 'оплачен'
      })
    })
    it('should throw an error if order is not found', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })
      await expect(service.getByIdWithPopulate('non-existent-id')).rejects.toThrow('Заказ не найден')
    })
  })
  describe('getArchivedById', () => {
    it('should return an archived order by id', async () => {
      const archivedOrder = { ...mockOrder, isArchived: true }
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedOrder)
      })
      const result = await service.getArchivedById('order-id')
      expect(orderModel.findById).toHaveBeenCalledWith('order-id')
      expect(result).toEqual(archivedOrder)
    })
    it('should throw an error if archived order is not found', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })
      await expect(service.getArchivedById('non-existent-id')).rejects.toThrow('Заказ не найден')
    })
    it('should throw an error if order is not archived', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder)
      })
      await expect(service.getArchivedById('non-archived-order-id')).rejects.toThrow('Этот заказ не в архиве')
    })
  })
  describe('archive', () => {
    it('should archive an order', async () => {
      const order = {
        _id: 'order-id',
        isArchived: false,
        status: 'доставлен', 
        logs: [],
        save: jest.fn().mockImplementation(function () {
          this.isArchived = true
          return this
        }),
      }
      const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
      orderModel.findById.mockResolvedValue(order)
      invoiceModel.exists.mockResolvedValue(null)
      const result = await service.archive('order-id', mockUserId)
      expect(result).toEqual({ message: 'Заказ перемещен в архив' })
      expect(order.isArchived).toBe(true)
      expect(order.save).toHaveBeenCalled()
    })
    it('should throw ForbiddenException if order is already archived', async () => {
      const order = {
        _id: 'order-id',
        isArchived: true,
        status: 'доставлен', 
      }
      const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
      orderModel.findById.mockResolvedValue(order)
      await expect(service.archive('order-id', mockUserId)).rejects.toThrow('Заказ уже в архиве')
    })
  })
  describe('unarchive', () => {
    it('should unarchive an order', async () => {
      const order = {
        _id: 'order-id',
        isArchived: true,
        logs: [],
        save: jest.fn().mockImplementation(function () {
          this.isArchived = false
          return this
        }),
      }
      const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
      orderModel.findById.mockResolvedValue(order)
      const result = await service.unarchive('order-id', mockUserId)
      expect(result).toEqual({ message: 'Заказ восстановлен из архива' })
      expect(order.isArchived).toBe(false)
      expect(order.save).toHaveBeenCalled()
    })
    it('should throw ForbiddenException if order is not archived', async () => {
      const order = {
        _id: 'order-id',
        isArchived: false,
      }
      const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
      orderModel.findById.mockResolvedValue(order)
      await expect(service.unarchive('order-id', mockUserId)).rejects.toThrow('Заказ не находится в архиве')
    })
  })
  describe('delete', () => {
    it('should delete an order and related files', async () => {
      const orderWithDocuments = {
        ...mockOrder,
        status: 'доставлен',
        documents: [
          { document: 'uploads/documents/test.pdf' },
          { document: 'uploads/documents/test2.pdf' }
        ],
        deleteOne: jest.fn().mockResolvedValue(true)
      }
      orderModel.findById.mockResolvedValue(orderWithDocuments)
      invoiceModel.exists.mockResolvedValue(null)
      const result = await service.delete('order-id')
      expect(orderWithDocuments.deleteOne).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Заказ удалён' })
    })
  })
  describe('getByIdWithPopulate', () => {
    it('should return order with full population and payment status', async () => {
      const populatedOrder = { ...mockOrder, client: { name: 'Test Client' } }
      const invoice = { status: 'оплачено' }
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(populatedOrder)
      }
      orderModel.findById.mockReturnValue(mockQuery)
      invoiceModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(invoice)
      })
      const result = await service.getByIdWithPopulate('order-id')
      expect(result).toEqual({
        ...populatedOrder,
        paymentStatus: 'оплачено'
      })
    })
    it('should return order with null payment status when no invoice', async () => {
      const populatedOrder = { ...mockOrder }
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(populatedOrder)
      }
      orderModel.findById.mockReturnValue(mockQuery)
      invoiceModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })
      const result = await service.getByIdWithPopulate('order-id')
      expect(result).toEqual({
        ...populatedOrder,
        paymentStatus: null
      })
    })
  })
  describe('getArchivedById', () => {
    it('should return archived order', async () => {
      const archivedOrder = { ...mockOrder, isArchived: true }
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedOrder)
      })
      const result = await service.getArchivedById('order-id')
      expect(result).toEqual(archivedOrder)
    })
    it('should throw NotFoundException when order not found', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      })
      await expect(service.getArchivedById('non-existent-id')).rejects.toThrow('Заказ не найден')
    })
    it('should throw ForbiddenException when order is not archived', async () => {
      const nonArchivedOrder = { ...mockOrder, isArchived: false }
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(nonArchivedOrder)
      })
      await expect(service.getArchivedById('order-id')).rejects.toThrow('Этот заказ не в архиве')
    })
  })
  describe('doStocking', () => {
    it('should decrease product stock when order is in transit', async () => {
      const order = {
        ...mockOrder,
        status: 'в пути',
        products: [{ product: 'product-id', amount: 5 }],
        defects: []
      }
      await service.doStocking(order as any)
      expect(stockManipulationService.decreaseProductStock).toHaveBeenCalledWith(
        order.stock,
        order.products
      )
    })
    it('should decrease product stock and increase defect stock when delivered', async () => {
      const order = {
        ...mockOrder,
        status: 'доставлен',
        products: [{ product: 'product-id', amount: 5 }],
        defects: [{ product: 'product-id', amount: 1 }]
      }
      await service.doStocking(order as any)
      expect(stockManipulationService.decreaseProductStock).toHaveBeenCalledWith(
        order.stock,
        order.products
      )
      expect(stockManipulationService.increaseDefectStock).toHaveBeenCalledWith(
        order.stock,
        order.defects
      )
    })
    it('should not manipulate stock when order is in assembly', async () => {
      const order = {
        ...mockOrder,
        status: 'в сборке',
        products: [{ product: 'product-id', amount: 5 }]
      }
      await service.doStocking(order as any)
      expect(stockManipulationService.decreaseProductStock).not.toHaveBeenCalled()
      expect(stockManipulationService.increaseDefectStock).not.toHaveBeenCalled()
    })
  })
  describe('undoStocking', () => {
    it('should increase product stock when undoing transit order', async () => {
      const order = {
        ...mockOrder,
        status: 'в пути',
        products: [{ product: 'product-id', amount: 5 }],
        defects: []
      }
      await service.undoStocking(order as any)
      expect(stockManipulationService.increaseProductStock).toHaveBeenCalledWith(
        order.stock,
        order.products
      )
    })
    it('should increase product stock and decrease defect stock when undoing delivered order', async () => {
      const order = {
        ...mockOrder,
        status: 'доставлен',
        products: [{ product: 'product-id', amount: 5 }],
        defects: [{ product: 'product-id', amount: 1 }]
      }
      await service.undoStocking(order as any)
      expect(stockManipulationService.increaseProductStock).toHaveBeenCalledWith(
        order.stock,
        order.products
      )
      expect(stockManipulationService.decreaseDefectStock).toHaveBeenCalledWith(
        order.stock,
        order.defects
      )
    })
  })
  describe('create', () => {
    it('should create order with files', async () => {
      const orderDto = {
        client: 'client-id',
        stock: 'stock-id',
        products: [{ product: 'product-id', amount: 5 }]
      }
      const files = [{ filename: 'test.pdf' }] as Express.Multer.File[]
      const userId = new mongoose.Types.ObjectId()
      const result = await service.create(orderDto as any, files, userId)
      expect(counterService.getNextSequence).toHaveBeenCalledWith('order')
      expect(logsService.generateLogForCreate).toHaveBeenCalledWith(userId)
      expect(stockManipulationService.init).toHaveBeenCalled()
      expect(stockManipulationService.testStockProducts).toHaveBeenCalled()
      expect(stockManipulationService.saveStock).toHaveBeenCalled()
    })
    it('should handle documents as string', async () => {
      const orderDto = {
        client: 'client-id',
        stock: 'stock-id',
        products: [{ product: 'product-id', amount: 5 }],
        documents: JSON.stringify([{ document: 'existing.pdf' }])
      }
      const userId = new mongoose.Types.ObjectId()
      await service.create(orderDto as any, [], userId)
      expect(stockManipulationService.testStockProducts).toHaveBeenCalled()
    })
    it('should handle invalid JSON documents', async () => {
      const orderDto = {
        client: 'client-id',
        stock: 'stock-id',
        products: [{ product: 'product-id', amount: 5 }],
        documents: 'invalid-json'
      }
      const userId = new mongoose.Types.ObjectId()
      await service.create(orderDto as any, [], userId)
      expect(stockManipulationService.testStockProducts).toHaveBeenCalled()
    })
    it('should throw BadRequestException when insufficient stock', async () => {
      const orderDto = {
        client: 'client-id',
        stock: 'stock-id',
        products: [{ product: 'product-id', amount: 5 }]
      }
      const userId = new mongoose.Types.ObjectId()
      stockManipulationService.testStockProducts.mockReturnValue(false)
      await expect(service.create(orderDto as any, [], userId)).rejects.toThrow(
        'На данном складе нет необходимого количества товара'
      )
    })
    it('should handle generic errors', async () => {
      const orderDto = {
        client: 'client-id',
        stock: 'stock-id',
        products: [{ product: 'product-id', amount: 5 }]
      }
      const userId = new mongoose.Types.ObjectId()
      counterService.getNextSequence.mockRejectedValue(new Error('Database error'))
      await expect(service.create(orderDto as any, [], userId)).rejects.toThrow(
        'Database error'
      )
    })
    it('should handle unknown errors', async () => {
      const orderDto = {
        client: 'client-id',
        stock: 'stock-id',
        products: [{ product: 'product-id', amount: 5 }]
      }
      const userId = new mongoose.Types.ObjectId()
      counterService.getNextSequence.mockRejectedValue('Unknown error')
      await expect(service.create(orderDto as any, [], userId)).rejects.toThrow(
        'Произошла ошибка при создании заказа'
      )
    })
  })
  describe('update', () => {
    it('should update order successfully', async () => {
      const existingOrder = {
        ...mockOrder,
        toObject: jest.fn().mockReturnValue(mockOrder),
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(mockOrder),
        logs: [],
        documents: []
      }
      orderModel.findById.mockResolvedValue(existingOrder)
      const updateDto = {
        status: 'доставлен' as const,
        defects: [],
        services: []
      }
      const userId = new mongoose.Types.ObjectId()
      const result = await service.update('order-id', updateDto, [], userId)
      expect(logsService.trackChanges).toHaveBeenCalled()
      expect(stockManipulationService.init).toHaveBeenCalled()
      expect(existingOrder.save).toHaveBeenCalled()
    })
    it('should throw NotFoundException when order not found', async () => {
      orderModel.findById.mockResolvedValue(null)
      await expect(service.update('non-existent-id', {}, [], new mongoose.Types.ObjectId()))
        .rejects.toThrow('Заказ не найден')
    })
    it('should handle files in update', async () => {
      const existingOrder = {
        ...mockOrder,
        toObject: jest.fn().mockReturnValue(mockOrder),
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(mockOrder),
        logs: [],
        documents: [{ document: 'existing.pdf' }]
      }
      orderModel.findById.mockResolvedValue(existingOrder)
      const files = [{ filename: 'new.pdf' }] as Express.Multer.File[]
      const userId = new mongoose.Types.ObjectId()
      await service.update('order-id', {}, files, userId)
      expect(filesService.getFilePath).toHaveBeenCalledWith('new.pdf')
    })
    it('should throw BadRequestException when insufficient stock', async () => {
      const existingOrder = {
        ...mockOrder,
        toObject: jest.fn().mockReturnValue(mockOrder),
        set: jest.fn().mockReturnThis(),
        logs: [],
        documents: []
      }
      orderModel.findById.mockResolvedValue(existingOrder)
      stockManipulationService.testStockProducts.mockReturnValue(false)
      await expect(service.update('order-id', {}, [], new mongoose.Types.ObjectId()))
        .rejects.toThrow('На данном складе нет необходимого количества товара')
    })
  })
  describe('archive', () => {
    it('should archive delivered order', async () => {
      const order = {
        ...mockOrder,
        status: 'доставлен',
        isArchived: false,
        logs: [],
        save: jest.fn().mockResolvedValue(mockOrder)
      }
      orderModel.findById.mockResolvedValue(order)
      invoiceModel.exists.mockResolvedValue(false)
      const result = await service.archive('order-id', new mongoose.Types.ObjectId())
      expect(order.isArchived).toBe(true)
      expect(logsService.generateLogForArchive).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Заказ перемещен в архив' })
    })
    it('should throw NotFoundException when order not found', async () => {
      orderModel.findById.mockResolvedValue(null)
      await expect(service.archive('non-existent-id', new mongoose.Types.ObjectId()))
        .rejects.toThrow('Заказ не найден')
    })
    it('should throw ForbiddenException when order already archived', async () => {
      const order = { ...mockOrder, isArchived: true }
      orderModel.findById.mockResolvedValue(order)
      await expect(service.archive('order-id', new mongoose.Types.ObjectId()))
        .rejects.toThrow('Заказ уже в архиве')
    })
    it('should throw ForbiddenException when order not delivered', async () => {
      const order = { ...mockOrder, status: 'в сборке', isArchived: false }
      orderModel.findById.mockResolvedValue(order)
      await expect(service.archive('order-id', new mongoose.Types.ObjectId()))
        .rejects.toThrow('Заказ можно архивировать только после доставки')
    })
    it('should throw ForbiddenException when has unpaid invoice', async () => {
      const order = { ...mockOrder, status: 'доставлен', isArchived: false }
      orderModel.findById.mockResolvedValue(order)
      invoiceModel.exists.mockResolvedValue(true)
      await expect(service.archive('order-id', new mongoose.Types.ObjectId()))
        .rejects.toThrow('Заказ не может быть перемещен в архив, так как он не оплачен.')
    })
  })
  describe('unarchive', () => {
    it('should unarchive order', async () => {
      const order = {
        ...mockOrder,
        isArchived: true,
        logs: [],
        save: jest.fn().mockResolvedValue(mockOrder)
      }
      orderModel.findById.mockResolvedValue(order)
      const result = await service.unarchive('order-id', new mongoose.Types.ObjectId())
      expect(order.isArchived).toBe(false)
      expect(result).toEqual({ message: 'Заказ восстановлен из архива' })
    })
    it('should throw NotFoundException when order not found', async () => {
      orderModel.findById.mockResolvedValue(null)
      await expect(service.unarchive('non-existent-id', new mongoose.Types.ObjectId()))
        .rejects.toThrow('Заказ не найден')
    })
    it('should throw ForbiddenException when order not archived', async () => {
      const order = { ...mockOrder, isArchived: false }
      orderModel.findById.mockResolvedValue(order)
      await expect(service.unarchive('order-id', new mongoose.Types.ObjectId()))
        .rejects.toThrow('Заказ не находится в архиве')
    })
  })
  describe('cancel', () => {
    it('should cancel order and undo stocking', async () => {
      const order = { ...mockOrder, stock: 'stock-id' }
      orderModel.findByIdAndDelete.mockResolvedValue(order)
      const result = await service.cancel('order-id')
      expect(stockManipulationService.init).toHaveBeenCalled()
      expect(stockManipulationService.saveStock).toHaveBeenCalledWith('stock-id')
      expect(result).toEqual({ message: 'Заказ успешно отменен' })
    })
    it('should throw NotFoundException when order not found', async () => {
      orderModel.findByIdAndDelete.mockResolvedValue(null)
      await expect(service.cancel('non-existent-id')).rejects.toThrow('Заказ не найден')
    })
  })
  describe('delete', () => {
    it('should delete delivered order without unpaid invoice', async () => {
      const order = {
        ...mockOrder,
        status: 'доставлен',
        deleteOne: jest.fn().mockResolvedValue(true)
      }
      orderModel.findById.mockResolvedValue(order)
      invoiceModel.exists.mockResolvedValue(false)
      const result = await service.delete('order-id')
      expect(order.deleteOne).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Заказ удалён' })
    })
    it('should throw NotFoundException when order not found', async () => {
      orderModel.findById.mockResolvedValue(null)
      await expect(service.delete('non-existent-id')).rejects.toThrow('Заказ не найден')
    })
    it('should throw ForbiddenException when order not delivered', async () => {
      const order = { ...mockOrder, status: 'в сборке' }
      orderModel.findById.mockResolvedValue(order)
      await expect(service.delete('order-id')).rejects.toThrow('Удалить можно только доставленный заказ')
    })
    it('should throw ForbiddenException when has unpaid invoice', async () => {
      const order = { ...mockOrder, status: 'доставлен' }
      orderModel.findById.mockResolvedValue(order)
      invoiceModel.exists.mockResolvedValue(true)
      await expect(service.delete('order-id')).rejects.toThrow('Заказ не может быть удалён, так как он не оплачен.')
    })
  })
})

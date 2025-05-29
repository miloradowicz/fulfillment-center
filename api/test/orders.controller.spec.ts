/* eslint-disable */

import {log, debug} from 'console'
import { Test, TestingModule } from '@nestjs/testing'
import { OrdersController } from '../src/controllers/orders.controller'
import { OrdersService } from '../src/services/orders.service'
import { UpdateOrderDto } from '../src/dto/update-order.dto'
import { Readable } from 'stream'
import mongoose from 'mongoose'
import { RolesGuard } from '../src/guards/roles.guard'
import { TokenAuthService } from '../src/services/token-auth.service'
import { RolesService } from '../src/services/roles.service'
import { CreateOrderDto } from '../src/dto/create-order.dto'
import { RequestWithUser } from '../src/types'
jest.mock('../src/guards/roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}))
describe('OrdersController', () => {
  let controller: OrdersController
  let service: OrdersService
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockReq = {
    user: {
      _id: mockUserId,
      email: 'test@example.com',
      role: 'admin'
    }
  } as RequestWithUser;
  const mockOrder = {
    _id: 'order-id',
    orderNumber: 'ORD-123',
    client: 'client-id',
    stock: 'stock-id',
    products: [
      {
        product: 'product-id',
        amount: 5,
      },
    ],
    price: 500,
    sent_at: new Date(),
    status: 'в сборке',
    isArchived: false,
  }
  const mockOrdersService = {
    getAll: jest.fn(),
    getAllWithClient: jest.fn(),
    getAllByClient: jest.fn(),
    getAllArchived: jest.fn(),
    getById: jest.fn(),
    getByIdWithPopulate: jest.fn(),
    getArchivedById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    delete: jest.fn(),
  }
  const mockTokenAuthService = {
    validateToken: jest.fn().mockResolvedValue(true),
  }
  const mockRolesService = {
    checkRoles: jest.fn().mockReturnValue(true),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: RolesGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: TokenAuthService,
          useValue: mockTokenAuthService,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()
    controller = module.get<OrdersController>(OrdersController)
    service = module.get<OrdersService>(OrdersService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('getAllOrders', () => {
    it('should return all orders without populate when neither client nor populate is not provided', async () => {
      const orders = [mockOrder]
      mockOrdersService.getAll.mockResolvedValue(orders)
      const result = await controller.getAllOrders()
      expect(service.getAll).toHaveBeenCalledWith(false)
      expect(result).toEqual(orders)
    })
    it('should return all orders with client when called with client id', async () => {
      const populatedOrders = [{
        ...mockOrder,
        client: { _id: mockOrder.client, name: 'Test Client' },
        stock: { _id: mockOrder.stock, name: 'Test Stock' },
      }]
      mockOrdersService.getAllByClient.mockResolvedValue(populatedOrders)
      const result = await controller.getAllOrders('client-id', '1')
      expect(service.getAllByClient).toHaveBeenCalledWith('client-id', true)
      debug(result)
      expect(result[0].client).toBeDefined()
      expect(result[0].stock).toBeDefined()
      expect(result).toEqual(populatedOrders)
    })
  })
  describe('getAllArchivedOrders', () => {
    it('should return all archived orders', async () => {
      const archivedOrders = [{ ...mockOrder, isArchived: true }]
      mockOrdersService.getAllArchived.mockResolvedValue(archivedOrders)
      const result = await controller.getAllArchivedOrders()
      expect(service.getAllArchived).toHaveBeenCalled()
      expect(result).toEqual(archivedOrders)
    })
  })
  describe('getOrderById', () => {
    it('should return an order by id without populate when populate is not true', async () => {
      mockOrdersService.getById.mockResolvedValue(mockOrder)
      const result = await controller.getOrderById('order-id', 'false')
      expect(service.getById).toHaveBeenCalledWith('order-id')
      expect(result).toEqual(mockOrder)
    })
    it('should return an order by id with populate when populate is true', async () => {
      const populatedOrder = {
        ...mockOrder,
        client: { _id: mockOrder.client, name: 'Test Client' },
        stock: { _id: mockOrder.stock, name: 'Test Stock' },
        products: [
          {
            product: { _id: mockOrder.products[0].product, name: 'Test Product' },
            amount: 5,
          },
        ],
      }
      mockOrdersService.getByIdWithPopulate.mockResolvedValue(populatedOrder)
      const result = await controller.getOrderById('order-id', 'true')
      expect(service.getByIdWithPopulate).toHaveBeenCalledWith('order-id')
      expect(result.client).toBeDefined()
      expect(result.stock).toBeDefined()
      expect(result.products[0].product).toBeDefined()
    })
  })
  describe('getArchivedOrder', () => {
    it('should return an archived order by id', async () => {
      const archivedOrder = { ...mockOrder, isArchived: true }
      mockOrdersService.getArchivedById.mockResolvedValue(archivedOrder)
      const result = await controller.getArchivedOrder('order-id')
      expect(service.getArchivedById).toHaveBeenCalledWith('order-id')
      expect(result).toEqual(archivedOrder)
    })
  })
  describe('createOrder', () => {
    it('should create an order', async () => {
      const files = [] as Express.Multer.File[]
      const createOrderDto: CreateOrderDto = {
        client: new mongoose.Types.ObjectId(),
        products: [
          {
            product: new mongoose.Types.ObjectId(),
            product_amount: 1,
          },
        ],
      } as any
      mockOrdersService.create.mockResolvedValue(mockOrder)
      const result = await controller.createOrder(createOrderDto, files, mockReq)
      expect(service.create).toHaveBeenCalledWith(createOrderDto, files, mockUserId)
      expect(result).toEqual(mockOrder)
    })
  })
  describe('updateOrder', () => {
    it('should update an order', async () => {
      const files = [] as Express.Multer.File[]
      const updateOrderDto: UpdateOrderDto = {
        comment: 'Updated comment',
        status: 'в сборке'
      }
      const updatedOrder = {
        ...mockOrder,
        comment: 'Updated comment',
        status: 'в сборке'
      }
      mockOrdersService.update.mockResolvedValue(updatedOrder)
      const result = await controller.updateOrder('order-id-1', updateOrderDto, files, mockReq)
      expect(mockOrdersService.update).toHaveBeenCalledWith('order-id-1', updateOrderDto, files, mockUserId)
      expect(result).toEqual(updatedOrder)
    })
  })
  describe('archiveOrder', () => {
    it('should archive an order', async () => {
      const archiveResult = { message: 'Заказ перемещен в архив' }
      mockOrdersService.archive.mockResolvedValue(archiveResult)
      const result = await controller.archiveOrder('order-id', mockReq)
      expect(service.archive).toHaveBeenCalledWith('order-id', mockUserId)
      expect(result).toEqual(archiveResult)
    })
  })
  describe('unarchiveOrder', () => {
    it('should unarchive an order', async () => {
      const unarchiveResult = { message: 'Заказ восстановлен из архива' }
      mockOrdersService.unarchive.mockResolvedValue(unarchiveResult)
      const result = await controller.unarchiveOrder('order-id', mockReq)
      expect(service.unarchive).toHaveBeenCalledWith('order-id', mockUserId)
      expect(result).toEqual(unarchiveResult)
    })
  })
  describe('deleteOrder', () => {
    it('should delete an order successfully', async () => {
      const deleteMessage = { message: 'Заказ успешно удален' }
      mockOrdersService.delete.mockResolvedValue(deleteMessage)
      const result = await controller.deleteOrder('order-id')
      expect(service.delete).toHaveBeenCalledWith('order-id')
      expect(result).toEqual(deleteMessage)
    })
  })
})

/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ProductsService } from '../src/services/products.service'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Product, ProductDocument } from '../src/schemas/product.schema'
import { Arrival } from '../src/schemas/arrival.schema'
import { Order } from '../src/schemas/order.schema'
import * as mongoose from 'mongoose'
import { Model } from 'mongoose'
import { CreateProductDto } from '../src/dto/create-product.dto'
import { UpdateProductDto } from '../src/dto/update-product.dto'
import { LogsService } from '../src/services/logs.service'
describe('ProductsService', () => {
  let service: ProductsService
  let productModel: Model<ProductDocument>
  let arrivalModel: Model<any>
  let orderModel: Model<any>
  let logsService: LogsService
  const mockProduct = {
    _id: new mongoose.Types.ObjectId().toString(),
    isArchived: false,
    client: new mongoose.Types.ObjectId(),
    title: 'Test Product',
    barcode: '1234567890123',
    article: 'TP-001',
    dynamic_fields: [{ key: 'color', label: 'Цвет', value: 'красный' }],
    logs: [],
    populate: jest.fn().mockImplementation(function () {
      return this
    }),
    exec: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
      _id: new mongoose.Types.ObjectId().toString(),
      isArchived: false,
      client: new mongoose.Types.ObjectId(),
      title: 'Test Product',
      barcode: '1234567890123',
      article: 'TP-001',
      dynamic_fields: [{ key: 'color', label: 'Цвет', value: 'красный' }],
      logs: []
    })
  }
  const mockArchivedProduct = {
    ...mockProduct,
    isArchived: true,
  }
  const mockProductArray = [
    { ...mockProduct },
    {
      ...mockProduct,
      _id: new mongoose.Types.ObjectId().toString(),
      title: 'Test Product 2',
    },
  ]
  const mockFindQuery = {
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockProductArray),
    reverse: jest.fn().mockReturnValue(mockProductArray),
  }
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            find: jest.fn().mockImplementation(() => mockFindQuery),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn().mockResolvedValue(mockProduct),
            findByIdAndDelete: jest.fn().mockResolvedValue(mockProduct),
            create: jest.fn().mockResolvedValue(mockProduct),
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
            trackChanges: jest.fn().mockReturnValue({
              user: 'user-id',
              change: 'Изменения в товаре',
              date: new Date()
            }),
            generateLogForCreate: jest.fn().mockReturnValue({
              user: 'user-id',
              change: 'Создан товар',
              date: new Date()
            }),
            generateLogForArchive: jest.fn().mockReturnValue({
              user: 'user-id',
              change: 'Архивирован товар',
              date: new Date()
            })
          },
        }
      ],
    }).compile()
    service = module.get<ProductsService>(ProductsService)
    productModel = module.get<Model<ProductDocument>>(getModelToken(Product.name))
    arrivalModel = module.get<Model<any>>(getModelToken(Arrival.name))
    orderModel = module.get<Model<any>>(getModelToken(Order.name))
    logsService = module.get<LogsService>(LogsService)
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getById', () => {
    it('should return a product without populating', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any)
      const result = await service.getById(mockProduct._id, false)
      expect(productModel.findById).toHaveBeenCalledWith(mockProduct._id)
      expect(result).toEqual(mockProduct)
    })
    it('should return a product with populating', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any)
      const result = await service.getById(mockProduct._id, true)
      expect(productModel.findById).toHaveBeenCalledWith(mockProduct._id)
      expect(result).toEqual(mockProduct)
    })
    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      await expect(service.getById('nonexistent-id', false)).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if product is archived', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockArchivedProduct),
      } as any)
      await expect(service.getById(mockArchivedProduct._id, false)).rejects.toThrow(ForbiddenException)
    })
  })
  describe('getAllByClient', () => {
    it('should return all unarchived products for a client without populating', async () => {
      const clientId = new mongoose.Types.ObjectId().toString()
      const result = await service.getAllByClient(clientId, false)
      expect(mockFindQuery.find).toHaveBeenCalledWith({ client: clientId })
      expect(result).toEqual(mockProductArray)
    })
    it('should return all unarchived products for a client with populating', async () => {
      const clientId = new mongoose.Types.ObjectId().toString()
      const result = await service.getAllByClient(clientId, true)
      expect(mockFindQuery.find).toHaveBeenCalledWith({ client: clientId })
      expect(mockFindQuery.populate).toHaveBeenCalledWith('client')
      expect(result).toEqual(mockProductArray)
    })
  })
  describe('getAll', () => {
    it('should return all unarchived products without populating', async () => {
      const result = await service.getAll(false)
      expect(productModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(result).toEqual(mockProductArray)
    })
    it('should return all unarchived products with populating', async () => {
      const result = await service.getAll(true)
      expect(productModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(mockFindQuery.populate).toHaveBeenCalledWith('client')
      expect(result).toEqual(mockProductArray)
    })
  })
  describe('getAllArchived', () => {
    it('should return all archived products without populating', async () => {
      const archivedProducts = [mockArchivedProduct]
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedProducts)
      }
      jest.spyOn(productModel, 'find').mockReturnValue(mockQuery as any)
      const result = await service.getAllArchived(false)
      expect(productModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(result).toEqual(archivedProducts.reverse())
    })
    it('should return all archived products with populating', async () => {
      const archivedProducts = [mockArchivedProduct]
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedProducts)
      }
      jest.spyOn(productModel, 'find').mockReturnValue(mockQuery as any)
      const result = await service.getAllArchived(true)
      expect(productModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: 'client',
        select: 'name'
      })
      expect(result).toEqual(archivedProducts.reverse())
    })
  })
  describe('getArchivedById', () => {
    it('should return archived product without populating', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockArchivedProduct)
      } as any)
      const result = await service.getArchivedById(mockArchivedProduct._id, false)
      expect(productModel.findById).toHaveBeenCalledWith(mockArchivedProduct._id)
      expect(result).toEqual(mockArchivedProduct)
    })
    it('should return archived product with populating', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockArchivedProduct)
      } as any)
      const result = await service.getArchivedById(mockArchivedProduct._id, true)
      expect(productModel.findById).toHaveBeenCalledWith(mockArchivedProduct._id)
      expect(result).toEqual(mockArchivedProduct)
    })
    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)
      await expect(service.getArchivedById('non-existent-id', false))
        .rejects.toThrow('Товар не найден')
    })
    it('should throw ForbiddenException when product not archived', async () => {
      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct)
      } as any)
      await expect(service.getArchivedById(mockProduct._id, false))
        .rejects.toThrow('Этот товар не в архиве')
    })
  })
  describe('isLocked', () => {
    it('should return true when product has arrivals', async () => {
      const productWithId = { ...mockProduct, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(productModel, 'findById').mockResolvedValue(productWithId as any)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([{ _id: 'arrival-id' }])
      const result = await service.isLocked('product-id')
      expect(result).toBe(true)
    })
    it('should return true when product has orders', async () => {
      const productWithId = { ...mockProduct, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(productModel, 'findById').mockResolvedValue(productWithId as any)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([])
      jest.spyOn(orderModel, 'find').mockResolvedValue([{ _id: 'order-id' }])
      const result = await service.isLocked('product-id')
      expect(result).toBe(true)
    })
    it('should return false when product has no arrivals or orders', async () => {
      const productWithId = { ...mockProduct, _id: new mongoose.Types.ObjectId() }
      jest.spyOn(productModel, 'findById').mockResolvedValue(productWithId as any)
      jest.spyOn(arrivalModel, 'find').mockResolvedValue([])
      jest.spyOn(orderModel, 'find').mockResolvedValue([])
      const result = await service.isLocked('product-id')
      expect(result).toBe(false)
    })
    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValue(null)
      await expect(service.isLocked('non-existent-id'))
        .rejects.toThrow('Товар не найден')
    })
  })
  describe('create', () => {
    it('should create product successfully', async () => {
      const createDto = {
        title: 'New Product',
        barcode: '9876543210987',
        article: 'NP-001',
        client: new mongoose.Types.ObjectId(),
        dynamic_fields: [{ key: 'size', label: 'Размер', value: 'L' }]
      }
      jest.spyOn(productModel, 'findOne').mockResolvedValue(null)
      jest.spyOn(productModel, 'create').mockResolvedValue(mockProduct as any)
      const result = await service.create(createDto as any, mockUserId)
      expect(productModel.findOne).toHaveBeenCalledWith({ barcode: createDto.barcode })
      expect(productModel.findOne).toHaveBeenCalledWith({ article: createDto.article })
      expect(productModel.create).toHaveBeenCalled()
      expect(result).toEqual(mockProduct)
    })
    it('should throw BadRequestException when barcode already exists', async () => {
      const createDto = {
        title: 'New Product',
        barcode: '1234567890123',
        article: 'NP-001',
        client: new mongoose.Types.ObjectId()
      }
      jest.spyOn(productModel, 'findOne').mockResolvedValueOnce(mockProduct as any)
      await expect(service.create(createDto as any, mockUserId))
        .rejects.toThrow(BadRequestException)
    })
    it('should throw BadRequestException when article already exists', async () => {
      const createDto = {
        title: 'New Product',
        barcode: '9876543210987',
        article: 'TP-001',
        client: new mongoose.Types.ObjectId()
      }
      jest.spyOn(productModel, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProduct as any)
      await expect(service.create(createDto as any, mockUserId))
        .rejects.toThrow(BadRequestException)
    })
    it('should handle dynamic_fields as string', async () => {
      const createDto = {
        title: 'New Product',
        barcode: '9876543210987',
        article: 'NP-001',
        client: new mongoose.Types.ObjectId(),
        dynamic_fields: JSON.stringify([{ key: 'size', label: 'Размер', value: 'L' }])
      }
      jest.spyOn(productModel, 'findOne').mockResolvedValue(null)
      jest.spyOn(productModel, 'create').mockResolvedValue(mockProduct as any)
      const result = await service.create(createDto as any, mockUserId)
      expect(result).toEqual(mockProduct)
    })
    it('should throw BadRequestException for invalid dynamic_fields JSON', async () => {
      const createDto = {
        title: 'New Product',
        barcode: '9876543210987',
        article: 'NP-001',
        client: new mongoose.Types.ObjectId(),
        dynamic_fields: 'invalid-json'
      }
      jest.spyOn(productModel, 'findOne').mockResolvedValue(null)
      await expect(service.create(createDto as any, mockUserId))
        .rejects.toThrow('Неверный формат dynamic_fields')
    })
    it('should handle generic errors', async () => {
      const createDto = {
        title: 'New Product',
        barcode: '9876543210987',
        article: 'NP-001',
        client: new mongoose.Types.ObjectId()
      }
      jest.spyOn(productModel, 'findOne').mockResolvedValue(null)
      jest.spyOn(productModel, 'create').mockRejectedValue(new Error('Database error'))
      await expect(service.create(createDto as any, mockUserId))
        .rejects.toThrow('Database error')
    })
    it('should handle unknown errors', async () => {
      const createDto = {
        title: 'New Product',
        barcode: '9876543210987',
        article: 'NP-001',
        client: new mongoose.Types.ObjectId()
      }
      jest.spyOn(productModel, 'findOne').mockResolvedValue(null)
      jest.spyOn(productModel, 'create').mockRejectedValue('Unknown error')
      await expect(service.create(createDto as any, mockUserId))
        .rejects.toThrow('Произошла ошибка при создании продукта')
    })
  })
  describe('update', () => {
    it('should update product successfully', async () => {
      const updateDto = {
        title: 'Updated Product',
        barcode: '9876543210987',
        article: 'UP-001'
      }
      const existingProduct = {
        ...mockProduct,
        barcode: '1234567890123',
        article: 'TP-001',
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(mockProduct),
        logs: []
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(existingProduct as any)
      jest.spyOn(productModel, 'findOne').mockResolvedValue(null)
      await service.update('product-id', updateDto as any, mockUserId)
      expect(existingProduct.set).toHaveBeenCalledWith(updateDto)
      expect(existingProduct.save).toHaveBeenCalled()
    })
    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValue(null)
      await expect(service.update('non-existent-id', {}, mockUserId))
        .rejects.toThrow('Товар не найден')
    })
    it('should throw BadRequestException when barcode already exists', async () => {
      const updateDto = {
        barcode: '9876543210987'
      }
      const existingProduct = {
        ...mockProduct,
        barcode: '1234567890123'
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(existingProduct as any)
      jest.spyOn(productModel, 'findOne').mockResolvedValue(mockProduct as any)
      await expect(service.update('product-id', updateDto as any, mockUserId))
        .rejects.toThrow(BadRequestException)
    })
    it('should throw BadRequestException when article already exists', async () => {
      const updateDto = {
        article: 'UP-001'
      }
      const existingProduct = {
        ...mockProduct,
        article: 'TP-001'
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(existingProduct as any)
      jest.spyOn(productModel, 'findOne')
        .mockResolvedValueOnce(null) 
        .mockResolvedValueOnce(mockProduct as any) 
      await expect(service.update('product-id', updateDto as any, mockUserId))
        .rejects.toThrow(BadRequestException)
    })
    it('should handle dynamic_fields as string', async () => {
      const updateDto = {
        dynamic_fields: JSON.stringify([{ key: 'size', label: 'Размер', value: 'XL' }])
      }
      const existingProduct = {
        ...mockProduct,
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(mockProduct),
        logs: []
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(existingProduct as any)
      await service.update('product-id', updateDto as any, mockUserId)
      expect(existingProduct.save).toHaveBeenCalled()
    })
    it('should throw BadRequestException for invalid dynamic_fields JSON', async () => {
      const updateDto = {
        dynamic_fields: 'invalid-json'
      }
      const existingProduct = {
        ...mockProduct,
        set: jest.fn(),
        logs: []
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(existingProduct as any)
      await expect(service.update('product-id', updateDto as any, mockUserId))
        .rejects.toThrow('Неверный формат dynamic_fields')
    })
    it('should handle generic errors', async () => {
      const updateDto = {
        title: 'Updated Product'
      }
      const existingProduct = {
        ...mockProduct,
        set: jest.fn(),
        save: jest.fn().mockRejectedValue(new Error('Database error')),
        logs: []
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(existingProduct as any)
      await expect(service.update('product-id', updateDto as any, mockUserId))
        .rejects.toThrow('Ошибка при обновлении продукта: Database error')
    })
    it('should handle unknown errors', async () => {
      const updateDto = {
        title: 'Updated Product'
      }
      const existingProduct = {
        ...mockProduct,
        set: jest.fn(),
        save: jest.fn().mockRejectedValue('Unknown error'),
        logs: []
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(existingProduct as any)
      await expect(service.update('product-id', updateDto as any, mockUserId))
        .rejects.toThrow('Ошибка при обновлении продукта: Unknown error')
    })
  })
  describe('archive', () => {
    it('should archive product successfully', async () => {
      const productToArchive = {
        ...mockProduct,
        isArchived: false,
        logs: [],
        save: jest.fn().mockResolvedValue(mockProduct)
      }
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      jest.spyOn(productModel, 'findById').mockResolvedValue(productToArchive as any)
      const result = await service.archive('product-id', mockUserId)
      expect(productToArchive.isArchived).toBe(true)
      expect(productToArchive.save).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Товар перемещен в архив' })
    })
    it('should throw ForbiddenException when product is locked', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(true)
      await expect(service.archive('product-id', mockUserId))
        .rejects.toThrow('Товар не может быть перемещен в архив, поскольку уже используется в поставках и/или заказах.')
    })
    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      jest.spyOn(productModel, 'findById').mockResolvedValue(null)
      await expect(service.archive('non-existent-id', mockUserId))
        .rejects.toThrow('Товар не найден')
    })
    it('should throw ForbiddenException when product already archived', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      jest.spyOn(productModel, 'findById').mockResolvedValue(mockArchivedProduct as any)
      await expect(service.archive('product-id', mockUserId))
        .rejects.toThrow('Товар уже в архиве')
    })
  })
  describe('unarchive', () => {
    it('should unarchive product successfully', async () => {
      const productToUnarchive = {
        ...mockArchivedProduct,
        logs: [],
        save: jest.fn().mockResolvedValue(mockProduct)
      }
      jest.spyOn(productModel, 'findById').mockResolvedValue(productToUnarchive as any)
      const result = await service.unarchive('product-id', mockUserId)
      expect(productToUnarchive.isArchived).toBe(false)
      expect(productToUnarchive.save).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Продукт восстановлен из архива' })
    })
    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValue(null)
      await expect(service.unarchive('non-existent-id', mockUserId))
        .rejects.toThrow('Продукт не найден')
    })
    it('should throw ForbiddenException when product not archived', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValue(mockProduct as any)
      await expect(service.unarchive('product-id', mockUserId))
        .rejects.toThrow('Продукт не находится в архиве')
    })
  })
  describe('delete', () => {
    it('should delete product successfully', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      jest.spyOn(productModel, 'findByIdAndDelete').mockResolvedValue(mockProduct as any)
      const result = await service.delete('product-id')
      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('product-id')
      expect(result).toEqual({ message: 'Товар успешно удален' })
    })
    it('should throw ForbiddenException when product is locked', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(true)
      await expect(service.delete('product-id'))
        .rejects.toThrow('Товар не может быть удален, поскольку уже используется в поставках и/или заказах.')
    })
    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      jest.spyOn(productModel, 'findByIdAndDelete').mockResolvedValue(null)
      await expect(service.delete('non-existent-id'))
        .rejects.toThrow('Товар не найден')
    })
    it('should handle generic errors', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      jest.spyOn(productModel, 'findByIdAndDelete').mockRejectedValue(new Error('Database error'))
      await expect(service.delete('product-id'))
        .rejects.toThrow('Ошибка при удалении продукта: Database error')
    })
    it('should handle unknown errors', async () => {
      jest.spyOn(service, 'isLocked').mockResolvedValue(false)
      jest.spyOn(productModel, 'findByIdAndDelete').mockRejectedValue('Unknown error')
      await expect(service.delete('product-id'))
        .rejects.toThrow('Ошибка при удалении продукта: Unknown error')
    })
  })
})

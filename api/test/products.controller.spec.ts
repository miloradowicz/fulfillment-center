/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ProductsController } from '../src/controllers/products.controller'
import { ProductsService } from '../src/services/products.service'
import { CreateProductDto } from '../src/dto/create-product.dto'
import { UpdateProductDto } from '../src/dto/update-product.dto'
import { RequestWithUser } from '../src/types'
import mongoose from 'mongoose'
describe('ProductsController', () => {
  let controller: ProductsController
  let productsService: ProductsService
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockUser = {
    _id: mockUserId,
    name: 'Test User',
    role: 'admin',
  }
  const mockProduct = {
    _id: 'product-id-1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    isArchived: false,
  }
  const mockProductsService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getAllByClient: jest.fn(),
    getAllArchived: jest.fn(),
    getById: jest.fn(),
    getArchivedById: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    delete: jest.fn(),
  }
  const mockRolesService = {
    hasRole: jest.fn().mockReturnValue(true),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: 'RolesService',
          useValue: mockRolesService,
        },
      ],
    })
      .overrideGuard(require('../src/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()
    controller = module.get<ProductsController>(ProductsController)
    productsService = module.get<ProductsService>(ProductsService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('createProduct', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = {
        client: 'client-id-1',
        title: 'New Product',
        barcode: '1234567890',
        article: 'ART-001',
      }
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      jest.spyOn(mockProductsService, 'create').mockResolvedValue(mockProduct)
      const result = await controller.createProduct(createDto, mockRequest)
      expect(result).toEqual(mockProduct)
      expect(mockProductsService.create).toHaveBeenCalledWith(createDto, mockUserId)
    })
  })
  describe('getAllProducts', () => {
    it('should get all products without client filter', async () => {
      const products = [mockProduct]
      jest.spyOn(mockProductsService, 'getAll').mockResolvedValue(products)
      const result = await controller.getAllProducts('', undefined)
      expect(result).toEqual(products)
      expect(mockProductsService.getAll).toHaveBeenCalledWith(false)
    })
    it('should get all products with populate', async () => {
      const products = [mockProduct]
      jest.spyOn(mockProductsService, 'getAll').mockResolvedValue(products)
      const result = await controller.getAllProducts('', '1')
      expect(result).toEqual(products)
      expect(mockProductsService.getAll).toHaveBeenCalledWith(true)
    })
    it('should get products by client', async () => {
      const clientId = 'client-id-1'
      const products = [mockProduct]
      jest.spyOn(mockProductsService, 'getAllByClient').mockResolvedValue(products)
      const result = await controller.getAllProducts(clientId, undefined)
      expect(result).toEqual(products)
      expect(mockProductsService.getAllByClient).toHaveBeenCalledWith(clientId, false)
    })
    it('should get products by client with populate', async () => {
      const clientId = 'client-id-1'
      const products = [mockProduct]
      jest.spyOn(mockProductsService, 'getAllByClient').mockResolvedValue(products)
      const result = await controller.getAllProducts(clientId, '1')
      expect(result).toEqual(products)
      expect(mockProductsService.getAllByClient).toHaveBeenCalledWith(clientId, true)
    })
  })
  describe('getAllArchivedProducts', () => {
    it('should get all archived products', async () => {
      const archivedProducts = [{ ...mockProduct, isArchived: true }]
      jest.spyOn(mockProductsService, 'getAllArchived').mockResolvedValue(archivedProducts)
      const result = await controller.getAllArchivedProducts(undefined)
      expect(result).toEqual(archivedProducts)
      expect(mockProductsService.getAllArchived).toHaveBeenCalledWith(false)
    })
    it('should get all archived products with populate', async () => {
      const archivedProducts = [{ ...mockProduct, isArchived: true }]
      jest.spyOn(mockProductsService, 'getAllArchived').mockResolvedValue(archivedProducts)
      const result = await controller.getAllArchivedProducts('1')
      expect(result).toEqual(archivedProducts)
      expect(mockProductsService.getAllArchived).toHaveBeenCalledWith(true)
    })
  })
  describe('getProduct', () => {
    it('should get a product by id', async () => {
      jest.spyOn(mockProductsService, 'getById').mockResolvedValue(mockProduct)
      const result = await controller.getProduct('product-id-1', undefined)
      expect(result).toEqual(mockProduct)
      expect(mockProductsService.getById).toHaveBeenCalledWith('product-id-1', false)
    })
    it('should get a product by id with populate', async () => {
      jest.spyOn(mockProductsService, 'getById').mockResolvedValue(mockProduct)
      const result = await controller.getProduct('product-id-1', '1')
      expect(result).toEqual(mockProduct)
      expect(mockProductsService.getById).toHaveBeenCalledWith('product-id-1', true)
    })
  })
  describe('getArchivedProduct', () => {
    it('should get an archived product by id', async () => {
      const archivedProduct = { ...mockProduct, isArchived: true }
      jest.spyOn(mockProductsService, 'getArchivedById').mockResolvedValue(archivedProduct)
      const result = await controller.getArchivedProduct('product-id-1', undefined)
      expect(result).toEqual(archivedProduct)
      expect(mockProductsService.getArchivedById).toHaveBeenCalledWith('product-id-1', false)
    })
    it('should get an archived product by id with populate', async () => {
      const archivedProduct = { ...mockProduct, isArchived: true }
      jest.spyOn(mockProductsService, 'getArchivedById').mockResolvedValue(archivedProduct)
      const result = await controller.getArchivedProduct('product-id-1', '1')
      expect(result).toEqual(archivedProduct)
      expect(mockProductsService.getArchivedById).toHaveBeenCalledWith('product-id-1', true)
    })
  })
  describe('archiveProduct', () => {
    it('should archive a product', async () => {
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const archiveResult = { message: 'Product archived successfully' }
      jest.spyOn(mockProductsService, 'archive').mockResolvedValue(archiveResult)
      const result = await controller.archiveProduct('product-id-1', mockRequest)
      expect(result).toEqual(archiveResult)
      expect(mockProductsService.archive).toHaveBeenCalledWith('product-id-1', mockUserId)
    })
  })
  describe('unarchiveProduct', () => {
    it('should unarchive a product', async () => {
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const unarchiveResult = { message: 'Product unarchived successfully' }
      jest.spyOn(mockProductsService, 'unarchive').mockResolvedValue(unarchiveResult)
      const result = await controller.unarchiveProduct('product-id-1', mockRequest)
      expect(result).toEqual(unarchiveResult)
      expect(mockProductsService.unarchive).toHaveBeenCalledWith('product-id-1', mockUserId)
    })
  })
  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const deleteResult = { message: 'Product deleted successfully' }
      jest.spyOn(mockProductsService, 'delete').mockResolvedValue(deleteResult)
      const result = await controller.deleteProduct('product-id-1')
      expect(result).toEqual(deleteResult)
      expect(mockProductsService.delete).toHaveBeenCalledWith('product-id-1')
    })
  })
  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = {
        title: 'Updated Product',
        barcode: '0987654321',
      }
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const updatedProduct = { ...mockProduct, ...updateDto }
      jest.spyOn(mockProductsService, 'update').mockResolvedValue(updatedProduct)
      const result = await controller.updateProduct('product-id-1', updateDto, mockRequest)
      expect(result).toEqual(updatedProduct)
      expect(mockProductsService.update).toHaveBeenCalledWith('product-id-1', updateDto, mockUserId)
    })
  })
}) 
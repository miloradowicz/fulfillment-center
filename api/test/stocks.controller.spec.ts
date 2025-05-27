/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { StocksController } from '../src/controllers/stocks.controller'
import { StocksService } from '../src/services/stocks.service'
import { CreateStockDto } from '../src/dto/create-stock.dto'
import { UpdateStockDto } from '../src/dto/update-stock.dto'
import { RequestWithUser } from '../src/types'
import mongoose from 'mongoose'
describe('StocksController', () => {
  let controller: StocksController
  let stocksService: StocksService
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockUser = {
    _id: mockUserId,
    name: 'Test User',
    role: 'admin',
  }
  const mockStock = {
    _id: 'stock-id-1',
    name: 'Test Stock',
    address: 'Test Address',
    isArchived: false,
  }
  const mockStocksService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getAllArchived: jest.fn(),
    getOne: jest.fn(),
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
      controllers: [StocksController],
      providers: [
        {
          provide: StocksService,
          useValue: mockStocksService,
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
    controller = module.get<StocksController>(StocksController)
    stocksService = module.get<StocksService>(StocksService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('createStock', () => {
    it('should create a stock', async () => {
      const createDto: CreateStockDto = {
        name: 'New Stock',
        address: 'New Address',
        products: [],
      }
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      jest.spyOn(mockStocksService, 'create').mockResolvedValue(mockStock)
      const result = await controller.createStock(createDto, mockRequest)
      expect(result).toEqual(mockStock)
      expect(mockStocksService.create).toHaveBeenCalledWith(createDto, mockUserId)
    })
  })
  describe('getStocks', () => {
    it('should get all stocks', async () => {
      const stocks = [mockStock]
      jest.spyOn(mockStocksService, 'getAll').mockResolvedValue(stocks)
      const result = await controller.getStocks()
      expect(result).toEqual(stocks)
      expect(mockStocksService.getAll).toHaveBeenCalled()
    })
  })
  describe('getOneStock', () => {
    it('should get a stock by id', async () => {
      jest.spyOn(mockStocksService, 'getOne').mockResolvedValue(mockStock)
      const result = await controller.getOneStock('stock-id-1')
      expect(result).toEqual(mockStock)
      expect(mockStocksService.getOne).toHaveBeenCalledWith('stock-id-1')
    })
  })
  describe('updateStock', () => {
    it('should update a stock', async () => {
      const updateDto: UpdateStockDto = {
        name: 'Updated Stock',
      }
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const updatedStock = { ...mockStock, ...updateDto }
      jest.spyOn(mockStocksService, 'update').mockResolvedValue(updatedStock)
      const result = await controller.updateStock('stock-id-1', updateDto, mockRequest)
      expect(result).toEqual(updatedStock)
      expect(mockStocksService.update).toHaveBeenCalledWith('stock-id-1', updateDto, mockUserId)
    })
  })
  describe('archiveStock', () => {
    it('should archive a stock', async () => {
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const archiveResult = { message: 'Stock archived successfully' }
      jest.spyOn(mockStocksService, 'archive').mockResolvedValue(archiveResult)
      const result = await controller.archiveStock('stock-id-1', mockRequest)
      expect(result).toEqual(archiveResult)
      expect(mockStocksService.archive).toHaveBeenCalledWith('stock-id-1', mockUserId)
    })
  })
  describe('deleteStock', () => {
    it('should delete a stock', async () => {
      const deleteResult = { message: 'Stock deleted successfully' }
      jest.spyOn(mockStocksService, 'delete').mockResolvedValue(deleteResult)
      const result = await controller.deleteStock('stock-id-1')
      expect(result).toEqual(deleteResult)
      expect(mockStocksService.delete).toHaveBeenCalledWith('stock-id-1')
    })
  })
}) 
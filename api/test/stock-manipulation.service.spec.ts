/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { StockManipulationService } from '../src/services/stock-manipulation.service'
import { NotFoundException } from '@nestjs/common'
import mongoose, { Model } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'
import { Stock } from '../src/schemas/stock.schema'
interface ProductWithAmount {
  product: mongoose.Types.ObjectId
  amount: number
  equals?: (id: any) => boolean
}
const createMockStock = (id: string) => {
  const productId = new mongoose.Types.ObjectId('680b696171c3093e3a536c7c')
  return {
    _id: new mongoose.Types.ObjectId(id),
    products: [
      {
        product: productId,
        amount: 10,
        equals: function (id) {
          return this.product.equals(id)
        },
      },
    ],
    defects: [
      {
        product: productId,
        amount: 5,
        equals: function (id) {
          return this.product.equals(id)
        },
      },
    ],
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this)
    }),
    toObject: jest.fn().mockImplementation(function () {
      return this
    }),
  }
}
describe('StockManipulationService', () => {
  let service: StockManipulationService
  let stockModel: Model<Stock>
  const stockId = new mongoose.Types.ObjectId('680b696171c3093e3a536c7d')
  const productId = new mongoose.Types.ObjectId('680b696171c3093e3a536c7c')
  const productId2 = new mongoose.Types.ObjectId('680b696171c3093e3a536c7e')
  beforeEach(async () => {
    jest.clearAllMocks()
    const mockStockModel = {
      findById: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockManipulationService,
        {
          provide: getModelToken(Stock.name),
          useValue: mockStockModel,
        },
      ],
    }).compile()
    service = module.get<StockManipulationService>(StockManipulationService)
    stockModel = module.get<Model<Stock>>(getModelToken(Stock.name))
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('increaseProductStock', () => {
    it('should increase amount of existing product', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.increaseProductStock(stockId, [{ product: productId, amount: 5 } as ProductWithAmount])
      expect(mockStock.products[0].amount).toBe(15) 
      expect(mockStock.save).not.toHaveBeenCalled() 
    })
    it('should add new product if not exists', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.increaseProductStock(stockId, [{ product: productId2, amount: 7 } as ProductWithAmount])
      expect(mockStock.products).toHaveLength(2)
      expect(mockStock.products[1].product).toEqual(productId2)
      expect(mockStock.products[1].amount).toBe(7)
    })
    it('should throw NotFoundException if stock not found', async () => {
      ;(stockModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(
        service.increaseProductStock(stockId, [{ product: productId, amount: 5 } as ProductWithAmount]),
      ).rejects.toThrow(NotFoundException)
    })
    it('should use cached stock for multiple calls', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.increaseProductStock(stockId, [{ product: productId, amount: 5 } as ProductWithAmount])
      expect(stockModel.findById).toHaveBeenCalledTimes(1)
      await service.increaseProductStock(stockId, [{ product: productId, amount: 3 } as ProductWithAmount])
      expect(stockModel.findById).toHaveBeenCalledTimes(1)
      expect(mockStock.products[0].amount).toBe(18)
    })
  })
  describe('decreaseProductStock', () => {
    it('should decrease amount of existing product', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.decreaseProductStock(stockId, [{ product: productId, amount: 3 } as ProductWithAmount])
      expect(mockStock.products[0].amount).toBe(7) 
      expect(mockStock.save).not.toHaveBeenCalled() 
    })
    it('should add new product with negative amount if not exists', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.decreaseProductStock(stockId, [{ product: productId2, amount: 4 } as ProductWithAmount])
      expect(mockStock.products).toHaveLength(2)
      expect(mockStock.products[1].product).toEqual(productId2)
      expect(mockStock.products[1].amount).toBe(-4)
    })
    it('should throw NotFoundException if stock not found', async () => {
      ;(stockModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(
        service.decreaseProductStock(stockId, [{ product: productId, amount: 3 } as ProductWithAmount]),
      ).rejects.toThrow(NotFoundException)
    })
  })
  describe('increaseDefectStock', () => {
    it('should increase amount of existing defect product', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.increaseDefectStock(stockId, [{ product: productId, amount: 3 } as ProductWithAmount])
      expect(mockStock.defects[0].amount).toBe(8) 
    })
    it('should add new defect product if not exists', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.increaseDefectStock(stockId, [{ product: productId2, amount: 2 } as ProductWithAmount])
      expect(mockStock.defects).toHaveLength(2)
      expect(mockStock.defects[1].product).toEqual(productId2)
      expect(mockStock.defects[1].amount).toBe(2)
    })
    it('should throw NotFoundException if stock not found', async () => {
      ;(stockModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(
        service.increaseDefectStock(stockId, [{ product: productId, amount: 2 } as ProductWithAmount]),
      ).rejects.toThrow(NotFoundException)
    })
  })
  describe('decreaseDefectStock', () => {
    it('should decrease amount of existing defect product', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.decreaseDefectStock(stockId, [{ product: productId, amount: 2 } as ProductWithAmount])
      expect(mockStock.defects[0].amount).toBe(3) 
    })
    it('should add new defect product with negative amount if not exists', async () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      await service.decreaseDefectStock(stockId, [{ product: productId2, amount: 3 } as ProductWithAmount])
      expect(mockStock.defects).toHaveLength(2)
      expect(mockStock.defects[1].product).toEqual(productId2)
      expect(mockStock.defects[1].amount).toBe(-3)
    })
    it('should throw NotFoundException if stock not found', async () => {
      ;(stockModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(
        service.decreaseDefectStock(stockId, [{ product: productId, amount: 2 } as ProductWithAmount]),
      ).rejects.toThrow(NotFoundException)
    })
  })
  describe('testStockProducts', () => {
    it('должен возвращать true если все указанные товары имеют положительное количество', () => {
      const mockStock = createMockStock(stockId.toString())
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      const result = service.testStockProducts(stockId, [productId])
      expect(result).toBe(true)
    })
    it('должен возвращать false если некоторые указанные товары имеют отрицательное количество', () => {
      const mockStock = createMockStock(stockId.toString())
      mockStock.products[0].amount = -2 
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      const result = service.testStockProducts(stockId, [productId])
      expect(result).toBe(false)
    })
    it('должен возвращать true если склад не в кеше', () => {
      service['stocks'] = {}
      const result = service.testStockProducts(stockId, [productId])
      expect(result).toBe(true)
    })
    it('должен проверять только указанные товары', () => {
      const mockStock = createMockStock(stockId.toString())
      mockStock.products[0].amount = -5 
      mockStock.products.push({
        product: productId2,
        amount: 10, 
        equals: function (id) {
          return this.product.equals(id)
        },
      })
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      const result = service.testStockProducts(stockId, [productId2])
      expect(result).toBe(true)
      const result2 = service.testStockProducts(stockId, [productId])
      expect(result2).toBe(false)
    })
    it('должен возвращать true если указанные товары не найдены на складе', () => {
      const mockStock = createMockStock(stockId.toString())
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      const nonExistentProductId = new mongoose.Types.ObjectId()
      const result = service.testStockProducts(stockId, [nonExistentProductId])
      expect(result).toBe(true)
    })
  })
  describe('testStock', () => {
    it('should return true if all products have positive amounts', () => {
      const mockStock = createMockStock(stockId.toString())
      ;(stockModel.findById as jest.Mock).mockResolvedValue(mockStock)
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      const result = service.testStock(stockId)
      expect(result).toBe(true)
    })
    it('should return false if some products have negative amounts', () => {
      const mockStock = createMockStock(stockId.toString())
      mockStock.products[0].amount = -2 
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      const result = service.testStock(stockId)
      expect(result).toBe(false)
    })
    it('should return true if stock is not in cache', () => {
      service['stocks'] = {}
      const result = service.testStock(stockId)
      expect(result).toBe(true)
    })
  })
  describe('init', () => {
    it('should clear the stocks cache', () => {
      service['stocks'] = { [stockId.toString()]: createMockStock(stockId.toString()) as any }
      service.init()
      expect(service['stocks']).toEqual({})
    })
  })
  describe('saveStock', () => {
    it('should save the stock if it is in cache', async () => {
      const mockStock = createMockStock(stockId.toString())
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      await service.saveStock(stockId)
      expect(mockStock.save).toHaveBeenCalled()
    })
    it('should not do anything if stock is not in cache', async () => {
      service['stocks'] = {}
      const mockStock = createMockStock(stockId.toString())
      await service.saveStock(stockId)
      expect(mockStock.save).not.toHaveBeenCalled()
    })
    it('должен фильтровать товары с нулевым количеством перед сохранением', async () => {
      const mockStock = createMockStock(stockId.toString())
      mockStock.products = [
        {
          product: productId,
          amount: 0, 
          equals: function (id) {
            return this.product.equals(id)
          },
        },
        {
          product: productId2,
          amount: 5, 
          equals: function (id) {
            return this.product.equals(id)
          },
        },
      ]
      mockStock.defects = [
        {
          product: productId,
          amount: 0, 
          equals: function (id) {
            return this.product.equals(id)
          },
        },
        {
          product: productId2,
          amount: 2, 
          equals: function (id) {
            return this.product.equals(id)
          },
        },
      ]
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      await service.saveStock(stockId)
      expect(mockStock.products).toHaveLength(1)
      expect(mockStock.products[0].product).toEqual(productId2)
      expect(mockStock.products[0].amount).toBe(5)
      expect(mockStock.defects).toHaveLength(1)
      expect(mockStock.defects[0].product).toEqual(productId2)
      expect(mockStock.defects[0].amount).toBe(2)
      expect(mockStock.save).toHaveBeenCalled()
    })
    it('должен сохранять товары с отрицательным количеством', async () => {
      const mockStock = createMockStock(stockId.toString())
      mockStock.products = [
        {
          product: productId,
          amount: -3, 
          equals: function (id) {
            return this.product.equals(id)
          },
        },
        {
          product: productId2,
          amount: 5, 
          equals: function (id) {
            return this.product.equals(id)
          },
        },
      ]
      service['stocks'] = { [stockId.toString()]: mockStock as any }
      await service.saveStock(stockId)
      expect(mockStock.products).toHaveLength(2)
      expect(mockStock.products[0].amount).toBe(-3)
      expect(mockStock.products[1].amount).toBe(5)
      expect(mockStock.save).toHaveBeenCalled()
    })
  })
})

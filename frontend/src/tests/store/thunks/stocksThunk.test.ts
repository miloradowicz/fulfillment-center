/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchStocks,
  fetchArchivedStocks,
  fetchStockById,
  addStock,
  archiveStock,
  unarchiveStock,
  deleteStock,
  updateStock,
  addWriteOff
} from '../../../store/thunks/stocksThunk'
import {
  Stock,
  StockMutation,
  StockPopulate,
  StockWriteOffMutation,
  WriteOff,
  ValidationError,
  GlobalError
} from '../../../types'
import { isAxiosError } from 'axios'
import axiosAPI from '../../../utils/axiosAPI'

// Мокаем axiosAPI
jest.mock('../../../utils/axiosAPI', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

// Мокаем isAxiosError
jest.mock('axios', () => ({
  isAxiosError: jest.fn()
}))

const mockedAxiosAPI = axiosAPI as jest.Mocked<typeof axiosAPI>
const mockedIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>

describe('stocksThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('fetchStocks', () => {
    it('should successfully fetch stocks', async () => {
      const stocks: Stock[] = [
        {
          _id: 'stock-1',
          name: 'Основной склад',
          address: 'ул. Складская, 1'
        },
        {
          _id: 'stock-2',
          name: 'Дополнительный склад',
          address: 'ул. Складская, 2'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: stocks })

      const result = await store.dispatch(fetchStocks())

      expect(result.type).toBe('stocks/fetchStocks/fulfilled')
      expect(result.payload).toEqual(stocks)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/stocks')
    })

    it('should handle fetch stocks error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchStocks())

      expect(result.type).toBe('stocks/fetchStocks/rejected')
    })
  })

  describe('fetchArchivedStocks', () => {
    it('should successfully fetch archived stocks', async () => {
      const archivedStocks: Stock[] = [
        {
          _id: 'stock-archived-1',
          name: 'Архивный склад',
          address: 'ул. Архивная, 1'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedStocks })

      const result = await store.dispatch(fetchArchivedStocks())

      expect(result.type).toBe('stocks/fetchArchivedCStocks/fulfilled')
      expect(result.payload).toEqual(archivedStocks)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/stocks/archived/all')
    })

    it('should handle fetch archived stocks error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchArchivedStocks())

      expect(result.type).toBe('stocks/fetchArchivedCStocks/rejected')
    })
  })

  describe('fetchStockById', () => {
    it('should successfully fetch stock by id', async () => {
      const stockId = 'stock-123'
      const stock: StockPopulate = {
        _id: stockId,
        name: 'Конкретный склад',
        address: 'ул. Конкретная, 123',
        products: [
          {
            _id: 'product-item-1',
            product: {
              _id: 'product-1',
              client: {
                _id: 'client-1',
                name: 'Тестовый клиент',
                phone_number: '+7 (999) 123-45-67',
                email: 'test@example.com',
                inn: '1234567890'
              },
              title: 'Товар на складе',
              barcode: '123456789',
              article: 'ART-001',
              dynamic_fields: [],
              logs: []
            },
            amount: 100
          }
        ]
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: stock })

      const result = await store.dispatch(fetchStockById(stockId))

      expect(result.type).toBe('stocks/fetchStockById/fulfilled')
      expect(result.payload).toEqual(stock)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/stocks/${stockId}`)
    })

    it('should handle fetch stock by id error', async () => {
      const stockId = 'stock-123'
      const error = new Error('Stock not found')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchStockById(stockId))

      expect(result.type).toBe('stocks/fetchStockById/rejected')
    })
  })

  describe('addStock', () => {
    it('should successfully add stock', async () => {
      const stockData: StockMutation = {
        name: 'Новый склад',
        address: 'ул. Новая, 1'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})

      const result = await store.dispatch(addStock(stockData))

      expect(result.type).toBe('stocks/addStock/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/stocks', stockData)
    })

    it('should handle validation error (400 status)', async () => {
      const stockData: StockMutation = {
        name: '',
        address: ''
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название склада обязательно']
          },
          address: {
            name: 'address',
            messages: ['Адрес склада обязателен']
          }
        }
      }

      const axiosError = {
        response: {
          status: 400,
          data: validationError
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addStock(stockData))

      expect(result.type).toBe('stocks/addStock/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const stockData: StockMutation = {
        name: 'Тестовый склад',
        address: 'ул. Тестовая, 1'
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addStock(stockData))

      expect(result.type).toBe('stocks/addStock/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveStock', () => {
    it('should successfully archive stock', async () => {
      const stockId = 'stock-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveStock(stockId))

      expect(result.type).toBe('stocks/archiveStock/fulfilled')
      expect(result.payload).toEqual({ id: stockId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/stocks/${stockId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const stockId = 'stock-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать склад с товарами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveStock(stockId))

      expect(result.type).toBe('stocks/archiveStock/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const stockId = 'stock-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveStock(stockId))

      expect(result.type).toBe('stocks/archiveStock/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveStock', () => {
    it('should successfully unarchive stock', async () => {
      const stockId = 'stock-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveStock(stockId))

      expect(result.type).toBe('stocks/unarchiveStock/fulfilled')
      expect(result.payload).toEqual({ id: stockId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/stocks/${stockId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const stockId = 'stock-123'
      const errorData: GlobalError = { message: 'Склад не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveStock(stockId))

      expect(result.type).toBe('stocks/unarchiveStock/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('deleteStock', () => {
    it('should successfully delete stock', async () => {
      const stockId = 'stock-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteStock(stockId))

      expect(result.type).toBe('stocks/deleteStock/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/stocks/${stockId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const stockId = 'stock-123'
      const errorData: GlobalError = { message: 'Нельзя удалить склад с товарами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteStock(stockId))

      expect(result.type).toBe('stocks/deleteStock/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('updateStock', () => {
    it('should successfully update stock', async () => {
      const stockId = 'stock-123'
      const stockData: StockMutation = {
        name: 'Обновленный склад',
        address: 'ул. Обновленная, 1'
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({})

      const result = await store.dispatch(updateStock({ stockId, stock: stockData }))

      expect(result.type).toBe('stocks/updateStock/fulfilled')
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/stocks/${stockId}`, stockData)
    })

    it('should handle update validation error (400 status)', async () => {
      const stockId = 'stock-123'
      const stockData: StockMutation = {
        name: '',
        address: ''
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название склада обязательно']
          }
        }
      }

      const axiosError = {
        response: {
          status: 400,
          data: validationError
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateStock({ stockId, stock: stockData }))

      expect(result.type).toBe('stocks/updateStock/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const stockId = 'stock-123'
      const stockData: StockMutation = {
        name: 'Тестовый склад',
        address: 'ул. Тестовая, 1'
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateStock({ stockId, stock: stockData }))

      expect(result.type).toBe('stocks/updateStock/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('addWriteOff', () => {
    it('should successfully add write off', async () => {
      const writeOffData: StockWriteOffMutation = {
        stock: 'stock-123',
        client: 'client-123',
        write_offs: [
          {
            product: 'product-1',
            amount: 5,
            reason: 'Брак'
          }
        ]
      }

      const responseData: WriteOff = {
        product: 'product-1',
        amount: 5,
        reason: 'Брак'
      }

      mockedAxiosAPI.patch.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(addWriteOff(writeOffData))

      expect(result.type).toBe('stocks/addWriteOff/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/stocks/${writeOffData.stock}/write-offs`, {
        write_offs: writeOffData.write_offs
      })
    })

    it('should handle write off validation error (400 status)', async () => {
      const writeOffData: StockWriteOffMutation = {
        stock: 'stock-123',
        client: 'client-123',
        write_offs: [
          {
            product: '',
            amount: -5,
            reason: ''
          }
        ]
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          product: {
            name: 'product',
            messages: ['Товар обязателен']
          },
          amount: {
            name: 'amount',
            messages: ['Количество должно быть положительным']
          },
          reason: {
            name: 'reason',
            messages: ['Причина списания обязательна']
          }
        }
      }

      const axiosError = {
        response: {
          status: 400,
          data: validationError
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addWriteOff(writeOffData))

      expect(result.type).toBe('stocks/addWriteOff/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const writeOffData: StockWriteOffMutation = {
        stock: 'stock-123',
        client: 'client-123',
        write_offs: [
          {
            product: 'product-1',
            amount: 5,
            reason: 'Брак'
          }
        ]
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addWriteOff(writeOffData))

      expect(result.type).toBe('stocks/addWriteOff/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty stocks list', async () => {
      const emptyStocks: Stock[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyStocks })

      const result = await store.dispatch(fetchStocks())

      expect(result.type).toBe('stocks/fetchStocks/fulfilled')
      expect(result.payload).toEqual(emptyStocks)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')

      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchStocks())

      expect(result.type).toBe('stocks/fetchStocks/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent stock operations', async () => {
      const stockData: StockMutation = {
        name: 'Concurrent stock',
        address: 'ул. Concurrent, 1'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [addResult, fetchResult] = await Promise.all([
        store.dispatch(addStock(stockData)),
        store.dispatch(fetchStocks())
      ])

      expect(addResult.type).toBe('stocks/addStock/fulfilled')
      expect(fetchResult.type).toBe('stocks/fetchStocks/fulfilled')
    })

    it('should handle stock with very long name and address', async () => {
      const longName = 'Очень длинное название склада '.repeat(10)
      const longAddress = 'Очень длинный адрес склада '.repeat(10)

      const stockData: StockMutation = {
        name: longName,
        address: longAddress
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})

      const result = await store.dispatch(addStock(stockData))

      expect(result.type).toBe('stocks/addStock/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/stocks', stockData)
    })

    it('should handle multiple write offs', async () => {
      const writeOffData: StockWriteOffMutation = {
        stock: 'stock-123',
        client: 'client-123',
        write_offs: [
          {
            product: 'product-1',
            amount: 5,
            reason: 'Брак'
          },
          {
            product: 'product-2',
            amount: 10,
            reason: 'Просрочка'
          },
          {
            product: 'product-3',
            amount: 2,
            reason: 'Повреждение'
          }
        ]
      }

      const responseData: WriteOff = {
        product: 'product-1',
        amount: 5,
        reason: 'Брак'
      }

      mockedAxiosAPI.patch.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(addWriteOff(writeOffData))

      expect(result.type).toBe('stocks/addWriteOff/fulfilled')
      expect(result.payload).toEqual(responseData)
    })
  })
})

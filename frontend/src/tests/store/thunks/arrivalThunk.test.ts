/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchArrivals,
  fetchArchivedArrivals,
  fetchArrivalById,
  fetchArrivalByIdWithPopulate,
  fetchArrivalsByClientId,
  fetchPopulatedArrivals,
  addArrival,
  archiveArrival,
  unarchiveArrival,
  cancelArrival,
  deleteArrival,
  updateArrival
} from '../../../store/thunks/arrivalThunk'
import {
  Arrival,
  ArrivalMutation,
  ArrivalWithClient,
  ArrivalWithPopulate,
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

// Мокаем createArrivalAndOrderFormData
jest.mock('../../../utils/createArrivalAndOrderFormData', () => ({
  createArrivalAndOrderFormData: jest.fn((data) => data)
}))

const mockedAxiosAPI = axiosAPI as jest.Mocked<typeof axiosAPI>
const mockedIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>

describe('arrivalThunk', () => {
  let store: any

  beforeEach(() => {
          store = configureStore({
        reducer: {
          test: (state = {}) => state
        }
      })
    jest.clearAllMocks()
  })

  describe('fetchArrivals', () => {
    it('should successfully fetch arrivals', async () => {
      const arrivals: Arrival[] = [
        {
          _id: 'arrival-1',
          client: 'client-1',
          products: [
            {
              product: 'product-1',
              description: 'Тестовый товар',
              amount: 10
            }
          ],
          arrival_date: '2023-01-01T00:00:00Z',
          sent_amount: '100',
          stock: 'stock-1',
          arrival_status: 'в обработке',
          paymentStatus: 'не оплачено',
          arrivalNumber: 'ARR-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: arrivals })

      const result = await store.dispatch(fetchArrivals())

      expect(result.type).toBe('arrivals/fetchArrivals/fulfilled')
      expect(result.payload).toEqual(arrivals)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/arrivals')
    })

    it('should handle fetch arrivals error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchArrivals())

      expect(result.type).toBe('arrivals/fetchArrivals/rejected')
    })
  })

  describe('fetchArchivedArrivals', () => {
    it('should successfully fetch archived arrivals', async () => {
      const archivedArrivals: ArrivalWithClient[] = [
        {
          _id: 'arrival-archived-1',
          client: {
            _id: 'client-1',
            name: 'Архивный клиент',
            phone_number: '+7 (999) 000-00-00',
            email: 'archived@example.com',
            inn: '0000000000'
          },
          products: [],
          arrival_date: '2023-01-01T00:00:00Z',
          sent_amount: '0',
          stock: {
            _id: 'stock-1',
            name: 'Склад 1',
            address: 'Адрес склада'
          },
          arrival_status: 'завершен',
          paymentStatus: 'оплачено',
          arrivalNumber: 'ARR-ARCH-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedArrivals })

      const result = await store.dispatch(fetchArchivedArrivals())

      expect(result.type).toBe('arrivals/fetchArchivedArrivals/fulfilled')
      expect(result.payload).toEqual(archivedArrivals)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/arrivals/archived/all', {
        params: { populate: '1' }
      })
    })
  })

  describe('fetchArrivalById', () => {
    it('should successfully fetch arrival by id', async () => {
      const arrivalId = 'arrival-123'
      const arrival: Arrival = {
        _id: arrivalId,
        client: 'client-1',
        products: [],
        arrival_date: '2023-01-01T00:00:00Z',
        sent_amount: '50',
        stock: 'stock-1',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        arrivalNumber: 'ARR-123',
        logs: [],
        defects: [],
        documents: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: arrival })

      const result = await store.dispatch(fetchArrivalById(arrivalId))

      expect(result.type).toBe('arrivals/fetchArrivalById/fulfilled')
      expect(result.payload).toEqual(arrival)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/arrivals/?=${arrivalId}`)
    })
  })

  describe('fetchArrivalByIdWithPopulate', () => {
    it('should successfully fetch arrival by id with populate', async () => {
      const arrivalId = 'arrival-123'
      const arrivalWithPopulate: ArrivalWithPopulate = {
        _id: arrivalId,
        client: {
          _id: 'client-1',
          name: 'Клиент с populate',
          phone_number: '+7 (999) 111-22-33',
          email: 'client@example.com',
          inn: '1111111111'
        },
        products: [
          {
            product: {
              _id: 'product-1',
              client: 'client-1',
              title: 'Товар с populate',
              barcode: '123456789',
              article: 'ART-001',
              dynamic_fields: [],
              logs: []
            },
            description: 'Описание товара с populate',
            amount: 3
          }
        ],
        defects: [],
        received_amount: [],
        logs: [],
        stock: {
          _id: 'stock-1',
          name: 'Склад с populate',
          address: 'Адрес склада с populate'
        },
        services: [],
        arrival_date: '2023-01-01T00:00:00Z',
        sent_amount: '30',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        arrivalNumber: 'ARR-123',
        documents: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: arrivalWithPopulate })

      const result = await store.dispatch(fetchArrivalByIdWithPopulate(arrivalId))

      expect(result.type).toBe('arrivals/fetchArrivalByIdWithPopulate/fulfilled')
      expect(result.payload).toEqual(arrivalWithPopulate)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/arrivals/${arrivalId}`, {
        params: { populate: '1' }
      })
    })
  })

  describe('fetchArrivalsByClientId', () => {
    it('should successfully fetch arrivals by client id', async () => {
      const clientId = 'client-123'
      const clientArrivals: Arrival[] = [
        {
          _id: 'arrival-1',
          client: clientId,
          products: [],
          arrival_date: '2023-01-01T00:00:00Z',
          sent_amount: '25',
          stock: 'stock-1',
          arrival_status: 'в обработке',
          paymentStatus: 'не оплачено',
          arrivalNumber: 'ARR-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: clientArrivals })

      const result = await store.dispatch(fetchArrivalsByClientId(clientId))

      expect(result.type).toBe('arrivals/fetchArrivalsByClientId/fulfilled')
      expect(result.payload).toEqual(clientArrivals)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/arrivals?client=${clientId}`)
    })
  })

  describe('fetchPopulatedArrivals', () => {
    it('should successfully fetch populated arrivals', async () => {
      const populatedArrivals: ArrivalWithClient[] = [
        {
          _id: 'arrival-1',
          client: {
            _id: 'client-1',
            name: 'Тестовый клиент',
            phone_number: '+7 (999) 123-45-67',
            email: 'test@example.com',
            inn: '1234567890'
          },
          products: [],
          arrival_date: '2023-01-01T00:00:00Z',
          sent_amount: '75',
          stock: {
            _id: 'stock-1',
            name: 'Склад 1',
            address: 'Адрес склада'
          },
          arrival_status: 'в обработке',
          paymentStatus: 'не оплачено',
          arrivalNumber: 'ARR-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: populatedArrivals })

      const result = await store.dispatch(fetchPopulatedArrivals())

      expect(result.type).toBe('arrivals/fetchArrivalsWithPopulate/fulfilled')
      expect(result.payload).toEqual(populatedArrivals)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/arrivals?populate=1')
    })
  })

  describe('addArrival', () => {
    it('should successfully add arrival', async () => {
      const arrivalData: ArrivalMutation = {
        client: 'client-123',
        products: [
          {
            product: 'product-1',
            description: 'Новый товар',
            amount: 5
          }
        ],
        arrival_date: '2023-01-01T00:00:00Z',
        sent_amount: '50',
        stock: 'stock-1',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      const responseData: Arrival = {
        _id: 'new-arrival-id',
        ...arrivalData,
        arrivalNumber: 'ARR-NEW-001',
        logs: [],
        documents: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(addArrival(arrivalData))

      expect(result.type).toBe('arrivals/addArrival/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/arrivals', arrivalData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })

    it('should handle validation error (400 status)', async () => {
      const arrivalData: ArrivalMutation = {
        client: '',
        products: [],
        arrival_date: '',
        sent_amount: '',
        stock: '',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          client: {
            name: 'client',
            messages: ['Клиент обязателен']
          },
          products: {
            name: 'products',
            messages: ['Товары обязательны']
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

      const result = await store.dispatch(addArrival(arrivalData))

      expect(result.type).toBe('arrivals/addArrival/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const arrivalData: ArrivalMutation = {
        client: 'client-123',
        products: [],
        arrival_date: '2023-01-01T00:00:00Z',
        sent_amount: '10',
        stock: 'stock-1',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addArrival(arrivalData))

      expect(result.type).toBe('arrivals/addArrival/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveArrival', () => {
    it('should successfully archive arrival', async () => {
      const arrivalId = 'arrival-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveArrival(arrivalId))

      expect(result.type).toBe('arrivals/archiveArrival/fulfilled')
      expect(result.payload).toEqual({ id: arrivalId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/arrivals/${arrivalId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const arrivalId = 'arrival-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать поставку в обработке' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveArrival(arrivalId))

      expect(result.type).toBe('arrivals/archiveArrival/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const arrivalId = 'arrival-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveArrival(arrivalId))

      expect(result.type).toBe('arrivals/archiveArrival/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveArrival', () => {
    it('should successfully unarchive arrival', async () => {
      const arrivalId = 'arrival-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveArrival(arrivalId))

      expect(result.type).toBe('arrivals/unarchiveArrival/fulfilled')
      expect(result.payload).toEqual({ id: arrivalId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/arrivals/${arrivalId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const arrivalId = 'arrival-123'
      const errorData: GlobalError = { message: 'Поставка не найдена' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveArrival(arrivalId))

      expect(result.type).toBe('arrivals/unarchiveArrival/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('cancelArrival', () => {
    it('should successfully cancel arrival', async () => {
      const arrivalId = 'arrival-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(cancelArrival(arrivalId))

      expect(result.type).toBe('arrivals/cancelArrival/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/arrivals/${arrivalId}/cancel`)
    })

    it('should handle cancel error (non-401)', async () => {
      const arrivalId = 'arrival-123'
      const errorData: GlobalError = { message: 'Нельзя отменить завершенную поставку' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(cancelArrival(arrivalId))

      expect(result.type).toBe('arrivals/cancelArrival/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('deleteArrival', () => {
    it('should successfully delete arrival', async () => {
      const arrivalId = 'arrival-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteArrival(arrivalId))

      expect(result.type).toBe('arrivals/deleteArrival/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/arrivals/${arrivalId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const arrivalId = 'arrival-123'
      const errorData: GlobalError = { message: 'Нельзя удалить поставку в обработке' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteArrival(arrivalId))

      expect(result.type).toBe('arrivals/deleteArrival/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('updateArrival', () => {
    it('should successfully update arrival', async () => {
      const arrivalId = 'arrival-123'
      const updateData: ArrivalMutation = {
        client: 'client-456',
        products: [
          {
            product: 'product-2',
            description: 'Обновленный товар',
            amount: 10
          }
        ],
        arrival_date: '2023-01-02T00:00:00Z',
        sent_amount: '100',
        stock: 'stock-2',
        arrival_status: 'завершен',
        paymentStatus: 'оплачено',
        defects: []
      }

      const responseData: Arrival = {
        _id: arrivalId,
        ...updateData,
        arrivalNumber: 'ARR-123',
        logs: [],
        documents: []
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(updateArrival({ arrivalId, data: updateData }))

      expect(result.type).toBe('arrivals/updateArrival/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/arrivals/${arrivalId}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })

    it('should handle update validation error (400 status)', async () => {
      const arrivalId = 'arrival-123'
      const updateData: ArrivalMutation = {
        client: '',
        products: [],
        arrival_date: '',
        sent_amount: '',
        stock: '',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          client: {
            name: 'client',
            messages: ['Клиент обязателен']
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

      const result = await store.dispatch(updateArrival({ arrivalId, data: updateData }))

      expect(result.type).toBe('arrivals/updateArrival/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const arrivalId = 'arrival-123'
      const updateData: ArrivalMutation = {
        client: 'client-123',
        products: [],
        arrival_date: '2023-01-01T00:00:00Z',
        sent_amount: '10',
        stock: 'stock-1',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateArrival({ arrivalId, data: updateData }))

      expect(result.type).toBe('arrivals/updateArrival/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty arrivals list', async () => {
      const emptyArrivals: Arrival[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyArrivals })

      const result = await store.dispatch(fetchArrivals())

      expect(result.type).toBe('arrivals/fetchArrivals/fulfilled')
      expect(result.payload).toEqual(emptyArrivals)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchArrivals())

      expect(result.type).toBe('arrivals/fetchArrivals/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent arrival operations', async () => {
      const arrivalData: ArrivalMutation = {
        client: 'client-123',
        products: [],
        arrival_date: '2023-01-01T00:00:00Z',
        sent_amount: '10',
        stock: 'stock-1',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'new-id' } })
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [addResult, fetchResult] = await Promise.all([
        store.dispatch(addArrival(arrivalData)),
        store.dispatch(fetchArrivals())
      ])

      expect(addResult.type).toBe('arrivals/addArrival/fulfilled')
      expect(fetchResult.type).toBe('arrivals/fetchArrivals/fulfilled')
    })

    it('should handle arrival with files', async () => {
      const arrivalData: ArrivalMutation & { files?: File[] } = {
        client: 'client-123',
        products: [],
        arrival_date: '2023-01-01T00:00:00Z',
        sent_amount: '10',
        stock: 'stock-1',
        arrival_status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: [],
        files: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'arrival-with-files' } })

      const result = await store.dispatch(addArrival(arrivalData))

      expect(result.type).toBe('arrivals/addArrival/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/arrivals', arrivalData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })
  })
}) 
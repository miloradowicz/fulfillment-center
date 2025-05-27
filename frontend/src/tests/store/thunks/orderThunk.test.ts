/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchOrders,
  fetchOrdersByClientId,
  fetchArchivedOrders,
  fetchOrdersWithClient,
  fetchOrderById,
  fetchOrderByIdWithPopulate,
  addOrder,
  archiveOrder,
  unarchiveOrder,
  cancelOrder,
  deleteOrder,
  updateOrder
} from '../../../store/thunks/orderThunk'
import {
  Order,
  OrderMutation,
  OrderWithClient,
  OrderWithProducts,
  OrderWithProductsAndClients,
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

describe('orderThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('fetchOrders', () => {
    it('should successfully fetch orders', async () => {
      const orders: Order[] = [
        {
          _id: 'order-1',
          client: 'client-1',
          products: [
            {
              product: 'product-1',
              description: 'Тестовый товар',
              amount: 10
            }
          ],
          stock: 'stock-1',
          sent_at: '2023-01-01T00:00:00Z',
          status: 'в обработке',
          paymentStatus: 'не оплачено',
          orderNumber: 'ORD-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: orders })

      const result = await store.dispatch(fetchOrders())

      expect(result.type).toBe('orders/fetchOrders/fulfilled')
      expect(result.payload).toEqual(orders)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/orders')
    })

    it('should handle fetch orders error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchOrders())

      expect(result.type).toBe('orders/fetchOrders/rejected')
    })
  })

  describe('fetchOrdersByClientId', () => {
    it('should successfully fetch orders by client id', async () => {
      const clientId = 'client-123'
      const clientOrders: Order[] = [
        {
          _id: 'order-1',
          client: clientId,
          products: [],
          stock: 'stock-1',
          sent_at: '2023-01-01T00:00:00Z',
          status: 'в обработке',
          paymentStatus: 'не оплачено',
          orderNumber: 'ORD-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: clientOrders })

      const result = await store.dispatch(fetchOrdersByClientId(clientId))

      expect(result.type).toBe('arrivals/fetchOrdersByClientId/fulfilled')
      expect(result.payload).toEqual(clientOrders)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/orders?client=${clientId}`)
    })
  })

  describe('fetchArchivedOrders', () => {
    it('should successfully fetch archived orders', async () => {
      const archivedOrders: OrderWithClient[] = [
        {
          _id: 'order-archived-1',
          client: {
            _id: 'client-1',
            name: 'Архивный клиент',
            phone_number: '+7 (999) 000-00-00',
            email: 'archived@example.com',
            inn: '0000000000'
          },
          products: [],
          stock: {
            _id: 'stock-1',
            name: 'Склад 1',
            address: 'Адрес склада'
          },
          sent_at: '2023-01-01T00:00:00Z',
          status: 'завершен',
          paymentStatus: 'оплачено',
          orderNumber: 'ORD-ARCH-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedOrders })

      const result = await store.dispatch(fetchArchivedOrders())

      expect(result.type).toBe('orders/fetchArchivedOrders/fulfilled')
      expect(result.payload).toEqual(archivedOrders)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/orders/archived/all?populate=true')
    })
  })

  describe('fetchOrdersWithClient', () => {
    it('should successfully fetch orders with client', async () => {
      const ordersWithClient: OrderWithClient[] = [
        {
          _id: 'order-1',
          client: {
            _id: 'client-1',
            name: 'Тестовый клиент',
            phone_number: '+7 (999) 123-45-67',
            email: 'test@example.com',
            inn: '1234567890'
          },
          products: [],
          stock: {
            _id: 'stock-1',
            name: 'Склад 1',
            address: 'Адрес склада'
          },
          sent_at: '2023-01-01T00:00:00Z',
          status: 'в обработке',
          paymentStatus: 'не оплачено',
          orderNumber: 'ORD-001',
          logs: [],
          defects: [],
          documents: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: ordersWithClient })

      const result = await store.dispatch(fetchOrdersWithClient())

      expect(result.type).toBe('orders/fetchOrdersWithClient/fulfilled')
      expect(result.payload).toEqual(ordersWithClient)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/orders?populate=1')
    })
  })

  describe('fetchOrderById', () => {
    it('should successfully fetch order by id', async () => {
      const orderId = 'order-123'
      const order: OrderWithProducts = {
        _id: orderId,
        client: 'client-1',
        products: [
          {
            _id: 'product-item-1',
            product: {
              _id: 'product-1',
              client: 'client-1',
              title: 'Тестовый товар',
              barcode: '123456789',
              article: 'ART-001',
              dynamic_fields: [],
              logs: []
            },
            description: 'Описание товара',
            amount: 5
          }
        ],
        stock: 'stock-1',
        sent_at: '2023-01-01T00:00:00Z',
        status: 'в обработке',
        paymentStatus: 'не оплачено',
        orderNumber: 'ORD-123',
        logs: [],
        defects: [],
        documents: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: order })

      const result = await store.dispatch(fetchOrderById(orderId))

      expect(result.type).toBe('orders/fetchOrderById/fulfilled')
      expect(result.payload).toEqual(order)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/orders/${orderId}`)
    })
  })

  describe('fetchOrderByIdWithPopulate', () => {
    it('should successfully fetch order by id with populate', async () => {
      const orderId = 'order-123'
      const orderWithPopulate: OrderWithProductsAndClients = {
        _id: orderId,
        client: {
          _id: 'client-1',
          name: 'Клиент с populate',
          phone_number: '+7 (999) 111-22-33',
          email: 'client@example.com',
          inn: '1111111111'
        },
        products: [
          {
            _id: 'product-item-1',
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
        stock: {
          _id: 'stock-1',
          name: 'Склад с populate',
          address: 'Адрес склада с populate'
        },
        services: [],
        sent_at: '2023-01-01T00:00:00Z',
        status: 'в обработке',
        paymentStatus: 'не оплачено',
        orderNumber: 'ORD-123',
        logs: [],
        documents: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: orderWithPopulate })

      const result = await store.dispatch(fetchOrderByIdWithPopulate(orderId))

      expect(result.type).toBe('orders/fetchOrderByIdWithPopulate/fulfilled')
      expect(result.payload).toEqual(orderWithPopulate)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/orders/${orderId}?populate=true`)
    })
  })

  describe('addOrder', () => {
    it('should successfully add order', async () => {
      const orderData: OrderMutation = {
        client: 'client-123',
        products: [
          {
            product: 'product-1',
            description: 'Новый товар',
            amount: 5
          }
        ],
        stock: 'stock-1',
        sent_at: '2023-01-01T00:00:00Z',
        status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      const responseData: Order = {
        _id: 'new-order-id',
        ...orderData,
        orderNumber: 'ORD-NEW-001',
        logs: [],
        documents: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(addOrder(orderData))

      expect(result.type).toBe('orders/addOrder/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/orders', orderData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })

    it('should handle validation error (400 status)', async () => {
      const orderData: OrderMutation = {
        client: '',
        products: [],
        stock: '',
        sent_at: '',
        status: 'в обработке',
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

      const result = await store.dispatch(addOrder(orderData))

      expect(result.type).toBe('orders/addOrder/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const orderData: OrderMutation = {
        client: 'client-123',
        products: [],
        stock: 'stock-1',
        sent_at: '2023-01-01T00:00:00Z',
        status: 'в обработке',
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

      const result = await store.dispatch(addOrder(orderData))

      expect(result.type).toBe('orders/addOrder/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveOrder', () => {
    it('should successfully archive order', async () => {
      const orderId = 'order-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveOrder(orderId))

      expect(result.type).toBe('orders/archiveOrder/fulfilled')
      expect(result.payload).toEqual({ id: orderId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/orders/${orderId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const orderId = 'order-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать заказ в обработке' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveOrder(orderId))

      expect(result.type).toBe('orders/archiveOrder/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const orderId = 'order-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveOrder(orderId))

      expect(result.type).toBe('orders/archiveOrder/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveOrder', () => {
    it('should successfully unarchive order', async () => {
      const orderId = 'order-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveOrder(orderId))

      expect(result.type).toBe('orders/unarchiveOrder/fulfilled')
      expect(result.payload).toEqual({ id: orderId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/orders/${orderId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const orderId = 'order-123'
      const errorData: GlobalError = { message: 'Заказ не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveOrder(orderId))

      expect(result.type).toBe('orders/unarchiveOrder/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('cancelOrder', () => {
    it('should successfully cancel order', async () => {
      const orderId = 'order-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(cancelOrder(orderId))

      expect(result.type).toBe('orders/cancelOrder/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/orders/${orderId}/cancel`)
    })

    it('should handle cancel error (non-401)', async () => {
      const orderId = 'order-123'
      const errorData: GlobalError = { message: 'Нельзя отменить завершенный заказ' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(cancelOrder(orderId))

      expect(result.type).toBe('orders/cancelOrder/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('deleteOrder', () => {
    it('should successfully delete order', async () => {
      const orderId = 'order-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteOrder(orderId))

      expect(result.type).toBe('orders/deleteOrder/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/orders/${orderId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const orderId = 'order-123'
      const errorData: GlobalError = { message: 'Нельзя удалить заказ в обработке' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteOrder(orderId))

      expect(result.type).toBe('orders/deleteOrder/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('updateOrder', () => {
    it('should successfully update order', async () => {
      const orderId = 'order-123'
      const updateData: OrderMutation = {
        client: 'client-456',
        products: [
          {
            product: 'product-2',
            description: 'Обновленный товар',
            amount: 10
          }
        ],
        stock: 'stock-2',
        sent_at: '2023-01-02T00:00:00Z',
        status: 'отправлен',
        paymentStatus: 'оплачено',
        defects: []
      }

      const responseData: Order = {
        _id: orderId,
        ...updateData,
        orderNumber: 'ORD-123',
        logs: [],
        documents: []
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(updateOrder({ orderId, data: updateData }))

      expect(result.type).toBe('orders/updateOrder/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/orders/${orderId}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })

    it('should handle update validation error (400 status)', async () => {
      const orderId = 'order-123'
      const updateData: OrderMutation = {
        client: '',
        products: [],
        stock: '',
        sent_at: '',
        status: 'в обработке',
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

      const result = await store.dispatch(updateOrder({ orderId, data: updateData }))

      expect(result.type).toBe('orders/updateOrder/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const orderId = 'order-123'
      const updateData: OrderMutation = {
        client: 'client-123',
        products: [],
        stock: 'stock-1',
        sent_at: '2023-01-01T00:00:00Z',
        status: 'в обработке',
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

      const result = await store.dispatch(updateOrder({ orderId, data: updateData }))

      expect(result.type).toBe('orders/updateOrder/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty orders list', async () => {
      const emptyOrders: Order[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyOrders })

      const result = await store.dispatch(fetchOrders())

      expect(result.type).toBe('orders/fetchOrders/fulfilled')
      expect(result.payload).toEqual(emptyOrders)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchOrders())

      expect(result.type).toBe('orders/fetchOrders/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent order operations', async () => {
      const orderData: OrderMutation = {
        client: 'client-123',
        products: [],
        stock: 'stock-1',
        sent_at: '2023-01-01T00:00:00Z',
        status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'new-id' } })
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [addResult, fetchResult] = await Promise.all([
        store.dispatch(addOrder(orderData)),
        store.dispatch(fetchOrders())
      ])

      expect(addResult.type).toBe('orders/addOrder/fulfilled')
      expect(fetchResult.type).toBe('orders/fetchOrders/fulfilled')
    })

    it('should handle order with files', async () => {
      const orderData: OrderMutation & { files?: File[] } = {
        client: 'client-123',
        products: [],
        stock: 'stock-1',
        sent_at: '2023-01-01T00:00:00Z',
        status: 'в обработке',
        paymentStatus: 'не оплачено',
        defects: [],
        files: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'order-with-files' } })

      const result = await store.dispatch(addOrder(orderData))

      expect(result.type).toBe('orders/addOrder/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/orders', orderData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })
  })
}) 
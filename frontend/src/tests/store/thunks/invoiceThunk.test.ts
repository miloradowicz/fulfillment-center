/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchInvoices,
  fetchArchivedInvoices,
  fetchInvoiceById,
  createInvoices,
  archiveInvoice,
  unarchiveInvoice,
  deleteInvoice,
  updateInvoice
} from '../../../store/thunks/invoiceThunk'
import {
  Invoice,
  InvoiceMutation,
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

describe('invoiceThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('fetchInvoices', () => {
    it('should successfully fetch invoices', async () => {
      const invoices: Invoice[] = [
        {
          _id: 'invoice-1',
          isArchived: false,
          invoiceNumber: 'INV-001',
          client: {
            _id: 'client-1',
            name: 'ООО "Тест"',
            phone_number: '+7 (999) 123-45-67',
            email: 'test@example.com',
            inn: '1234567890'
          },
          services: [
            {
              service: {
                _id: 'service-1',
                name: 'Тестовая услуга',
                serviceCategory: { _id: 'cat-1', name: 'Категория' },
                price: 1000,
                description: 'Описание услуги',
                type: 'внутренняя',
                logs: []
              },
              service_amount: 2,
              service_price: 1000,
              service_type: 'внутренняя',
              _id: 'service-item-1'
            }
          ],
          totalAmount: 2000,
          paid_amount: 1000,
          discount: 0,
          status: 'частично оплачено',
          logs: [],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T12:00:00Z'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: invoices })

      const result = await store.dispatch(fetchInvoices())

      expect(result.type).toBe('invoices/fetchInvoices/fulfilled')
      expect(result.payload).toEqual(invoices)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/invoices')
    })

    it('should handle fetch invoices error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchInvoices())

      expect(result.type).toBe('invoices/fetchInvoices/rejected')
    })
  })

  describe('fetchArchivedInvoices', () => {
    it('should successfully fetch archived invoices', async () => {
      const archivedInvoices: Invoice[] = [
        {
          _id: 'invoice-archived-1',
          isArchived: true,
          invoiceNumber: 'INV-ARCH-001',
          client: {
            _id: 'client-1',
            name: 'Архивный клиент',
            phone_number: '+7 (999) 000-00-00',
            email: 'archived@example.com',
            inn: '0000000000'
          },
          services: [],
          totalAmount: 0,
          paid_amount: 0,
          status: 'в ожидании',
          logs: [],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T12:00:00Z'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedInvoices })

      const result = await store.dispatch(fetchArchivedInvoices())

      expect(result.type).toBe('invoices/fetchArchivedInvoices/fulfilled')
      expect(result.payload).toEqual(archivedInvoices)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/invoices/archived')
    })
  })

  describe('fetchInvoiceById', () => {
    it('should successfully fetch invoice by id', async () => {
      const invoiceId = 'invoice-123'
      const invoice: Invoice = {
        _id: invoiceId,
        isArchived: false,
        invoiceNumber: 'INV-123',
        client: {
          _id: 'client-1',
          name: 'Клиент тест',
          phone_number: '+7 (999) 111-22-33',
          email: 'client@example.com',
          inn: '1111111111'
        },
        services: [],
        totalAmount: 5000,
        paid_amount: 5000,
        status: 'оплачено',
        logs: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T12:00:00Z'
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: invoice })

      const result = await store.dispatch(fetchInvoiceById(invoiceId))

      expect(result.type).toBe('invoices/fetchInvoiceById/fulfilled')
      expect(result.payload).toEqual(invoice)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/invoices/${invoiceId}`)
    })
  })

  describe('createInvoices', () => {
    it('should successfully create invoice', async () => {
      const invoiceData: InvoiceMutation = {
        client: 'client-123',
        paid_amount: 1000,
        discount: 100,
        services: [
          {
            service: 'service-1',
            service_amount: 2,
            service_price: 500,
            service_type: 'внутренняя'
          }
        ]
      }

      const responseData = { _id: 'new-invoice-id' }
      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createInvoices(invoiceData))

      expect(result.type).toBe('invoices/createInvoices/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/invoices', invoiceData)
    })

    it('should handle validation error (400 status)', async () => {
      const invoiceData: InvoiceMutation = {
        client: '',
        paid_amount: -100,
        services: []
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          client: {
            name: 'client',
            messages: ['Клиент обязателен']
          },
          paid_amount: {
            name: 'paid_amount',
            messages: ['Сумма должна быть положительной']
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

      const result = await store.dispatch(createInvoices(invoiceData))

      expect(result.type).toBe('invoices/createInvoices/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const invoiceData: InvoiceMutation = {
        client: 'client-123',
        paid_amount: 1000,
        services: []
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(createInvoices(invoiceData))

      expect(result.type).toBe('invoices/createInvoices/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveInvoice', () => {
    it('should successfully archive invoice', async () => {
      const invoiceId = 'invoice-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveInvoice(invoiceId))

      expect(result.type).toBe('invoices/archiveInvoice/fulfilled')
      expect(result.payload).toEqual({ id: invoiceId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/invoices/${invoiceId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const invoiceId = 'invoice-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать оплаченный счет' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveInvoice(invoiceId))

      expect(result.type).toBe('invoices/archiveInvoice/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const invoiceId = 'invoice-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveInvoice(invoiceId))

      expect(result.type).toBe('invoices/archiveInvoice/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveInvoice', () => {
    it('should successfully unarchive invoice', async () => {
      const invoiceId = 'invoice-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveInvoice(invoiceId))

      expect(result.type).toBe('invoice/ unarchiveInvoice/fulfilled')
      expect(result.payload).toEqual({ id: invoiceId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/invoices/${invoiceId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const invoiceId = 'invoice-123'
      const errorData: GlobalError = { message: 'Счет не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveInvoice(invoiceId))

      expect(result.type).toBe('invoice/ unarchiveInvoice/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('deleteInvoice', () => {
    it('should successfully delete invoice', async () => {
      const invoiceId = 'invoice-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteInvoice(invoiceId))

      expect(result.type).toBe('invoices/deleteInvoice/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/invoices/${invoiceId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const invoiceId = 'invoice-123'
      const errorData: GlobalError = { message: 'Нельзя удалить оплаченный счет' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteInvoice(invoiceId))

      expect(result.type).toBe('invoices/deleteInvoice/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('updateInvoice', () => {
    it('should successfully update invoice', async () => {
      const invoiceId = 'invoice-123'
      const updateData: InvoiceMutation = {
        client: 'client-456',
        paid_amount: 2000,
        discount: 200,
        services: [
          {
            service: 'service-2',
            service_amount: 1,
            service_price: 2000,
            service_type: 'внешняя'
          }
        ]
      }

      const responseData = { success: true }
      mockedAxiosAPI.put.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(updateInvoice({ id: invoiceId, data: updateData }))

      expect(result.type).toBe('invoices/updateInvoice/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/invoices/${invoiceId}`, updateData)
    })

    it('should handle update validation error (400 status)', async () => {
      const invoiceId = 'invoice-123'
      const updateData: InvoiceMutation = {
        client: '',
        paid_amount: -500,
        services: []
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

      const result = await store.dispatch(updateInvoice({ id: invoiceId, data: updateData }))

      expect(result.type).toBe('invoices/updateInvoice/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const invoiceId = 'invoice-123'
      const updateData: InvoiceMutation = {
        client: 'client-123',
        paid_amount: 1000,
        services: []
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateInvoice({ id: invoiceId, data: updateData }))

      expect(result.type).toBe('invoices/updateInvoice/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty invoices list', async () => {
      const emptyInvoices: Invoice[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyInvoices })

      const result = await store.dispatch(fetchInvoices())

      expect(result.type).toBe('invoices/fetchInvoices/fulfilled')
      expect(result.payload).toEqual(emptyInvoices)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchInvoices())

      expect(result.type).toBe('invoices/fetchInvoices/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent invoice operations', async () => {
      const invoiceData: InvoiceMutation = {
        client: 'client-123',
        paid_amount: 1000,
        services: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'new-id' } })
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [createResult, fetchResult] = await Promise.all([
        store.dispatch(createInvoices(invoiceData)),
        store.dispatch(fetchInvoices())
      ])

      expect(createResult.type).toBe('invoices/createInvoices/fulfilled')
      expect(fetchResult.type).toBe('invoices/fetchInvoices/fulfilled')
    })

    it('should handle invoice with complex services', async () => {
      const complexInvoiceData: InvoiceMutation = {
        client: 'client-123',
        paid_amount: 5000,
        discount: 500,
        associatedOrder: 'order-123',
        associatedArrival: 'arrival-123',
        services: [
          {
            service: 'service-1',
            service_amount: 2,
            service_price: 1000,
            service_type: 'внутренняя'
          },
          {
            service: 'service-2',
            service_amount: 1,
            service_price: 3000,
            service_type: 'внешняя'
          }
        ]
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'complex-invoice' } })

      const result = await store.dispatch(createInvoices(complexInvoiceData))

      expect(result.type).toBe('invoices/createInvoices/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/invoices', complexInvoiceData)
    })
  })
}) 
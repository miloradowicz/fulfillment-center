/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchAllCounterparties,
  fetchAllArchivedCounterparties,
  fetchCounterpartyById,
  createCounterparty,
  updateCounterparty,
  archiveCounterparty,
  unarchiveCounterparty,
  deleteCounterparty
} from '../../../store/thunks/counterpartyThunk'
import {
  Counterparty,
  CounterpartyMutation,
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

describe('counterpartyThunk', () => {
  let store: any

  beforeEach(() => {
          store = configureStore({
        reducer: {
          test: (state = {}) => state
        }
      })
    jest.clearAllMocks()
  })

  describe('fetchAllCounterparties', () => {
    it('should successfully fetch all counterparties', async () => {
      const counterparties: Counterparty[] = [
        {
          _id: 'counterparty-1',
          name: 'ООО "Транспорт"',
          address: 'ул. Транспортная, 1',
          phone_number: '+7 (999) 123-45-67',
          isArchived: false
        },
        {
          _id: 'counterparty-2',
          name: 'ИП Иванов',
          address: 'ул. Ивановская, 2',
          phone_number: '+7 (999) 987-65-43',
          isArchived: false
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: counterparties })

      const result = await store.dispatch(fetchAllCounterparties())

      expect(result.type).toBe('counterparties/fetchAll/fulfilled')
      expect(result.payload).toEqual(counterparties)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/counterparties')
    })

    it('should handle fetch counterparties error (non-401)', async () => {
      const errorData: GlobalError = { message: 'Ошибка загрузки контрагентов' }

      const axiosError = {
        response: {
          status: 500,
          data: errorData
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchAllCounterparties())

      expect(result.type).toBe('counterparties/fetchAll/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchAllCounterparties())

      expect(result.type).toBe('counterparties/fetchAll/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('fetchAllArchivedCounterparties', () => {
    it('should successfully fetch archived counterparties', async () => {
      const archivedCounterparties: Counterparty[] = [
        {
          _id: 'counterparty-archived-1',
          name: 'Архивный контрагент',
          address: 'ул. Архивная, 1',
          phone_number: '+7 (999) 000-00-00',
          isArchived: true
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedCounterparties })

      const result = await store.dispatch(fetchAllArchivedCounterparties())

      expect(result.type).toBe('counterparty/fetchArchivedCounterparties/fulfilled')
      expect(result.payload).toEqual(archivedCounterparties)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/counterparties/archived/all')
    })

    it('should handle fetch archived counterparties error (non-401)', async () => {
      const errorData: GlobalError = { message: 'Ошибка загрузки архивных контрагентов' }

      const axiosError = {
        response: {
          status: 500,
          data: errorData
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchAllArchivedCounterparties())

      expect(result.type).toBe('counterparty/fetchArchivedCounterparties/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('fetchCounterpartyById', () => {
    it('should successfully fetch counterparty by id', async () => {
      const counterpartyId = 'counterparty-123'
      const counterparty: Counterparty = {
        _id: counterpartyId,
        name: 'Конкретный контрагент',
        address: 'ул. Конкретная, 123',
        phone_number: '+7 (999) 111-22-33',
        isArchived: false
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: counterparty })

      const result = await store.dispatch(fetchCounterpartyById(counterpartyId))

      expect(result.type).toBe('counterparties/fetchById/fulfilled')
      expect(result.payload).toEqual(counterparty)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/counterparties/${counterpartyId}`)
    })

    it('should handle fetch counterparty by id error (non-401)', async () => {
      const counterpartyId = 'counterparty-123'
      const errorData: GlobalError = { message: 'Контрагент не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchCounterpartyById(counterpartyId))

      expect(result.type).toBe('counterparties/fetchById/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('createCounterparty', () => {
    it('should successfully create counterparty', async () => {
      const counterpartyData: CounterpartyMutation = {
        name: 'Новый контрагент',
        address: 'ул. Новая, 1',
        phone_number: '+7 (999) 555-55-55',
        isArchived: false
      }

      const responseData: Counterparty = {
        _id: 'new-counterparty-id',
        ...counterpartyData
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createCounterparty(counterpartyData))

      expect(result.type).toBe('counterparties/create/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/counterparties', counterpartyData)
    })

    it('should handle validation error (400 status)', async () => {
      const counterpartyData: CounterpartyMutation = {
        name: '',
        address: '',
        phone_number: '',
        isArchived: false
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название контрагента обязательно']
          },
          phone_number: {
            name: 'phone_number',
            messages: ['Номер телефона обязателен']
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

      const result = await store.dispatch(createCounterparty(counterpartyData))

      expect(result.type).toBe('counterparties/create/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const counterpartyData: CounterpartyMutation = {
        name: 'Тестовый контрагент',
        address: 'ул. Тестовая, 1',
        phone_number: '+7 (999) 123-45-67',
        isArchived: false
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(createCounterparty(counterpartyData))

      expect(result.type).toBe('counterparties/create/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('updateCounterparty', () => {
    it('should successfully update counterparty', async () => {
      const counterpartyId = 'counterparty-123'
      const updateData: CounterpartyMutation = {
        name: 'Обновленный контрагент',
        address: 'ул. Обновленная, 1',
        phone_number: '+7 (999) 777-77-77',
        isArchived: false
      }

      const responseData: Counterparty = {
        _id: counterpartyId,
        ...updateData
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(updateCounterparty({ id: counterpartyId, data: updateData }))

      expect(result.type).toBe('counterparties/update/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/counterparties/${counterpartyId}`, updateData)
    })

    it('should handle update validation error (400 status)', async () => {
      const counterpartyId = 'counterparty-123'
      const updateData: CounterpartyMutation = {
        name: '',
        address: '',
        phone_number: '',
        isArchived: false
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название контрагента обязательно']
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

      const result = await store.dispatch(updateCounterparty({ id: counterpartyId, data: updateData }))

      expect(result.type).toBe('counterparties/update/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const counterpartyId = 'counterparty-123'
      const updateData: CounterpartyMutation = {
        name: 'Тестовый контрагент',
        address: 'ул. Тестовая, 1',
        phone_number: '+7 (999) 123-45-67',
        isArchived: false
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateCounterparty({ id: counterpartyId, data: updateData }))

      expect(result.type).toBe('counterparties/update/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveCounterparty', () => {
    it('should successfully archive counterparty', async () => {
      const counterpartyId = 'counterparty-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/archive/fulfilled')
      expect(result.payload).toEqual({ id: counterpartyId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/counterparties/${counterpartyId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const counterpartyId = 'counterparty-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать контрагента с активными заказами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/archive/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const counterpartyId = 'counterparty-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/archive/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveCounterparty', () => {
    it('should successfully unarchive counterparty', async () => {
      const counterpartyId = 'counterparty-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/unarchiveCounterparty/fulfilled')
      expect(result.payload).toEqual({ id: counterpartyId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/counterparties/${counterpartyId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const counterpartyId = 'counterparty-123'
      const errorData: GlobalError = { message: 'Контрагент не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/unarchiveCounterparty/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const counterpartyId = 'counterparty-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/unarchiveCounterparty/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('deleteCounterparty', () => {
    it('should successfully delete counterparty', async () => {
      const counterpartyId = 'counterparty-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/delete/fulfilled')
      expect(result.payload).toEqual({ id: counterpartyId })
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/counterparties/${counterpartyId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const counterpartyId = 'counterparty-123'
      const errorData: GlobalError = { message: 'Нельзя удалить контрагента с активными заказами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/delete/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const counterpartyId = 'counterparty-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteCounterparty(counterpartyId))

      expect(result.type).toBe('counterparties/delete/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty counterparties list', async () => {
      const emptyCounterparties: Counterparty[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyCounterparties })

      const result = await store.dispatch(fetchAllCounterparties())

      expect(result.type).toBe('counterparties/fetchAll/fulfilled')
      expect(result.payload).toEqual(emptyCounterparties)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchAllCounterparties())

      expect(result.type).toBe('counterparties/fetchAll/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent counterparty operations', async () => {
      const counterpartyData: CounterpartyMutation = {
        name: 'Concurrent counterparty',
        address: 'ул. Concurrent, 1',
        phone_number: '+7 (999) 888-88-88',
        isArchived: false
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'new-id', ...counterpartyData } })
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [createResult, fetchResult] = await Promise.all([
        store.dispatch(createCounterparty(counterpartyData)),
        store.dispatch(fetchAllCounterparties())
      ])

      expect(createResult.type).toBe('counterparties/create/fulfilled')
      expect(fetchResult.type).toBe('counterparties/fetchAll/fulfilled')
    })

    it('should handle counterparty with optional fields', async () => {
      const counterpartyData: CounterpartyMutation = {
        name: 'Контрагент без адреса',
        isArchived: false
      }

      const responseData: Counterparty = {
        _id: 'minimal-counterparty-id',
        ...counterpartyData
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createCounterparty(counterpartyData))

      expect(result.type).toBe('counterparties/create/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/counterparties', counterpartyData)
    })

    it('should handle counterparty with very long name', async () => {
      const longName = 'Очень длинное название контрагента '.repeat(10)
      const counterpartyData: CounterpartyMutation = {
        name: longName,
        address: 'ул. Длинная, 1',
        phone_number: '+7 (999) 999-99-99',
        isArchived: false
      }

      const responseData: Counterparty = {
        _id: 'long-name-counterparty-id',
        ...counterpartyData
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createCounterparty(counterpartyData))

      expect(result.type).toBe('counterparties/create/fulfilled')
      expect(result.payload).toEqual(responseData)
    })

    it('should handle counterparty archive status toggle', async () => {
      const counterpartyId = 'counterparty-123'

      // Архивируем
      mockedAxiosAPI.patch.mockResolvedValueOnce({})
      const archiveResult = await store.dispatch(archiveCounterparty(counterpartyId))
      expect(archiveResult.type).toBe('counterparties/archive/fulfilled')

      // Разархивируем
      mockedAxiosAPI.patch.mockResolvedValueOnce({})
      const unarchiveResult = await store.dispatch(unarchiveCounterparty(counterpartyId))
      expect(unarchiveResult.type).toBe('counterparties/unarchiveCounterparty/fulfilled')
    })
  })
}) 
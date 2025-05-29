/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchClients,
  fetchClientById,
  fetchArchivedClients,
  addClient,
  archiveClient,
  unarchiveClient,
  deleteClient,
  updateClient
} from '../../../store/thunks/clientThunk'
import {
  Client,
  ClientMutation,
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

describe('clientThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('fetchClients', () => {
    it('should successfully fetch clients', async () => {
      const clients: Client[] = [
        {
          _id: 'client-1',
          name: 'ООО "Тест"',
          phone_number: '+7 (999) 123-45-67',
          email: 'test@example.com',
          inn: '1234567890'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: clients })

      const result = await store.dispatch(fetchClients())

      expect(result.type).toBe('clients/fetchClients/fulfilled')
      expect(result.payload).toEqual(clients)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/clients')
    })

    it('should handle fetch clients error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchClients())

      expect(result.type).toBe('clients/fetchClients/rejected')
    })
  })

  describe('fetchClientById', () => {
    it('should successfully fetch client by id', async () => {
      const clientId = 'client-123'
      const client: Client = {
        _id: clientId,
        name: 'ООО "Тест"',
        phone_number: '+7 (999) 111-22-33',
        email: 'test@example.com',
        inn: '1111111111'
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: client })

      const result = await store.dispatch(fetchClientById(clientId))

      expect(result.type).toBe('clients/fetchClient/fulfilled')
      expect(result.payload).toEqual(client)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/clients/${clientId}`)
    })

    it('should handle fetch client by id error', async () => {
      const clientId = 'non-existent-client'
      const error = new Error('Client not found')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchClientById(clientId))

      expect(result.type).toBe('clients/fetchClient/rejected')
    })
  })

  describe('fetchArchivedClients', () => {
    it('should successfully fetch archived clients', async () => {
      const archivedClients: Client[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedClients })

      const result = await store.dispatch(fetchArchivedClients())

      expect(result.type).toBe('clients/fetchArchivedClients/fulfilled')
      expect(result.payload).toEqual(archivedClients)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/clients/archived/all')
    })
  })

  describe('addClient', () => {
    it('should successfully add client', async () => {
      const clientData: ClientMutation = {
        name: 'Новый клиент',
        phone_number: '+7 (999) 555-55-55',
        email: 'new@example.com',
        inn: '5555555555'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})

      const result = await store.dispatch(addClient(clientData))

      expect(result.type).toBe('clients/addClient/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/clients', clientData)
    })

    it('should handle validation error (400 status)', async () => {
      const clientData: ClientMutation = {
        name: '',
        phone_number: 'invalid-phone',
        email: 'invalid-email',
        inn: '123'
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название обязательно']
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

      const result = await store.dispatch(addClient(clientData))

      expect(result.type).toBe('clients/addClient/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const clientData: ClientMutation = {
        name: 'Дублирующий клиент',
        phone_number: '+7 (999) 123-45-67',
        email: 'duplicate@example.com',
        inn: '1234567890'
      }

      const axiosError = {
        response: {
          status: 409,
          data: { error: 'Клиент с таким ИНН уже существует' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addClient(clientData))

      expect(result.type).toBe('clients/addClient/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should throw error for non-400 status without message', async () => {
      const clientData: ClientMutation = {
        name: 'Дублирующий клиент',
        phone_number: '+7 (999) 123-45-67',
        email: 'duplicate@example.com',
        inn: '1234567890'
      }

      const axiosError = {
        response: {
          status: 409,
          data: { error: 'Клиент с таким ИНН уже существует' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addClient(clientData))

      expect(result.type).toBe('clients/addClient/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should throw error for unexpected status', async () => {
      const clientData: ClientMutation = {
        name: 'Тест клиент',
        phone_number: '+7 (999) 123-45-67',
        email: 'test@example.com',
        inn: '1234567890'
      }

      const axiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addClient(clientData))

      expect(result.type).toBe('clients/addClient/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveClient', () => {
    it('should successfully archive client', async () => {
      const clientId = 'client-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveClient(clientId))

      expect(result.type).toBe('clients/archiveClient/fulfilled')
      expect(result.payload).toEqual({ id: clientId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/clients/${clientId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const clientId = 'client-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать клиента с активными заказами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveClient(clientId))

      expect(result.type).toBe('clients/archiveClient/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('unarchiveClient', () => {
    it('should successfully unarchive client', async () => {
      const clientId = 'client-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveClient(clientId))

      expect(result.type).toBe('clients/unarchiveClient/fulfilled')
      expect(result.payload).toEqual({ id: clientId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/clients/${clientId}/unarchive`)
    })

    it('should handle unarchive error', async () => {
      const clientId = 'client-123'
      const errorData: GlobalError = { message: 'Клиент не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveClient(clientId))

      expect(result.type).toBe('clients/unarchiveClient/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('deleteClient', () => {
    it('should successfully delete client', async () => {
      const clientId = 'client-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteClient(clientId))

      expect(result.type).toBe('clients/deleteClient/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/clients/${clientId}`)
    })
  })

  describe('updateClient', () => {
    it('should successfully update client', async () => {
      const clientId = 'client-123'
      const updateData: ClientMutation = {
        name: 'Обновленное название',
        phone_number: '+7 (999) 777-77-77',
        email: 'updated@example.com',
        inn: '7777777777'
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({})

      const result = await store.dispatch(updateClient({ clientId, data: updateData }))

      expect(result.type).toBe('clients/updateClient/fulfilled')
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/clients/${clientId}`, updateData)
    })

    it('should handle update validation error', async () => {
      const clientId = 'client-123'
      const updateData: ClientMutation = {
        name: '',
        phone_number: 'invalid',
        email: 'invalid-email',
        inn: '123'
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название обязательно']
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

      const result = await store.dispatch(updateClient({ clientId, data: updateData }))

      expect(result.type).toBe('clients/updateClient/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for 401 status', async () => {
      const clientId = 'client-123'
      const updateData: ClientMutation = {
        name: 'Тест',
        phone_number: '+7 (999) 123-45-67',
        email: 'test@example.com',
        inn: '1234567890'
      }

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateClient({ clientId, data: updateData }))

      expect(result.type).toBe('clients/updateClient/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchClients())

      expect(result.type).toBe('clients/fetchClients/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle empty client list', async () => {
      const emptyClients: Client[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyClients })

      const result = await store.dispatch(fetchClients())

      expect(result.type).toBe('clients/fetchClients/fulfilled')
      expect(result.payload).toEqual(emptyClients)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle client with minimal data', async () => {
      const minimalClient: ClientMutation = {
        name: 'Минимальный клиент',
        phone_number: '+7 (999) 000-00-00',
        email: 'minimal@example.com',
        inn: '0000000000'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})

      const result = await store.dispatch(addClient(minimalClient))

      expect(result.type).toBe('clients/addClient/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/clients', minimalClient)
    })

    it('should handle concurrent client operations', async () => {
      const clientData: ClientMutation = {
        name: 'Concurrent Client',
        phone_number: '+7 (999) 111-11-11',
        email: 'concurrent@example.com',
        inn: '1111111111'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [addResult, fetchResult] = await Promise.all([
        store.dispatch(addClient(clientData)),
        store.dispatch(fetchClients())
      ])

      expect(addResult.type).toBe('clients/addClient/fulfilled')
      expect(fetchResult.type).toBe('clients/fetchClients/fulfilled')
    })
  })
}) 
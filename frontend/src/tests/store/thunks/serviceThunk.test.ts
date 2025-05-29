/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchServices,
  fetchArchivedServices,
  fetchServiceById,
  createService,
  updateService,
  archiveService,
  unarchiveService,
  deleteService
} from '../../../store/thunks/serviceThunk'
import {
  PopulatedService,
  ServiceMutation,
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



describe('serviceThunk', () => {
  let store: any

  beforeEach(() => {
          store = configureStore({
        reducer: {
          test: (state = {}) => state
        }
      })
    jest.clearAllMocks()
  })

  describe('fetchServices', () => {
    it('should successfully fetch services', async () => {
      const services: PopulatedService[] = [
        {
          _id: 'service-1',
          name: 'Хранение товаров',
          serviceCategory: {
            _id: 'category-1',
            name: 'Складские услуги'
          },
          price: 1000,
          description: 'Услуга хранения товаров на складе',
          type: 'внутренняя',
          logs: []
        },
        {
          _id: 'service-2',
          name: 'Доставка',
          serviceCategory: {
            _id: 'category-2',
            name: 'Транспортные услуги'
          },
          price: 500,
          description: 'Услуга доставки товаров',
          type: 'внешняя',
          logs: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: services })

      const result = await store.dispatch(fetchServices())

      expect(result.type).toBe('services/fetchAll/fulfilled')
      expect(result.payload).toEqual(services)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/services')
    })

    it('should handle fetch services error (non-401)', async () => {
      const errorData: GlobalError = { message: 'Ошибка загрузки услуг' }

      const axiosError = {
        response: {
          status: 500,
          data: errorData
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchServices())

      expect(result.type).toBe('services/fetchAll/rejected')
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

      const result = await store.dispatch(fetchServices())

      expect(result.type).toBe('services/fetchAll/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('fetchArchivedServices', () => {
    it('should successfully fetch archived services', async () => {
      const archivedServices: PopulatedService[] = [
        {
          _id: 'service-archived-1',
          name: 'Архивная услуга',
          serviceCategory: {
            _id: 'category-1',
            name: 'Архивная категория'
          },
          price: 0,
          description: 'Архивная услуга',
          type: 'внутренняя',
          logs: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedServices })

      const result = await store.dispatch(fetchArchivedServices())

      expect(result.type).toBe('services/fetchArchivedServices/fulfilled')
      expect(result.payload).toEqual(archivedServices)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/services/archived/all')
    })

    it('should handle fetch archived services error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchArchivedServices())

      expect(result.type).toBe('services/fetchArchivedServices/rejected')
    })
  })

  describe('fetchServiceById', () => {
    it('should successfully fetch service by id', async () => {
      const serviceId = 'service-123'
      const service: PopulatedService = {
        _id: serviceId,
        name: 'Конкретная услуга',
        serviceCategory: {
          _id: 'category-1',
          name: 'Тестовая категория'
        },
        price: 1500,
        description: 'Описание конкретной услуги',
        type: 'внешняя',
        logs: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: service })

      const result = await store.dispatch(fetchServiceById(serviceId))

      expect(result.type).toBe('services/fetchById/fulfilled')
      expect(result.payload).toEqual(service)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/services/${serviceId}`)
    })

    it('should handle fetch service by id error (non-401)', async () => {
      const serviceId = 'service-123'
      const errorData: GlobalError = { message: 'Услуга не найдена' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchServiceById(serviceId))

      expect(result.type).toBe('services/fetchById/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('createService', () => {
    it('should successfully create service', async () => {
      const serviceData: ServiceMutation = {
        name: 'Новая услуга',
        serviceCategory: 'category-123',
        price: 2000,
        description: 'Описание новой услуги',
        type: 'внутренняя'
      }

      const responseData: PopulatedService = {
        _id: 'new-service-id',
        name: serviceData.name,
        serviceCategory: {
          _id: 'category-123',
          name: 'Тестовая категория'
        },
        price: serviceData.price,
        description: serviceData.description,
        type: serviceData.type,
        logs: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createService(serviceData))

      expect(result.type).toBe('services/create/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/services', serviceData)
    })

    it('should handle validation error (400 status)', async () => {
      const serviceData: ServiceMutation = {
        name: '',
        serviceCategory: '',
        price: -100,
        description: '',
        type: 'внутренняя'
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название услуги обязательно']
          },
          serviceCategory: {
            name: 'serviceCategory',
            messages: ['Категория услуги обязательна']
          },
          price: {
            name: 'price',
            messages: ['Цена должна быть положительной']
          }
        }
      }

      const axiosError = {
        response: {
          status: 400,
          data: validationError
        },
        status: 400
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(createService(serviceData))

      expect(result.type).toBe('services/create/rejected')
      expect(result.payload).toEqual(validationError)
    })



    it('should throw error for other statuses', async () => {
      const serviceData: ServiceMutation = {
        name: 'Тестовая услуга',
        serviceCategory: 'category-123',
        price: 1000,
        description: 'Описание',
        type: 'внутренняя'
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        },
        status: 500
      }



      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(createService(serviceData))

      expect(result.type).toBe('services/create/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('updateService', () => {
    it('should successfully update service', async () => {
      const serviceId = 'service-123'
      const updateData: ServiceMutation = {
        name: 'Обновленная услуга',
        serviceCategory: 'category-456',
        price: 2500,
        description: 'Обновленное описание услуги',
        type: 'внешняя'
      }

      const responseData: PopulatedService = {
        _id: serviceId,
        name: updateData.name,
        serviceCategory: {
          _id: 'category-456',
          name: 'Обновленная категория'
        },
        price: updateData.price,
        description: updateData.description,
        type: updateData.type,
        logs: []
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(updateService({ id: serviceId, data: updateData }))

      expect(result.type).toBe('services/update/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/services/${serviceId}`, updateData)
    })

    it('should handle update validation error (400 status)', async () => {
      const serviceId = 'service-123'
      const updateData: ServiceMutation = {
        name: '',
        serviceCategory: '',
        price: -500,
        description: '',
        type: 'внутренняя'
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название услуги обязательно']
          }
        }
      }

      const axiosError = {
        response: {
          status: 400,
          data: validationError
        },
        status: 400
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateService({ id: serviceId, data: updateData }))

      expect(result.type).toBe('services/update/rejected')
      expect(result.payload).toEqual(validationError)
    })


  })

  describe('archiveService', () => {
    it('should successfully archive service', async () => {
      const serviceId = 'service-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveService(serviceId))

      expect(result.type).toBe('services/archive/fulfilled')
      expect(result.payload).toEqual({ id: serviceId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/services/${serviceId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const serviceId = 'service-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать услугу с активными заказами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveService(serviceId))

      expect(result.type).toBe('services/archive/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const serviceId = 'service-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveService(serviceId))

      expect(result.type).toBe('services/archive/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveService', () => {
    it('should successfully unarchive service', async () => {
      const serviceId = 'service-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveService(serviceId))

      expect(result.type).toBe('services/unarchiveService/fulfilled')
      expect(result.payload).toEqual({ id: serviceId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/services/${serviceId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const serviceId = 'service-123'
      const errorData: GlobalError = { message: 'Услуга не найдена' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveService(serviceId))

      expect(result.type).toBe('services/unarchiveService/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const serviceId = 'service-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveService(serviceId))

      expect(result.type).toBe('services/unarchiveService/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('deleteService', () => {
    it('should successfully delete service', async () => {
      const serviceId = 'service-123'
      const responseData = { message: 'Услуга успешно удалена' }

      mockedAxiosAPI.delete.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(deleteService(serviceId))

      expect(result.type).toBe('services/delete/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/services/${serviceId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const serviceId = 'service-123'
      const errorData: GlobalError = { message: 'Нельзя удалить услугу с активными заказами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteService(serviceId))

      expect(result.type).toBe('services/delete/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const serviceId = 'service-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteService(serviceId))

      expect(result.type).toBe('services/delete/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty services list', async () => {
      const emptyServices: PopulatedService[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyServices })

      const result = await store.dispatch(fetchServices())

      expect(result.type).toBe('services/fetchAll/fulfilled')
      expect(result.payload).toEqual(emptyServices)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchServices())

      expect(result.type).toBe('services/fetchAll/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent service operations', async () => {
      const serviceData: ServiceMutation = {
        name: 'Concurrent service',
        serviceCategory: 'category-123',
        price: 1000,
        description: 'Concurrent description',
        type: 'внутренняя'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'new-id' } })
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [createResult, fetchResult] = await Promise.all([
        store.dispatch(createService(serviceData)),
        store.dispatch(fetchServices())
      ])

      expect(createResult.type).toBe('services/create/fulfilled')
      expect(fetchResult.type).toBe('services/fetchAll/fulfilled')
    })

    it('should handle service with zero price', async () => {
      const serviceData: ServiceMutation = {
        name: 'Бесплатная услуга',
        serviceCategory: 'category-123',
        price: 0,
        description: 'Бесплатная услуга для клиентов',
        type: 'внутренняя'
      }

      const responseData: PopulatedService = {
        _id: 'free-service-id',
        name: serviceData.name,
        serviceCategory: {
          _id: 'category-123',
          name: 'Бесплатные услуги'
        },
        price: serviceData.price,
        description: serviceData.description,
        type: serviceData.type,
        logs: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createService(serviceData))

      expect(result.type).toBe('services/create/fulfilled')
      expect(result.payload).toEqual(responseData)
    })

    it('should handle service with very high price', async () => {
      const serviceData: ServiceMutation = {
        name: 'Премиум услуга',
        serviceCategory: 'category-123',
        price: 999999,
        description: 'Очень дорогая премиум услуга',
        type: 'внешняя'
      }

      const responseData: PopulatedService = {
        _id: 'premium-service-id',
        name: serviceData.name,
        serviceCategory: {
          _id: 'category-123',
          name: 'Премиум услуги'
        },
        price: serviceData.price,
        description: serviceData.description,
        type: serviceData.type,
        logs: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createService(serviceData))

      expect(result.type).toBe('services/create/fulfilled')
      expect(result.payload).toEqual(responseData)
    })
  })
}) 
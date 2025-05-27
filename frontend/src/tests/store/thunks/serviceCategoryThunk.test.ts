/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchServiceCategories,
  fetchServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  archiveServiceCategory,
  deleteServiceCategory
} from '../../../store/thunks/serviceCategoryThunk'
import {
  ServiceCategory,
  ServiceCategoryMutation,
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



describe('serviceCategoryThunk', () => {
  let store: any

  beforeEach(() => {
          store = configureStore({
        reducer: {
          test: (state = {}) => state
        }
      })
    jest.clearAllMocks()
  })

  describe('fetchServiceCategories', () => {
    it('should successfully fetch service categories', async () => {
      const serviceCategories: ServiceCategory[] = [
        {
          _id: 'category-1',
          name: 'Складские услуги'
        },
        {
          _id: 'category-2',
          name: 'Транспортные услуги'
        },
        {
          _id: 'category-3',
          name: 'Упаковочные услуги'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: serviceCategories })

      const result = await store.dispatch(fetchServiceCategories())

      expect(result.type).toBe('serviceCategories/fetchAll/fulfilled')
      expect(result.payload).toEqual(serviceCategories)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/servicecategories')
    })

    it('should handle fetch service categories error (non-401)', async () => {
      const errorData: GlobalError = { message: 'Ошибка загрузки категорий услуг' }

      const axiosError = {
        response: {
          status: 500,
          data: errorData
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchServiceCategories())

      expect(result.type).toBe('serviceCategories/fetchAll/rejected')
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

      const result = await store.dispatch(fetchServiceCategories())

      expect(result.type).toBe('serviceCategories/fetchAll/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('fetchServiceCategoryById', () => {
    it('should successfully fetch service category by id', async () => {
      const categoryId = 'category-123'
      const serviceCategory: ServiceCategory = {
        _id: categoryId,
        name: 'Конкретная категория услуг'
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: serviceCategory })

      const result = await store.dispatch(fetchServiceCategoryById(categoryId))

      expect(result.type).toBe('serviceCategories/fetchById/fulfilled')
      expect(result.payload).toEqual(serviceCategory)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/servicecategories/${categoryId}`)
    })

    it('should handle fetch service category by id error (non-401)', async () => {
      const categoryId = 'category-123'
      const errorData: GlobalError = { message: 'Категория услуг не найдена' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.get.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(fetchServiceCategoryById(categoryId))

      expect(result.type).toBe('serviceCategories/fetchById/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('createServiceCategory', () => {
    it('should successfully create service category', async () => {
      const categoryData: ServiceCategoryMutation = {
        name: 'Новая категория услуг'
      }

      const responseData: ServiceCategory = {
        _id: 'new-category-id',
        ...categoryData
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createServiceCategory(categoryData))

      expect(result.type).toBe('serviceCategories/create/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/servicecategories', categoryData)
    })

    it('should handle validation error (400 status)', async () => {
      const categoryData: ServiceCategoryMutation = {
        name: ''
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название категории обязательно']
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

      const result = await store.dispatch(createServiceCategory(categoryData))

      expect(result.type).toBe('serviceCategories/create/rejected')
      expect(result.payload).toEqual(validationError)
    })



    it('should throw error for other statuses', async () => {
      const categoryData: ServiceCategoryMutation = {
        name: 'Тестовая категория'
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

      const result = await store.dispatch(createServiceCategory(categoryData))

      expect(result.type).toBe('serviceCategories/create/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('updateServiceCategory', () => {
    it('should successfully update service category', async () => {
      const categoryId = 'category-123'
      const updateData: ServiceCategoryMutation = {
        name: 'Обновленная категория услуг'
      }

      const responseData: ServiceCategory = {
        _id: categoryId,
        ...updateData
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(updateServiceCategory({ id: categoryId, data: updateData }))

      expect(result.type).toBe('serviceCategories/update/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/servicecategories/${categoryId}`, updateData)
    })

    it('should handle update validation error (400 status)', async () => {
      const categoryId = 'category-123'
      const updateData: ServiceCategoryMutation = {
        name: ''
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Название категории обязательно']
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

      const result = await store.dispatch(updateServiceCategory({ id: categoryId, data: updateData }))

      expect(result.type).toBe('serviceCategories/update/rejected')
      expect(result.payload).toEqual(validationError)
    })


  })

  describe('archiveServiceCategory', () => {
    it('should successfully archive service category', async () => {
      const categoryId = 'category-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveServiceCategory(categoryId))

      expect(result.type).toBe('serviceCategories/archive/fulfilled')
      expect(result.payload).toEqual({ id: categoryId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/servicecategories/${categoryId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const categoryId = 'category-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать категорию с активными услугами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveServiceCategory(categoryId))

      expect(result.type).toBe('serviceCategories/archive/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const categoryId = 'category-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveServiceCategory(categoryId))

      expect(result.type).toBe('serviceCategories/archive/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('deleteServiceCategory', () => {
    it('should successfully delete service category', async () => {
      const categoryId = 'category-123'
      const responseData = { message: 'Категория услуг успешно удалена' }

      mockedAxiosAPI.delete.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(deleteServiceCategory(categoryId))

      expect(result.type).toBe('serviceCategories/delete/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/servicecategories/${categoryId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const categoryId = 'category-123'
      const errorData: GlobalError = { message: 'Нельзя удалить категорию с активными услугами' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteServiceCategory(categoryId))

      expect(result.type).toBe('serviceCategories/delete/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const categoryId = 'category-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteServiceCategory(categoryId))

      expect(result.type).toBe('serviceCategories/delete/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty service categories list', async () => {
      const emptyCategories: ServiceCategory[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyCategories })

      const result = await store.dispatch(fetchServiceCategories())

      expect(result.type).toBe('serviceCategories/fetchAll/fulfilled')
      expect(result.payload).toEqual(emptyCategories)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchServiceCategories())

      expect(result.type).toBe('serviceCategories/fetchAll/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent service category operations', async () => {
      const categoryData: ServiceCategoryMutation = {
        name: 'Concurrent category'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'new-id', ...categoryData } })
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [createResult, fetchResult] = await Promise.all([
        store.dispatch(createServiceCategory(categoryData)),
        store.dispatch(fetchServiceCategories())
      ])

      expect(createResult.type).toBe('serviceCategories/create/fulfilled')
      expect(fetchResult.type).toBe('serviceCategories/fetchAll/fulfilled')
    })

    it('should handle service category with special characters in name', async () => {
      const categoryData: ServiceCategoryMutation = {
        name: 'Категория с символами: @#$%^&*()'
      }

      const responseData: ServiceCategory = {
        _id: 'special-category-id',
        ...categoryData
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createServiceCategory(categoryData))

      expect(result.type).toBe('serviceCategories/create/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/servicecategories', categoryData)
    })

    it('should handle very long service category name', async () => {
      const longName = 'Очень длинное название категории услуг '.repeat(10)
      const categoryData: ServiceCategoryMutation = {
        name: longName
      }

      const responseData: ServiceCategory = {
        _id: 'long-name-category-id',
        ...categoryData
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(createServiceCategory(categoryData))

      expect(result.type).toBe('serviceCategories/create/fulfilled')
      expect(result.payload).toEqual(responseData)
    })
  })
}) 
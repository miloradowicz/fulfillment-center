/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchProducts,
  fetchArchivedProducts,
  fetchProductById,
  fetchProductByIdWithPopulate,
  fetchProductsByClientId,
  fetchProductsWithPopulate,
  addProduct,
  archiveProduct,
  unarchiveProduct,
  deleteProduct,
  updateProduct
} from '../../../store/thunks/productThunk'
import {
  Product,
  ProductMutation,
  ProductWithPopulate,
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

describe('productThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('fetchProducts', () => {
    it('should successfully fetch products', async () => {
      const products: Product[] = [
        {
          _id: 'product-1',
          client: 'client-1',
          title: 'Тестовый товар 1',
          barcode: '123456789',
          article: 'ART-001',
          dynamic_fields: [
            {
              key: 'color',
              label: 'Цвет',
              value: 'красный'
            }
          ],
          logs: []
        },
        {
          _id: 'product-2',
          client: 'client-2',
          title: 'Тестовый товар 2',
          barcode: '987654321',
          article: 'ART-002',
          dynamic_fields: [],
          logs: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: products })

      const result = await store.dispatch(fetchProducts())

      expect(result.type).toBe('products/fetchProducts/fulfilled')
      expect(result.payload).toEqual(products)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/products')
    })

    it('should handle fetch products error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchProducts())

      expect(result.type).toBe('products/fetchProducts/rejected')
    })
  })

  describe('fetchArchivedProducts', () => {
    it('should successfully fetch archived products', async () => {
      const archivedProducts: ProductWithPopulate[] = [
        {
          _id: 'product-archived-1',
          client: {
            _id: 'client-1',
            name: 'Архивный клиент',
            phone_number: '+7 (999) 000-00-00',
            email: 'archived@example.com',
            inn: '0000000000'
          },
          title: 'Архивный товар',
          barcode: '000000000',
          article: 'ART-ARCH-001',
          dynamic_fields: [],
          logs: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedProducts })

      const result = await store.dispatch(fetchArchivedProducts())

      expect(result.type).toBe('clients/fetchArchivedProducts/fulfilled')
      expect(result.payload).toEqual(archivedProducts)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/products/archived/all?populate=1')
    })
  })

  describe('fetchProductById', () => {
    it('should successfully fetch product by id', async () => {
      const productId = 'product-123'
      const product: Product = {
        _id: productId,
        client: 'client-1',
        title: 'Конкретный товар',
        barcode: '111111111',
        article: 'ART-123',
        dynamic_fields: [
          {
            key: 'size',
            label: 'Размер',
            value: 'L'
          }
        ],
        logs: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: product })

      const result = await store.dispatch(fetchProductById(productId))

      expect(result.type).toBe('products/fetchProductById/fulfilled')
      expect(result.payload).toEqual(product)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/products/${productId}`)
    })
  })

  describe('fetchProductByIdWithPopulate', () => {
    it('should successfully fetch product by id with populate', async () => {
      const productId = 'product-123'
      const productWithPopulate: ProductWithPopulate = {
        _id: productId,
        client: {
          _id: 'client-1',
          name: 'Клиент с populate',
          phone_number: '+7 (999) 111-22-33',
          email: 'client@example.com',
          inn: '1111111111'
        },
        title: 'Товар с populate',
        barcode: '222222222',
        article: 'ART-POP-123',
        dynamic_fields: [
          {
            key: 'weight',
            label: 'Вес',
            value: '1.5 кг'
          }
        ],
        logs: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: productWithPopulate })

      const result = await store.dispatch(fetchProductByIdWithPopulate(productId))

      expect(result.type).toBe('products/fetchProductByIdWithPopulate/fulfilled')
      expect(result.payload).toEqual(productWithPopulate)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/products/${productId}?populate=1`)
    })
  })

  describe('fetchProductsByClientId', () => {
    it('should successfully fetch products by client id', async () => {
      const clientId = 'client-123'
      const clientProducts: Product[] = [
        {
          _id: 'product-1',
          client: clientId,
          title: 'Товар клиента',
          barcode: '333333333',
          article: 'ART-CLIENT-001',
          dynamic_fields: [],
          logs: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: clientProducts })

      const result = await store.dispatch(fetchProductsByClientId(clientId))

      expect(result.type).toBe('products/fetchByClientId/fulfilled')
      expect(result.payload).toEqual(clientProducts)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/products?client=${clientId}`)
    })
  })

  describe('fetchProductsWithPopulate', () => {
    it('should successfully fetch products with populate', async () => {
      const productsWithPopulate: ProductWithPopulate[] = [
        {
          _id: 'product-1',
          client: {
            _id: 'client-1',
            name: 'Тестовый клиент',
            phone_number: '+7 (999) 123-45-67',
            email: 'test@example.com',
            inn: '1234567890'
          },
          title: 'Товар с клиентом',
          barcode: '444444444',
          article: 'ART-WITH-CLIENT-001',
          dynamic_fields: [],
          logs: []
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: productsWithPopulate })

      const result = await store.dispatch(fetchProductsWithPopulate())

      expect(result.type).toBe('products/fetchProductsWithPopulate/fulfilled')
      expect(result.payload).toEqual(productsWithPopulate)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/products?populate=1')
    })
  })

  describe('addProduct', () => {
    it('should successfully add product', async () => {
      const productData: ProductMutation = {
        client: 'client-123',
        title: 'Новый товар',
        barcode: '555555555',
        article: 'ART-NEW-001',
        dynamic_fields: [
          {
            key: 'category',
            label: 'Категория',
            value: 'электроника'
          }
        ]
      }

      const responseData: Product = {
        _id: 'new-product-id',
        ...productData,
        logs: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(addProduct(productData))

      expect(result.type).toBe('products/addProduct/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/products', productData)
    })

    it('should handle validation error (400 status)', async () => {
      const productData: ProductMutation = {
        client: '',
        title: '',
        barcode: '',
        article: '',
        dynamic_fields: []
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          client: {
            name: 'client',
            messages: ['Клиент обязателен']
          },
          title: {
            name: 'title',
            messages: ['Название товара обязательно']
          },
          barcode: {
            name: 'barcode',
            messages: ['Штрихкод обязателен']
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

      const result = await store.dispatch(addProduct(productData))

      expect(result.type).toBe('products/addProduct/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const productData: ProductMutation = {
        client: 'client-123',
        title: 'Тест',
        barcode: '123456789',
        article: 'ART-001',
        dynamic_fields: []
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addProduct(productData))

      expect(result.type).toBe('products/addProduct/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveProduct', () => {
    it('should successfully archive product', async () => {
      const productId = 'product-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveProduct(productId))

      expect(result.type).toBe('products/archiveProduct/fulfilled')
      expect(result.payload).toEqual({ id: productId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/products/${productId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const productId = 'product-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать товар в заказе' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveProduct(productId))

      expect(result.type).toBe('products/archiveProduct/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const productId = 'product-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveProduct(productId))

      expect(result.type).toBe('products/archiveProduct/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveProduct', () => {
    it('should successfully unarchive product', async () => {
      const productId = 'product-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveProduct(productId))

      expect(result.type).toBe('products/unarchiveProduct/fulfilled')
      expect(result.payload).toEqual({ id: productId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/products/${productId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const productId = 'product-123'
      const errorData: GlobalError = { message: 'Товар не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveProduct(productId))

      expect(result.type).toBe('products/unarchiveProduct/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('deleteProduct', () => {
    it('should successfully delete product', async () => {
      const productId = 'product-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteProduct(productId))

      expect(result.type).toBe('products/deleteProduct/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/products/${productId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const productId = 'product-123'
      const errorData: GlobalError = { message: 'Нельзя удалить товар в заказе' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteProduct(productId))

      expect(result.type).toBe('products/deleteProduct/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('updateProduct', () => {
    it('should successfully update product', async () => {
      const productId = 'product-123'
      const updateData: ProductMutation = {
        client: 'client-456',
        title: 'Обновленный товар',
        barcode: '666666666',
        article: 'ART-UPDATED-001',
        dynamic_fields: [
          {
            key: 'material',
            label: 'Материал',
            value: 'пластик'
          }
        ]
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({})

      const result = await store.dispatch(updateProduct({ productId, data: updateData }))

      expect(result.type).toBe('products/updateProduct/fulfilled')
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/products/${productId}`, updateData)
    })

    it('should handle update validation error (400 status)', async () => {
      const productId = 'product-123'
      const updateData: ProductMutation = {
        client: '',
        title: '',
        barcode: '',
        article: '',
        dynamic_fields: []
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          title: {
            name: 'title',
            messages: ['Название товара обязательно']
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

      const result = await store.dispatch(updateProduct({ productId, data: updateData }))

      expect(result.type).toBe('products/updateProduct/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const productId = 'product-123'
      const updateData: ProductMutation = {
        client: 'client-123',
        title: 'Тест',
        barcode: '123456789',
        article: 'ART-001',
        dynamic_fields: []
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateProduct({ productId, data: updateData }))

      expect(result.type).toBe('products/updateProduct/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty products list', async () => {
      const emptyProducts: Product[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyProducts })

      const result = await store.dispatch(fetchProducts())

      expect(result.type).toBe('products/fetchProducts/fulfilled')
      expect(result.payload).toEqual(emptyProducts)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchProducts())

      expect(result.type).toBe('products/fetchProducts/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent product operations', async () => {
      const productData: ProductMutation = {
        client: 'client-123',
        title: 'Concurrent product',
        barcode: '777777777',
        article: 'ART-CONCURRENT-001',
        dynamic_fields: []
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'new-id' } })
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [addResult, fetchResult] = await Promise.all([
        store.dispatch(addProduct(productData)),
        store.dispatch(fetchProducts())
      ])

      expect(addResult.type).toBe('products/addProduct/fulfilled')
      expect(fetchResult.type).toBe('products/fetchProducts/fulfilled')
    })

    it('should handle product with complex dynamic fields', async () => {
      const complexProductData: ProductMutation = {
        client: 'client-123',
        title: 'Сложный товар',
        barcode: '888888888',
        article: 'ART-COMPLEX-001',
        dynamic_fields: [
          {
            key: 'color',
            label: 'Цвет',
            value: 'синий'
          },
          {
            key: 'size',
            label: 'Размер',
            value: 'XL'
          },
          {
            key: 'weight',
            label: 'Вес',
            value: '2.5 кг'
          }
        ]
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: { _id: 'complex-product' } })

      const result = await store.dispatch(addProduct(complexProductData))

      expect(result.type).toBe('products/addProduct/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/products', complexProductData)
    })
  })
}) 
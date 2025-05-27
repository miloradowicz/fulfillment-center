/* eslint-disable */
import axios from 'axios'

// Мокаем axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Создаем мок для axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    }
  }
}

// Мокаем создание axios instance
mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance)

// Мокаем store actions
const mockSetUser = jest.fn().mockReturnValue({ type: 'auth/setUser' })
const mockUnsetUser = jest.fn().mockReturnValue({ type: 'auth/unsetUser' })

jest.mock('../../store/slices/authSlice', () => ({
  setUser: mockSetUser,
  unsetUser: mockUnsetUser
}))

describe('axiosAPI utilities', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('axiosAPI instance creation', () => {
    it('should create axios instance with correct configuration', () => {
      // Импортируем модуль, чтобы инициализировать создание instance
      require('../../utils/axiosAPI')
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8000',
        withCredentials: true,
        xsrfCookieName: 'XSRF-TOKEN'
      })
    })

    it('should export the axios instance as default', () => {
      const axiosAPI = require('../../utils/axiosAPI').default
      expect(axiosAPI).toBe(mockAxiosInstance)
    })
  })

  describe('addCsrf function', () => {
    it('should successfully add CSRF token to request interceptor', async () => {
      const mockCsrfToken = 'test-csrf-token-123'
      
      // Мокаем успешный ответ от API
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { csrfToken: mockCsrfToken }
      })

      const { addCsrf } = require('../../utils/axiosAPI')
      await addCsrf()

      // Проверяем что API был вызван
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('csrf')
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)

      // Проверяем что interceptor был добавлен
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1)
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(expect.any(Function))

      // Тестируем interceptor функцию
      const interceptorFunction = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const mockConfig = {
        headers: {
          set: jest.fn()
        }
      }
      
      const result = interceptorFunction(mockConfig)
      expect(mockConfig.headers.set).toHaveBeenCalledWith('X-XSRF-TOKEN', mockCsrfToken)
      expect(result).toBe(mockConfig)
    })

    it('should handle API error gracefully and log it', async () => {
      const mockError = new Error('Network error')
      
      // Очищаем предыдущие вызовы
      mockAxiosInstance.get.mockClear()
      mockAxiosInstance.interceptors.request.use.mockClear()
      
      // Мокаем ошибку от API
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const { addCsrf } = require('../../utils/axiosAPI')
      await addCsrf()

      // Проверяем что API был вызван
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('csrf')
      
      // Проверяем что ошибка была залогирована
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

      // Проверяем что interceptor НЕ был добавлен при ошибке
      expect(mockAxiosInstance.interceptors.request.use).not.toHaveBeenCalled()
    })

    it('should handle different types of errors', async () => {
      const testCases = [
        'String error',
        { message: 'Object error' },
        null,
        undefined,
        404
      ]

      const { addCsrf } = require('../../utils/axiosAPI')

      for (const errorCase of testCases) {
        mockAxiosInstance.get.mockClear()
        mockAxiosInstance.interceptors.request.use.mockClear()
        consoleErrorSpy.mockClear()
        
        mockAxiosInstance.get.mockRejectedValueOnce(errorCase)
        
        await addCsrf()
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(errorCase)
        expect(mockAxiosInstance.interceptors.request.use).not.toHaveBeenCalled()
      }
    })

    it('should handle empty CSRF response', async () => {
      mockAxiosInstance.get.mockClear()
      mockAxiosInstance.interceptors.request.use.mockClear()
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {}
      })

      const { addCsrf } = require('../../utils/axiosAPI')
      await addCsrf()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('csrf')
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1)
      
      // Тестируем что interceptor работает с undefined токеном
      const interceptorFunction = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const mockConfig = {
        headers: {
          set: jest.fn()
        }
      }
      
      interceptorFunction(mockConfig)
      expect(mockConfig.headers.set).toHaveBeenCalledWith('X-XSRF-TOKEN', undefined)
    })

    it('should handle malformed CSRF response', async () => {
      mockAxiosInstance.get.mockClear()
      mockAxiosInstance.interceptors.request.use.mockClear()
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { wrongField: 'value' }
      })

      const { addCsrf } = require('../../utils/axiosAPI')
      await addCsrf()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('csrf')
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1)
    })
  })

  describe('checkAuthentication function', () => {
    it('should dispatch setUser on successful authentication', async () => {
      const mockUser = {
        _id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'admin',
        token: 'auth-token-123'
      }

      const mockStore = {
        dispatch: jest.fn()
      }

      mockAxiosInstance.get.mockClear()
      
      // Мокаем успешный ответ
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockUser
      })

      const { checkAuthentication } = require('../../utils/axiosAPI')
      await checkAuthentication(mockStore)

      // Проверяем что API был вызван
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me')
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)

      // Проверяем что setUser был вызван с правильными данными
      expect(mockSetUser).toHaveBeenCalledWith(mockUser)
      expect(mockStore.dispatch).toHaveBeenCalledWith({ type: 'auth/setUser' })
      expect(mockStore.dispatch).toHaveBeenCalledTimes(1)
    })

    it('should dispatch unsetUser on authentication failure', async () => {
      const mockError = new Error('Unauthorized')
      const mockStore = {
        dispatch: jest.fn()
      }
      
      mockAxiosInstance.get.mockClear()
      mockSetUser.mockClear()
      mockUnsetUser.mockClear()
      
      // Мокаем ошибку от API
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const { checkAuthentication } = require('../../utils/axiosAPI')
      await checkAuthentication(mockStore)

      // Проверяем что API был вызван
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me')
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)

      // Проверяем что unsetUser был вызван
      expect(mockUnsetUser).toHaveBeenCalledWith()
      expect(mockStore.dispatch).toHaveBeenCalledWith({ type: 'auth/unsetUser' })
      expect(mockStore.dispatch).toHaveBeenCalledTimes(1)
    })

    it('should handle different types of authentication errors', async () => {
      const errorCases = [
        new Error('Network error'),
        new Error('401 Unauthorized'),
        new Error('403 Forbidden'),
        new Error('500 Internal Server Error'),
        'String error',
        { message: 'Object error' },
        null,
        undefined
      ]

      const { checkAuthentication } = require('../../utils/axiosAPI')

      for (const errorCase of errorCases) {
        mockAxiosInstance.get.mockClear()
        mockUnsetUser.mockClear()
        
        const mockStore = {
          dispatch: jest.fn()
        }
        
        mockAxiosInstance.get.mockRejectedValueOnce(errorCase)
        
        await checkAuthentication(mockStore)
        
        expect(mockUnsetUser).toHaveBeenCalledWith()
        expect(mockStore.dispatch).toHaveBeenCalledWith({ type: 'auth/unsetUser' })
        expect(mockStore.dispatch).toHaveBeenCalledTimes(1)
      }
    })

    it('should handle empty user response', async () => {
      const mockStore = { dispatch: jest.fn() }
      
      mockAxiosInstance.get.mockClear()
      mockSetUser.mockClear()
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: null
      })

      const { checkAuthentication } = require('../../utils/axiosAPI')
      await checkAuthentication(mockStore)

      expect(mockSetUser).toHaveBeenCalledWith(null)
      expect(mockStore.dispatch).toHaveBeenCalledWith({ type: 'auth/setUser' })
    })
  })

  describe('integration tests', () => {
    it('should export all required functions and instance', () => {
      const axiosAPIModule = require('../../utils/axiosAPI')
      
      expect(axiosAPIModule.default).toBe(mockAxiosInstance)
      expect(typeof axiosAPIModule.addCsrf).toBe('function')
      expect(typeof axiosAPIModule.checkAuthentication).toBe('function')
    })

    it('should handle concurrent calls to addCsrf', async () => {
      const mockCsrfToken = 'concurrent-token'
      
      mockAxiosInstance.get.mockClear()
      mockAxiosInstance.get.mockResolvedValue({
        data: { csrfToken: mockCsrfToken }
      })

      const { addCsrf } = require('../../utils/axiosAPI')

      // Запускаем несколько вызовов одновременно
      const promises = [
        addCsrf(),
        addCsrf(),
        addCsrf()
      ]

      await Promise.all(promises)

      // Проверяем что все вызовы были выполнены
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3)
    })

    it('should handle concurrent calls to checkAuthentication', async () => {
      const mockStore = { dispatch: jest.fn() }
      const mockUser = {
        _id: 'concurrent-user',
        email: 'concurrent@example.com',
        displayName: 'Concurrent User',
        role: 'admin',
        token: 'concurrent-token'
      }

      mockAxiosInstance.get.mockClear()
      mockAxiosInstance.get.mockResolvedValue({
        data: mockUser
      })

      const { checkAuthentication } = require('../../utils/axiosAPI')

      // Запускаем несколько вызовов одновременно
      const promises = [
        checkAuthentication(mockStore),
        checkAuthentication(mockStore),
        checkAuthentication(mockStore)
      ]

      await Promise.all(promises)

      // Проверяем что все вызовы были выполнены
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3)
      expect(mockStore.dispatch).toHaveBeenCalledTimes(3)
    })
  })

  describe('coverage edge cases', () => {
    it('should cover all lines in addCsrf success path', async () => {
      const mockCsrfToken = 'coverage-token'
      
      mockAxiosInstance.get.mockClear()
      mockAxiosInstance.interceptors.request.use.mockClear()
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { csrfToken: mockCsrfToken }
      })

      const { addCsrf } = require('../../utils/axiosAPI')
      await addCsrf()

      // Проверяем что все строки в try блоке выполнены
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('csrf')
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(expect.any(Function))
      
      // Проверяем что interceptor функция работает правильно
      const interceptorFunction = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const mockConfig = {
        headers: {
          set: jest.fn()
        }
      }
      
      const result = interceptorFunction(mockConfig)
      expect(mockConfig.headers.set).toHaveBeenCalledWith('X-XSRF-TOKEN', mockCsrfToken)
      expect(result).toBe(mockConfig)
    })

    it('should cover all lines in checkAuthentication success path', async () => {
      const mockUser = {
        _id: 'coverage-user',
        email: 'coverage@example.com',
        displayName: 'Coverage User',
        role: 'manager',
        token: 'coverage-token'
      }

      const mockStore = {
        dispatch: jest.fn()
      }

      mockAxiosInstance.get.mockClear()
      mockSetUser.mockClear()
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockUser
      })

      const { checkAuthentication } = require('../../utils/axiosAPI')
      await checkAuthentication(mockStore)

      // Проверяем что все строки в try блоке выполнены
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me')
      expect(mockSetUser).toHaveBeenCalledWith(mockUser)
      expect(mockStore.dispatch).toHaveBeenCalledWith({ type: 'auth/setUser' })
    })
  })
}) 
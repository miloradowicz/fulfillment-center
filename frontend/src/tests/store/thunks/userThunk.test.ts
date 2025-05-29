/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  registerUser,
  loginUser,
  fetchUsers,
  fetchArchivedUsers,
  fetchUserById,
  updateUser,
  archiveUser,
  unarchiveUser,
  deleteUser,
  logoutUser
} from '../../../store/thunks/userThunk'
import {
  User,
  UserStripped,
  UserRegistrationMutation,
  LoginMutation,
  UserMutation,
  ValidationError,
  GlobalError
} from '../../../types'
import { isAxiosError } from 'axios'
import axiosAPI from '../../../utils/axiosAPI'

// Мокаем axiosAPI
jest.mock('../../../utils/axiosAPI', () => ({
  default: {
    post: jest.fn(),
    get: jest.fn(),
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

describe('userThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('registerUser', () => {
    it('should successfully register user', async () => {
      const userData: UserRegistrationMutation = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'manager'
      }

      const responseUser: User = {
        _id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'manager',
        token: 'auth-token-123'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseUser })

      const result = await store.dispatch(registerUser(userData))

      expect(result.type).toBe('users/registerUser/fulfilled')
      expect(result.payload).toEqual(responseUser)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/users/register', userData)
    })

    it('should handle validation error (400 status)', async () => {
      const userData: UserRegistrationMutation = {
        email: 'invalid-email',
        password: '123',
        displayName: '',
        role: 'manager'
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          email: {
            name: 'email',
            messages: ['Неверный формат email']
          },
          password: {
            name: 'password',
            messages: ['Пароль слишком короткий']
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

      const result = await store.dispatch(registerUser(userData))

      expect(result.type).toBe('users/registerUser/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const userData: UserRegistrationMutation = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'manager'
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(registerUser(userData))

      expect(result.type).toBe('users/registerUser/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('loginUser', () => {
    it('should successfully login user', async () => {
      const loginData: LoginMutation = {
        email: 'test@example.com',
        password: 'password123'
      }

      const responseUser: User = {
        _id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'manager',
        token: 'auth-token-123'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseUser })

      const result = await store.dispatch(loginUser(loginData))

      expect(result.type).toBe('users/loginUser/fulfilled')
      expect(result.payload).toEqual(responseUser)
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/users/sessions', loginData)
    })

    it('should handle login validation error', async () => {
      const loginData: LoginMutation = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          credentials: {
            name: 'credentials',
            messages: ['Неверные учетные данные']
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

      const result = await store.dispatch(loginUser(loginData))

      expect(result.type).toBe('users/loginUser/rejected')
      expect(result.payload).toEqual(validationError)
    })
  })

  describe('fetchUsers', () => {
    it('should successfully fetch users', async () => {
      const users: UserStripped[] = [
        {
          _id: 'user-1',
          email: 'user1@example.com',
          displayName: 'User 1',
          role: 'manager'
        },
        {
          _id: 'user-2',
          email: 'user2@example.com',
          displayName: 'User 2',
          role: 'admin'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: users })

      const result = await store.dispatch(fetchUsers())

      expect(result.type).toBe('users/fetchUsers/fulfilled')
      expect(result.payload).toEqual(users)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/users')
    })

    it('should handle fetch users error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchUsers())

      expect(result.type).toBe('users/fetchUsers/rejected')
    })
  })

  describe('fetchArchivedUsers', () => {
    it('should successfully fetch archived users', async () => {
      const archivedUsers: UserStripped[] = [
        {
          _id: 'user-archived-1',
          email: 'archived1@example.com',
          displayName: 'Archived User 1',
          role: 'stock-worker'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedUsers })

      const result = await store.dispatch(fetchArchivedUsers())

      expect(result.type).toBe('users/fetchArchivedUsers/fulfilled')
      expect(result.payload).toEqual(archivedUsers)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/users/archived/all')
    })
  })

  describe('fetchUserById', () => {
    it('should successfully fetch user by id', async () => {
      const userId = 'user-123'
      const user: User = {
        _id: userId,
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'manager',
        token: 'auth-token-123'
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: user })

      const result = await store.dispatch(fetchUserById(userId))

      expect(result.type).toBe('users/fetchUserById/fulfilled')
      expect(result.payload).toEqual(user)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/users/${userId}`)
    })
  })

  describe('updateUser', () => {
    it('should successfully update user', async () => {
      const userId = 'user-123'
      const updateData: UserMutation = {
        email: 'updated@example.com',
        displayName: 'Updated User',
        role: 'admin'
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({})

      const result = await store.dispatch(updateUser({ userId, data: updateData }))

      expect(result.type).toBe('users/updateUser/fulfilled')
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/users/${userId}`, updateData)
    })

    it('should handle update validation error', async () => {
      const userId = 'user-123'
      const updateData: UserMutation = {
        email: 'invalid-email',
        displayName: '',
        role: 'admin'
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          email: {
            name: 'email',
            messages: ['Неверный формат email']
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

      const result = await store.dispatch(updateUser({ userId, data: updateData }))

      expect(result.type).toBe('users/updateUser/rejected')
      expect(result.payload).toEqual(validationError)
    })
  })

  describe('archiveUser', () => {
    it('should successfully archive user', async () => {
      const userId = 'user-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(archiveUser(userId))

      expect(result.type).toBe('users/archiveUser/fulfilled')
      expect(result.payload).toEqual({ id: userId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/users/${userId}/archive`)
    })

    it('should handle archive error (non-401)', async () => {
      const userId = 'user-123'
      const errorData: GlobalError = { message: 'Нельзя архивировать этого пользователя' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveUser(userId))

      expect(result.type).toBe('users/archiveUser/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const userId = 'user-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(archiveUser(userId))

      expect(result.type).toBe('users/archiveUser/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('unarchiveUser', () => {
    it('should successfully unarchive user', async () => {
      const userId = 'user-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveUser(userId))

      expect(result.type).toBe('users/unarchiveUser/fulfilled')
      expect(result.payload).toEqual({ id: userId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/users/${userId}/unarchive`)
    })

    it('should handle unarchive error', async () => {
      const userId = 'user-123'
      const errorData: GlobalError = { message: 'Пользователь не найден' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveUser(userId))

      expect(result.type).toBe('users/unarchiveUser/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('deleteUser', () => {
    it('should successfully delete user', async () => {
      const userId = 'user-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteUser(userId))

      expect(result.type).toBe('users/deleteUser/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/users/${userId}`)
    })

    it('should handle delete error', async () => {
      const userId = 'user-123'
      const errorData: GlobalError = { message: 'Нельзя удалить этого пользователя' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteUser(userId))

      expect(result.type).toBe('users/deleteUser/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('logoutUser', () => {
    it('should successfully logout user', async () => {
      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(logoutUser())

      expect(result.type).toBe('users/logoutUser/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith('/users/sessions')
    })

    it('should handle logout error', async () => {
      const errorData: GlobalError = { message: 'Ошибка при выходе' }

      const axiosError = {
        response: {
          status: 500,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(logoutUser())

      expect(result.type).toBe('users/logoutUser/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status during logout', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(logoutUser())

      expect(result.type).toBe('users/logoutUser/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchUsers())

      expect(result.type).toBe('users/fetchUsers/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle axios errors without response', async () => {
      const axiosError = new Error('Request timeout')
      
      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const userData: UserRegistrationMutation = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'manager'
      }

      const result = await store.dispatch(registerUser(userData))

      expect(result.type).toBe('users/registerUser/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle different user roles', async () => {
      const roles: Array<'super-admin' | 'admin' | 'manager' | 'stock-worker'> = [
        'super-admin', 'admin', 'manager', 'stock-worker'
      ]

      for (const role of roles) {
        mockedAxiosAPI.post.mockClear()
        
        const userData: UserRegistrationMutation = {
          email: `${role}@example.com`,
          password: 'password123',
          displayName: `${role} User`,
          role
        }

        const responseUser: User = {
          _id: `user-${role}`,
          email: `${role}@example.com`,
          displayName: `${role} User`,
          role,
          token: `token-${role}`
        }

        mockedAxiosAPI.post.mockResolvedValueOnce({ data: responseUser })

        const result = await store.dispatch(registerUser(userData))

        expect(result.type).toBe('users/registerUser/fulfilled')
        expect(result.payload.role).toBe(role)
      }
    })
  })
}) 
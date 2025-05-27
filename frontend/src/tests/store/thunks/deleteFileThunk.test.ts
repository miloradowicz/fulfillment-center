/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import { deleteFile } from '../../../store/thunks/deleteFileThunk'
import { GlobalError } from '../../../types'
import { isAxiosError } from 'axios'
import axiosAPI from '../../../utils/axiosAPI'

// Мокаем axiosAPI
jest.mock('../../../utils/axiosAPI', () => ({
  default: {
    delete: jest.fn()
  }
}))

// Мокаем isAxiosError
jest.mock('axios', () => ({
  isAxiosError: jest.fn()
}))

const mockedAxiosAPI = axiosAPI as jest.Mocked<typeof axiosAPI>
const mockedIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>

describe('deleteFileThunk', () => {
  let store: any

  beforeEach(() => {
    // Создаем простой store для тестирования
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('deleteFile', () => {
    it('should successfully delete file and return filename', async () => {
      const filename = 'test-file.pdf'
      
      // Мокаем успешный ответ
      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/fulfilled')
      expect(result.payload).toBe(filename)
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/files/${filename}`)
      expect(mockedAxiosAPI.delete).toHaveBeenCalledTimes(1)
    })

    it('should handle axios error with status 400 and return error data', async () => {
      const filename = 'test-file.pdf'
      const errorData: GlobalError = { message: 'Файл не найден' }
      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      // Мокаем axios ошибку
      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/rejected')
      expect(result.payload).toEqual(errorData)
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/files/${filename}`)
    })

    it('should handle axios error with status 500 and return error data', async () => {
      const filename = 'test-file.pdf'
      const errorData: GlobalError = { message: 'Внутренняя ошибка сервера' }
      const axiosError = {
        response: {
          status: 500,
          data: errorData
        }
      }

      // Мокаем axios ошибку
      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status (unauthorized)', async () => {
      const filename = 'test-file.pdf'
      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      // Мокаем axios ошибку с 401 статусом
      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/rejected')
      expect(result.meta.rejectedWithValue).toBe(false) // Ошибка была выброшена, а не возвращена через rejectWithValue
    })

    it('should throw error when response is missing', async () => {
      const filename = 'test-file.pdf'
      const axiosError = new Error('Network error')

      // Мокаем axios ошибку без response
      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should throw error when isAxiosError returns false', async () => {
      const filename = 'test-file.pdf'
      const genericError = new Error('Generic error')

      // Мокаем не-axios ошибку
      mockedAxiosAPI.delete.mockRejectedValueOnce(genericError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle different file types', async () => {
      const testFiles = [
        'document.pdf',
        'image.jpg',
        'spreadsheet.xlsx',
        'text.txt',
        'file-with-spaces.docx',
        'файл-с-кириллицей.pdf'
      ]

      for (const filename of testFiles) {
        mockedAxiosAPI.delete.mockClear()
        mockedAxiosAPI.delete.mockResolvedValueOnce({})

        const result = await store.dispatch(deleteFile(filename))

        expect(result.type).toBe('files/deleteFile/fulfilled')
        expect(result.payload).toBe(filename)
        expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/files/${filename}`)
      }
    })

    it('should handle empty filename', async () => {
      const filename = ''
      
      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/fulfilled')
      expect(result.payload).toBe('')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith('/files/')
    })

    it('should handle filename with special characters', async () => {
      const filename = 'file@#$%^&*()_+.pdf'
      
      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteFile(filename))

      expect(result.type).toBe('files/deleteFile/fulfilled')
      expect(result.payload).toBe(filename)
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/files/${filename}`)
    })
  })
}) 
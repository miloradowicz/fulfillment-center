/* eslint-disable */
import { handleErrorToast } from '../../utils/handleErrorToast'
import { toast } from 'react-toastify'

// Мокаем react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn()
  }
}))

const mockedToast = toast as jest.Mocked<typeof toast>

describe('handleErrorToast utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show string error', () => {
    const errorMessage = 'Произошла ошибка'
    
    handleErrorToast(errorMessage)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Произошла ошибка')
  })

  it('should show Error instance message', () => {
    const error = new Error('Ошибка сети')
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Ошибка сети')
  })

  it('should show object with message property', () => {
    const error = { message: 'Ошибка валидации' }
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Ошибка валидации')
  })

  it('should show default message for unknown error type', () => {
    const error = { code: 500, status: 'error' }
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should show default message for null error', () => {
    handleErrorToast(null)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should show default message for undefined error', () => {
    handleErrorToast(undefined)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should show default message for number error', () => {
    handleErrorToast(404)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should show default message for boolean error', () => {
    handleErrorToast(false)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should handle object with non-string message property', () => {
    const error = { message: 123 }
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should handle object with null message property', () => {
    const error = { message: null }
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should handle object with undefined message property', () => {
    const error = { message: undefined }
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })

  it('should handle empty string error', () => {
    handleErrorToast('')
    
    expect(mockedToast.error).toHaveBeenCalledWith('')
  })

  it('should handle Error with empty message', () => {
    const error = new Error('')
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('')
  })

  it('should handle object with empty string message', () => {
    const error = { message: '' }
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('')
  })

  it('should handle custom Error subclass', () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message)
        this.name = 'CustomError'
      }
    }
    
    const error = new CustomError('Пользовательская ошибка')
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Пользовательская ошибка')
  })

  it('should handle array error', () => {
    const error = ['error1', 'error2']
    
    handleErrorToast(error)
    
    expect(mockedToast.error).toHaveBeenCalledWith('Неизвестная ошибка')
  })
}) 
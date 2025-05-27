/* eslint-disable */
import { getFieldError } from '../../utils/getFieldError'
import { ValidationError } from '../../types'

describe('getFieldError utility', () => {
  it('should return error message when field has error', () => {
    const validationError: ValidationError = {
      type: 'ValidationError',
      errors: {
        name: {
          name: 'name',
          messages: ['Поле обязательно для заполнения']
        }
      }
    }

    const result = getFieldError('name', validationError)
    expect(result).toBe('Поле обязательно для заполнения')
  })

  it('should join multiple error messages with semicolon', () => {
    const validationError: ValidationError = {
      type: 'ValidationError',
      errors: {
        email: {
          name: 'email',
          messages: ['Поле обязательно для заполнения', 'Неверный формат email']
        }
      }
    }

    const result = getFieldError('email', validationError)
    expect(result).toBe('Поле обязательно для заполнения; Неверный формат email')
  })

  it('should return undefined when field has no errors', () => {
    const validationError: ValidationError = {
      type: 'ValidationError',
      errors: {
        name: {
          name: 'name',
          messages: ['Поле обязательно для заполнения']
        }
      }
    }

    const result = getFieldError('email', validationError)
    expect(result).toBeUndefined()
  })

  it('should return undefined when createError is null', () => {
    const result = getFieldError('name', null)
    expect(result).toBeUndefined()
  })

  it('should return undefined when createError is undefined', () => {
    const result = getFieldError('name', undefined as any)
    expect(result).toBeUndefined()
  })

  it('should handle empty messages array', () => {
    const validationError: ValidationError = {
      type: 'ValidationError',
      errors: {
        name: {
          name: 'name',
          messages: []
        }
      }
    }

    const result = getFieldError('name', validationError)
    expect(result).toBe('')
  })

  it('should handle malformed validation error gracefully', () => {
    const malformedError = {
      type: 'ValidationError',
      errors: {
        name: {
          // missing messages property
          name: 'name'
        }
      }
    } as any

    const result = getFieldError('name', malformedError)
    expect(result).toBeUndefined()
  })

  it('should handle validation error without errors property', () => {
    const malformedError = {
      type: 'ValidationError'
      // missing errors property
    } as any

    const result = getFieldError('name', malformedError)
    expect(result).toBeUndefined()
  })

  it('should handle field with single message', () => {
    const validationError: ValidationError = {
      type: 'ValidationError',
      errors: {
        password: {
          name: 'password',
          messages: ['Пароль должен содержать минимум 8 символов']
        }
      }
    }

    const result = getFieldError('password', validationError)
    expect(result).toBe('Пароль должен содержать минимум 8 символов')
  })

  it('should handle multiple fields with errors', () => {
    const validationError: ValidationError = {
      type: 'ValidationError',
      errors: {
        name: {
          name: 'name',
          messages: ['Поле обязательно для заполнения']
        },
        email: {
          name: 'email',
          messages: ['Неверный формат email']
        }
      }
    }

    const nameResult = getFieldError('name', validationError)
    const emailResult = getFieldError('email', validationError)
    
    expect(nameResult).toBe('Поле обязательно для заполнения')
    expect(emailResult).toBe('Неверный формат email')
  })
}) 
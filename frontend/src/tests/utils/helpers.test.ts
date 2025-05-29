/* eslint-disable */
import { isValidationError } from '../../utils/helpers'
import { ValidationError, GlobalError } from '../../types'

describe('helpers utilities', () => {
  describe('isValidationError', () => {
    it('should return true for validation error', () => {
      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: ['Поле обязательно для заполнения']
          }
        }
      }

      expect(isValidationError(validationError)).toBe(true)
    })

    it('should return false for global error', () => {
      const globalError: GlobalError = {
        message: 'Произошла ошибка сервера'
      }

      expect(isValidationError(globalError)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isValidationError(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidationError(undefined)).toBe(false)
    })

    it('should return false for object without type property', () => {
      const invalidError = {
        message: 'Some error'
      }

      expect(isValidationError(invalidError)).toBe(false)
    })

    it('should return false for object with wrong type', () => {
      const wrongTypeError = {
        type: 'global',
        errors: {}
      }

      expect(isValidationError(wrongTypeError)).toBe(false)
    })

    it('should return false for object with invalid errors structure', () => {
      const invalidErrorsError = {
        type: 'ValidationError',
        errors: {
          name: {
            // missing 'name' property
            messages: ['Error message']
          }
        }
      }

      expect(isValidationError(invalidErrorsError)).toBe(false)
    })

    it('should return false for object with non-array messages', () => {
      const invalidMessagesError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: 'Not an array'
          }
        }
      }

      expect(isValidationError(invalidMessagesError)).toBe(false)
    })

    it('should return false for object with non-string messages', () => {
      const invalidMessageTypeError = {
        type: 'ValidationError',
        errors: {
          name: {
            name: 'name',
            messages: [123, 'valid message']
          }
        }
      }

      expect(isValidationError(invalidMessageTypeError)).toBe(false)
    })
  })
}) 
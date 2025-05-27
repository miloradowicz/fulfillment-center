/* eslint-disable */

import { ArgumentsHost } from '@nestjs/common'
import { Response } from 'express'
import { Error } from 'mongoose'
import { ValidationErrorFilter } from '../../src/exception-filters/mongo-validation-error.filter'
describe('ValidationErrorFilter', () => {
  let filter: ValidationErrorFilter
  let mockResponse: Partial<Response>
  let mockArgumentsHost: Partial<ArgumentsHost>
  beforeEach(() => {
    filter = new ValidationErrorFilter()
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    const mockHttpArgumentsHost = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn(),
    }
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    }
  })
  it('should be defined', () => {
    expect(filter).toBeDefined()
  })
  it('should catch ValidationError and return formatted response', () => {
    const validationError = new Error.ValidationError()
    validationError.errors = {
      name: {
        name: 'ValidatorError',
        message: 'Name is required',
        path: 'name',
        value: '',
      } as any,
      email: {
        name: 'ValidatorError', 
        message: 'Email is invalid',
        path: 'email',
        value: 'invalid-email',
      } as any,
    }
    filter.catch(validationError, mockArgumentsHost as ArgumentsHost)
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      type: 'ValidationError',
      errors: {
        name: {
          name: 'ValidatorError',
          messages: ['Name is required'],
        },
        email: {
          name: 'ValidatorError',
          messages: ['Email is invalid'],
        },
      },
    })
  })
  it('should handle empty validation errors', () => {
    const validationError = new Error.ValidationError()
    validationError.errors = {}
    filter.catch(validationError, mockArgumentsHost as ArgumentsHost)
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      type: 'ValidationError',
      errors: {},
    })
  })
  it('should handle single validation error', () => {
    const validationError = new Error.ValidationError()
    validationError.errors = {
      username: {
        name: 'ValidatorError',
        message: 'Username must be unique',
        path: 'username',
        value: 'duplicate-username',
      } as any,
    }
    filter.catch(validationError, mockArgumentsHost as ArgumentsHost)
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      type: 'ValidationError',
      errors: {
        username: {
          name: 'ValidatorError',
          messages: ['Username must be unique'],
        },
      },
    })
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { DtoValidationError, DtoValidationErrorFilter } from '../../src/exception-filters/dto-validation-error.filter'
import { ArgumentsHost } from '@nestjs/common'
import { ValidationError } from 'class-validator'
describe('DtoValidationErrorFilter', () => {
  let filter: DtoValidationErrorFilter
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }
  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue(mockResponse),
    }),
  } as unknown as ArgumentsHost
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DtoValidationErrorFilter],
    }).compile()
    filter = module.get<DtoValidationErrorFilter>(DtoValidationErrorFilter)
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(filter).toBeDefined()
  })
  describe('DtoValidationError', () => {
    it('should create error with validation errors', () => {
      const validationErrors: ValidationError[] = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
          children: [],
        } as ValidationError,
      ]
      const error = new DtoValidationError(validationErrors)
      expect(error).toBeInstanceOf(Error)
      expect(error.errors).toEqual(validationErrors)
    })
  })
  describe('catch', () => {
    it('should handle simple validation errors', () => {
      const validationErrors: ValidationError[] = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
          children: [],
        } as ValidationError,
      ]
      const exception = new DtoValidationError(validationErrors)
      filter.catch(exception, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {
          email: {
            name: 'DtoValidationError',
            messages: ['email must be an email'],
          },
        },
      })
    })
    it('should handle multiple validation errors', () => {
      const validationErrors: ValidationError[] = [
        {
          property: 'email',
          constraints: { 
            isEmail: 'email must be an email',
            isNotEmpty: 'email should not be empty'
          },
          children: [],
        } as ValidationError,
        {
          property: 'name',
          constraints: { isNotEmpty: 'name should not be empty' },
          children: [],
        } as ValidationError,
      ]
      const exception = new DtoValidationError(validationErrors)
      filter.catch(exception, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {
          email: {
            name: 'DtoValidationError',
            messages: ['email must be an email', 'email should not be empty'],
          },
          name: {
            name: 'DtoValidationError',
            messages: ['name should not be empty'],
          },
        },
      })
    })
    it('should handle nested validation errors', () => {
      const validationErrors: ValidationError[] = [
        {
          property: 'address',
          constraints: undefined,
          children: [
            {
              property: 'street',
              constraints: { isNotEmpty: 'street should not be empty' },
              children: [],
            } as ValidationError,
          ],
        } as ValidationError,
      ]
      const exception = new DtoValidationError(validationErrors)
      filter.catch(exception, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {
          'address/street': {
            name: 'DtoValidationError',
            messages: ['street should not be empty'],
          },
        },
      })
    })
    it('should handle validation errors without constraints', () => {
      const validationErrors: ValidationError[] = [
        {
          property: 'data',
          constraints: undefined,
          children: [],
        } as ValidationError,
      ]
      const exception = new DtoValidationError(validationErrors)
      filter.catch(exception, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {},
      })
    })
    it('should handle empty validation errors array', () => {
      const exception = new DtoValidationError([])
      filter.catch(exception, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {},
      })
    })
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { CastErrorFilter } from '../../src/exception-filters/mongo-cast-error.filter'
import { ArgumentsHost } from '@nestjs/common'
import { Error } from 'mongoose'
describe('CastErrorFilter', () => {
  let filter: CastErrorFilter
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
      providers: [CastErrorFilter],
    }).compile()
    filter = module.get<CastErrorFilter>(CastErrorFilter)
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(filter).toBeDefined()
  })
  describe('catch', () => {
    it('should handle CastError and return formatted response', () => {
      const castError = {
        path: '_id',
        value: 'invalid-id',
        kind: 'ObjectId',
        name: 'CastError',
      } as Error.CastError
      filter.catch(castError, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {
          _id: {
            name: 'CastError',
            messages: [
              '"invalid-id" is not a valid _id; value must be convertible to type "ObjectId"',
            ],
          },
        },
      })
    })
    it('should handle CastError with different field and type', () => {
      const castError = {
        path: 'age',
        value: 'not-a-number',
        kind: 'Number',
        name: 'CastError',
      } as Error.CastError
      filter.catch(castError, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {
          age: {
            name: 'CastError',
            messages: [
              '"not-a-number" is not a valid age; value must be convertible to type "Number"',
            ],
          },
        },
      })
    })
    it('should handle CastError with null value', () => {
      const castError = {
        path: 'userId',
        value: null,
        kind: 'ObjectId',
        name: 'CastError',
      } as Error.CastError
      filter.catch(castError, mockArgumentsHost)
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        type: 'ValidationError',
        errors: {
          userId: {
            name: 'CastError',
            messages: [
              '"null" is not a valid userId; value must be convertible to type "ObjectId"',
            ],
          },
        },
      })
    })
  })
}) 
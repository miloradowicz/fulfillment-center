/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { getConnectionToken } from '@nestjs/mongoose'
import { Connection, Error } from 'mongoose'
import { ValidationArguments } from 'class-validator'
import { IsMongoDocumentRule } from '../../src/validators/mongo-document-exists.rule'
describe('IsMongoDocumentRule', () => {
  let rule: IsMongoDocumentRule
  let mockConnection: Partial<Connection>
  let mockModel: any
  beforeEach(async () => {
    mockModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    }
    mockConnection = {
      models: {
        TestModel: mockModel,
      },
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsMongoDocumentRule,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile()
    rule = module.get<IsMongoDocumentRule>(IsMongoDocumentRule)
  })
  it('should be defined', () => {
    expect(rule).toBeDefined()
  })
  describe('validate', () => {
    it('should return true when document exists by ID', async () => {
      const mockDocument = { _id: 'test-id', name: 'Test' }
      mockModel.findById.mockResolvedValue(mockDocument)
      const args: ValidationArguments = {
        value: 'test-id',
        constraints: [{ name: 'TestModel' }],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const result = await rule.validate('test-id', args)
      expect(result).toBe(true)
      expect(mockModel.findById).toHaveBeenCalledWith('test-id')
    })
    it('should return false when document does not exist by ID', async () => {
      mockModel.findById.mockResolvedValue(null)
      const args: ValidationArguments = {
        value: 'non-existent-id',
        constraints: [{ name: 'TestModel' }],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const result = await rule.validate('non-existent-id', args)
      expect(result).toBe(false)
      expect(mockModel.findById).toHaveBeenCalledWith('non-existent-id')
    })
    it('should return true when document exists by field name', async () => {
      const mockDocument = { _id: 'test-id', email: 'test@example.com' }
      mockModel.findOne.mockResolvedValue(mockDocument)
      const args: ValidationArguments = {
        value: 'test@example.com',
        constraints: [{ name: 'TestModel' }, 'email'],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const result = await rule.validate('test@example.com', args)
      expect(result).toBe(true)
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' })
    })
    it('should return false when document does not exist by field name', async () => {
      mockModel.findOne.mockResolvedValue(null)
      const args: ValidationArguments = {
        value: 'nonexistent@example.com',
        constraints: [{ name: 'TestModel' }, 'email'],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const result = await rule.validate('nonexistent@example.com', args)
      expect(result).toBe(false)
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' })
    })
    it('should handle inverse validation (document should not exist)', async () => {
      mockModel.findById.mockResolvedValue(null)
      const args: ValidationArguments = {
        value: 'test-id',
        constraints: [{ name: 'TestModel' }, undefined, undefined, true], 
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const result = await rule.validate('test-id', args)
      expect(result).toBe(true) 
    })
    it('should return false when database error occurs', async () => {
      const error = new Error('Database connection failed')
      mockModel.findById.mockRejectedValue(error)
      const args: ValidationArguments = {
        value: 'test-id',
        constraints: [{ name: 'TestModel' }],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const result = await rule.validate('test-id', args)
      expect(result).toBe(false)
    })
  })
  describe('defaultMessage', () => {
    it('should return cast error message when CastError occurs', async () => {
      const castError = new Error.CastError('ObjectId', 'invalid-id', '_id')
      mockModel.findById.mockRejectedValue(castError)
      const args: ValidationArguments = {
        value: 'invalid-id',
        constraints: [{ name: 'TestModel' }],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      await rule.validate('invalid-id', args)
      const message = rule.defaultMessage(args)
      expect(message).toBe(castError.message)
    })
    it('should return custom string message', () => {
      const args: ValidationArguments = {
        value: 'test-value',
        constraints: [{ name: 'TestModel' }, undefined, { message: 'Custom error message' }],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const message = rule.defaultMessage(args)
      expect(message).toBe('Custom error message')
    })
    it('should return function message result', () => {
      const messageFunction = jest.fn().mockReturnValue('Function message')
      const args: ValidationArguments = {
        value: 'test-value',
        constraints: [{ name: 'TestModel' }, undefined, { message: messageFunction }],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const message = rule.defaultMessage(args)
      expect(message).toBe('Function message')
      expect(messageFunction).toHaveBeenCalledWith(args)
    })
    it('should return default message for non-inverse validation', () => {
      const args: ValidationArguments = {
        value: 'test-value',
        constraints: [{ name: 'TestModel' }, undefined, {}],
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const message = rule.defaultMessage(args)
      expect(message).toBe('testProperty does not exist')
    })
    it('should return default message for inverse validation', () => {
      const args: ValidationArguments = {
        value: 'test-value',
        constraints: [{ name: 'TestModel' }, undefined, {}, true], 
        targetName: 'TestClass',
        property: 'testProperty',
        object: {},
      }
      const message = rule.defaultMessage(args)
      expect(message).toBe('testProperty exists')
    })
  })
}) 
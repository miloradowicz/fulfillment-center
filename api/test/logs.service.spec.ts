/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'
import { LogsService } from '../src/services/logs.service'
describe('LogsService', () => {
  let service: LogsService
  const mockUserId = new Types.ObjectId('000000000000000000000001')
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsService],
    }).compile()
    service = module.get<LogsService>(LogsService)
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('generateLogForCreate', () => {
    it('should generate log for object creation', () => {
      const result = service.generateLogForCreate(mockUserId)
      expect(result).toEqual({
        user: mockUserId,
        change: 'Создан объект',
        date: expect.any(Date),
      })
    })
  })
  describe('generateLogForArchive', () => {
    it('should generate log for archiving object', () => {
      const result = service.generateLogForArchive(mockUserId, true)
      expect(result).toEqual({
        user: mockUserId,
        change: 'Архивирован объект',
        date: expect.any(Date),
      })
    })
    it('should generate log for unarchiving object', () => {
      const result = service.generateLogForArchive(mockUserId, false)
      expect(result).toEqual({
        user: mockUserId,
        change: 'Восстановлен объект',
        date: expect.any(Date),
      })
    })
  })
  describe('trackChanges', () => {
    it('should return null when no changes detected', () => {
      const oldObj = { name: 'Test', value: 123 }
      const newObj = { name: 'Test', value: 123 }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result).toBeNull()
    })
    it('should return null when only ignored fields changed', () => {
      const oldObj = { name: 'Test', _id: 'old-id', updatedAt: new Date('2023-01-01') }
      const newObj = { name: 'Test', _id: 'new-id', updatedAt: new Date('2023-01-02') }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result).toBeNull()
    })
    it('should track field addition', () => {
      const oldObj = { name: 'Test' }
      const newObj = { name: 'Test', description: 'New description' }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result).toEqual({
        user: mockUserId,
        change: 'Добавлено: description = "New description"',
        date: expect.any(Date),
      })
    })
    it('should track field deletion', () => {
      const oldObj = { name: 'Test', description: 'Old description' }
      const newObj = { name: 'Test' }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result).toEqual({
        user: mockUserId,
        change: 'Удалено: description = "Old description"',
        date: expect.any(Date),
      })
    })
    it('should track field modification', () => {
      const oldObj = { name: 'Old Name', value: 100 }
      const newObj = { name: 'New Name', value: 200 }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result?.change).toContain('Изменено: name с "Old Name" на "New Name"')
      expect(result?.change).toContain('Изменено: value с 100 на 200')
      expect(result?.user).toEqual(mockUserId)
      expect(result?.date).toBeInstanceOf(Date)
    })
    it('should track array changes - addition', () => {
      const oldObj = { items: ['item1'] }
      const newObj = { items: ['item1', 'item2'] }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result?.change).toContain('Добавлено в массив items[1]: "item2"')
    })
    it('should track array changes - deletion', () => {
      const oldObj = { items: ['item1', 'item2'] }
      const newObj = { items: ['item1'] }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result?.change).toContain('Удалено из массива items[1]: "item2"')
    })
    it('should track array changes - modification', () => {
      const oldObj = { items: ['old-item'] }
      const newObj = { items: ['new-item'] }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result?.change).toContain('Изменено: items.0 с "old-item" на "new-item"')
    })
    it('should handle multiple changes', () => {
      const oldObj = { name: 'Old Name', status: 'active', count: 5 }
      const newObj = { name: 'New Name', status: 'inactive', count: 10 }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result?.change).toContain('Изменено: name')
      expect(result?.change).toContain('Изменено: status')
      expect(result?.change).toContain('Изменено: count')
      expect(result?.change.split(';')).toHaveLength(3)
    })
    it('should handle nested object changes', () => {
      const oldObj = { user: { name: 'John', age: 25 } }
      const newObj = { user: { name: 'Jane', age: 25 } }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result?.change).toContain('Изменено: user.name с "John" на "Jane"')
    })
    it('should ignore null to undefined changes', () => {
      const oldObj = { value: null }
      const newObj = { value: undefined }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result).toBeDefined()
    })
    it('should handle complex object changes', () => {
      const oldObj = {
        name: 'Product',
        price: 100,
        tags: ['tag1', 'tag2'],
        metadata: { color: 'red', size: 'M' }
      }
      const newObj = {
        name: 'Updated Product',
        price: 150,
        tags: ['tag1', 'tag3'],
        metadata: { color: 'blue', size: 'M' }
      }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result).toBeDefined()
      expect(result?.change).toContain('name')
      expect(result?.change).toContain('price')
      expect(result?.user).toEqual(mockUserId)
    })
    it('should filter out ignored paths correctly', () => {
      const oldObj = {
        name: 'Test',
        _id: 'old-id',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        __v: 1,
        logs: [],
        isArchived: false,
        totalAmount: 100
      }
      const newObj = {
        name: 'Updated Test',
        _id: 'new-id',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
        __v: 2,
        logs: [{ change: 'test' }],
        isArchived: true,
        totalAmount: 200
      }
      const result = service.trackChanges(oldObj, newObj, mockUserId)
      expect(result?.change).toBe('Изменено: name с "Test" на "Updated Test"')
    })
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CounterService } from '../src/services/counter.service'
import { Counter, CounterDocument } from '../src/schemas/counter.schema'
describe('CounterService', () => {
  let service: CounterService
  let counterModel: Model<CounterDocument>
  const mockCounter = {
    name: 'test-sequence',
    seq: 5,
  }
  const mockCounterModel = {
    findOneAndUpdate: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CounterService,
        {
          provide: getModelToken(Counter.name),
          useValue: mockCounterModel,
        },
      ],
    }).compile()
    service = module.get<CounterService>(CounterService)
    counterModel = module.get<Model<CounterDocument>>(getModelToken(Counter.name))
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getNextSequence', () => {
    it('should return next sequence number for existing counter', async () => {
      const expectedCounter = { ...mockCounter, seq: 6 }
      jest.spyOn(mockCounterModel, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue(expectedCounter),
      } as any)
      const result = await service.getNextSequence('test-sequence')
      expect(result).toBe(6)
      expect(mockCounterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: 'test-sequence' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session: undefined }
      )
    })
    it('should return 1 for new counter when upsert creates new document', async () => {
      const newCounter = { name: 'new-sequence', seq: 1 }
      jest.spyOn(mockCounterModel, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue(newCounter),
      } as any)
      const result = await service.getNextSequence('new-sequence')
      expect(result).toBe(1)
      expect(mockCounterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: 'new-sequence' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session: undefined }
      )
    })
    it('should return 1 when counter is null', async () => {
      jest.spyOn(mockCounterModel, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any)
      const result = await service.getNextSequence('null-sequence')
      expect(result).toBe(1)
    })
    it('should pass session parameter when provided', async () => {
      const mockSession = {} as any
      const expectedCounter = { ...mockCounter, seq: 7 }
      jest.spyOn(mockCounterModel, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue(expectedCounter),
      } as any)
      const result = await service.getNextSequence('test-sequence', mockSession)
      expect(result).toBe(7)
      expect(mockCounterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: 'test-sequence' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session: mockSession }
      )
    })
    it('should handle different sequence names', async () => {
      const sequences = ['invoice', 'order', 'arrival']
      for (let i = 0; i < sequences.length; i++) {
        const expectedCounter = { name: sequences[i], seq: i + 10 }
        jest.spyOn(mockCounterModel, 'findOneAndUpdate').mockReturnValue({
          lean: jest.fn().mockResolvedValue(expectedCounter),
        } as any)
        const result = await service.getNextSequence(sequences[i])
        expect(result).toBe(i + 10)
      }
    })
  })
}) 
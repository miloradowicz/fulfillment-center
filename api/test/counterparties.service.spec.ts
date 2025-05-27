/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Model } from 'mongoose'
import { CounterpartiesService } from '../src/services/counterparties.service'
import { Counterparty, CounterpartyDocument } from '../src/schemas/counterparty.schema'
import { CreateCounterpartyDto } from '../src/dto/create-counterparty.dto'
import { UpdateCounterpartyDto } from '../src/dto/update-counterparty.dto'
describe('CounterpartiesService', () => {
  let service: CounterpartiesService
  let counterpartyModel: Model<CounterpartyDocument>
  const mockCounterparty = {
    _id: 'counterparty-id-1',
    name: 'Test Counterparty',
    contactInfo: 'test@example.com',
    isArchived: false,
    save: jest.fn().mockResolvedValue(this),
  }
  const mockArchivedCounterparty = {
    ...mockCounterparty,
    _id: 'counterparty-id-2',
    name: 'Archived Counterparty',
    isArchived: true,
  }
  const mockCounterpartyModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CounterpartiesService,
        {
          provide: getModelToken(Counterparty.name),
          useValue: mockCounterpartyModel,
        },
      ],
    }).compile()
    service = module.get<CounterpartiesService>(CounterpartiesService)
    counterpartyModel = module.get<Model<CounterpartyDocument>>(getModelToken(Counterparty.name))
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getAll', () => {
    it('should return all non-archived counterparties in reverse order', async () => {
      const counterparties = [mockCounterparty]
      jest.spyOn(mockCounterpartyModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(counterparties),
      } as any)
      const result = await service.getAll()
      expect(result).toEqual(counterparties.reverse())
      expect(mockCounterpartyModel.find).toHaveBeenCalledWith({ isArchived: false })
    })
  })
  describe('getAllArchived', () => {
    it('should return all archived counterparties in reverse order', async () => {
      const archivedCounterparties = [mockArchivedCounterparty]
      jest.spyOn(mockCounterpartyModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(archivedCounterparties),
      } as any)
      const result = await service.getAllArchived()
      expect(result).toEqual(archivedCounterparties.reverse())
      expect(mockCounterpartyModel.find).toHaveBeenCalledWith({ isArchived: true })
    })
  })
  describe('getById', () => {
    it('should return a counterparty by id', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCounterparty),
      } as any)
      const result = await service.getById('counterparty-id-1')
      expect(result).toEqual(mockCounterparty)
      expect(mockCounterpartyModel.findById).toHaveBeenCalledWith('counterparty-id-1')
    })
    it('should throw NotFoundException if counterparty not found', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      await expect(service.getById('non-existent-id')).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if counterparty is archived', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockArchivedCounterparty),
      } as any)
      await expect(service.getById('counterparty-id-2')).rejects.toThrow(ForbiddenException)
    })
  })
  describe('getArchivedById', () => {
    it('should return an archived counterparty by id', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockArchivedCounterparty),
      } as any)
      const result = await service.getArchivedById('counterparty-id-2')
      expect(result).toEqual(mockArchivedCounterparty)
    })
    it('should throw NotFoundException if counterparty not found', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      await expect(service.getArchivedById('non-existent-id')).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if counterparty is not archived', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCounterparty),
      } as any)
      await expect(service.getArchivedById('counterparty-id-1')).rejects.toThrow(ForbiddenException)
    })
  })
  describe('create', () => {
    it('should create a new counterparty', async () => {
      const createDto: CreateCounterpartyDto = {
        name: 'New Counterparty',
        phone_number: '+7 (999) 123-45-67',
        address: 'Test Address',
      }
      jest.spyOn(mockCounterpartyModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      jest.spyOn(mockCounterpartyModel, 'create').mockResolvedValue(mockCounterparty as any)
      const result = await service.create(createDto)
      expect(result).toEqual(mockCounterparty)
      expect(mockCounterpartyModel.findOne).toHaveBeenCalledWith({ name: createDto.name })
      expect(mockCounterpartyModel.create).toHaveBeenCalledWith(createDto)
    })
    it('should throw BadRequestException if counterparty with same name exists', async () => {
      const createDto: CreateCounterpartyDto = {
        name: 'Existing Counterparty',
        phone_number: '+7 (999) 987-65-43',
        address: 'Existing Address',
      }
      jest.spyOn(mockCounterpartyModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCounterparty),
      } as any)
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException)
    })
  })
  describe('update', () => {
    it('should update a counterparty', async () => {
      const updateDto: UpdateCounterpartyDto = {
        name: 'Updated Counterparty',
        phone_number: '+7 (999) 111-22-33',
      }
      jest.spyOn(mockCounterpartyModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      jest.spyOn(mockCounterpartyModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockCounterparty, ...updateDto }),
      } as any)
      const result = await service.update('counterparty-id-1', updateDto)
      expect(result).toEqual({ ...mockCounterparty, ...updateDto })
      expect(mockCounterpartyModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'counterparty-id-1',
        updateDto,
        { new: true }
      )
    })
    it('should throw NotFoundException if counterparty not found', async () => {
      const updateDto: UpdateCounterpartyDto = { name: 'Updated Name' }
      jest.spyOn(mockCounterpartyModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      jest.spyOn(mockCounterpartyModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException)
    })
    it('should throw BadRequestException if name conflicts with another counterparty', async () => {
      const updateDto: UpdateCounterpartyDto = { name: 'Conflicting Name' }
      const conflictingCounterparty = { ...mockCounterparty, id: 'different-id' }
      jest.spyOn(mockCounterpartyModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(conflictingCounterparty),
      } as any)
      await expect(service.update('counterparty-id-1', updateDto)).rejects.toThrow(BadRequestException)
    })
  })
  describe('archive', () => {
    it('should archive a counterparty', async () => {
      const saveSpy = jest.fn().mockResolvedValue({ ...mockCounterparty, isArchived: true })
      const counterpartyToArchive = { ...mockCounterparty, save: saveSpy }
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(counterpartyToArchive),
      } as any)
      const result = await service.archive('counterparty-id-1')
      expect(result).toEqual({ message: 'Контрагент перемещен в архив' })
      expect(counterpartyToArchive.isArchived).toBe(true)
      expect(saveSpy).toHaveBeenCalled()
    })
    it('should throw NotFoundException if counterparty not found', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      await expect(service.archive('non-existent-id')).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if counterparty is already archived', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockArchivedCounterparty),
      } as any)
      await expect(service.archive('counterparty-id-2')).rejects.toThrow(ForbiddenException)
    })
  })
  describe('unarchive', () => {
    it('should unarchive a counterparty', async () => {
      const saveSpy = jest.fn().mockResolvedValue({ ...mockArchivedCounterparty, isArchived: false })
      const counterpartyToUnarchive = { ...mockArchivedCounterparty, save: saveSpy }
      jest.spyOn(mockCounterpartyModel, 'findById').mockResolvedValue(counterpartyToUnarchive as any)
      const result = await service.unarchive('counterparty-id-2')
      expect(result).toEqual({ message: 'Контрагент восстановлен из архива' })
      expect(counterpartyToUnarchive.isArchived).toBe(false)
      expect(saveSpy).toHaveBeenCalled()
    })
    it('should throw NotFoundException if counterparty not found', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockResolvedValue(null)
      await expect(service.unarchive('non-existent-id')).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if counterparty is not archived', async () => {
      jest.spyOn(mockCounterpartyModel, 'findById').mockResolvedValue(mockCounterparty as any)
      await expect(service.unarchive('counterparty-id-1')).rejects.toThrow(ForbiddenException)
    })
  })
  describe('delete', () => {
    it('should delete a counterparty', async () => {
      jest.spyOn(mockCounterpartyModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCounterparty),
      } as any)
      const result = await service.delete('counterparty-id-1')
      expect(result).toEqual({ message: 'Контрагент успешно удалён' })
      expect(mockCounterpartyModel.findByIdAndDelete).toHaveBeenCalledWith('counterparty-id-1')
    })
    it('should throw NotFoundException if counterparty not found', async () => {
      jest.spyOn(mockCounterpartyModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)
      await expect(service.delete('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })
}) 
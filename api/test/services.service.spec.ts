/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ServicesService } from '../src/services/services.service'
import { getModelToken } from '@nestjs/mongoose'
import { Service, ServiceDocument } from '../src/schemas/service.schema'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import mongoose from 'mongoose'
import { Model } from 'mongoose'
import { Order } from '../src/schemas/order.schema'
import { Arrival } from '../src/schemas/arrival.schema'
import { Invoice } from '../src/schemas/invoice.schema'
import { LogsService } from '../src/services/logs.service'
describe('ServicesService', () => {
  let service: ServicesService
  let mockServiceModel: any
  let serviceModel: Model<ServiceDocument>
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockService = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Тестовая услуга',
    serviceCategory: new mongoose.Types.ObjectId(),
    price: 100,
    description: 'Описание тестовой услуги',
    type: 'внутренняя',
    isArchived: false,
    populate: jest.fn().mockImplementation(function () {
      return this
    }),
    save: jest.fn().mockImplementation(function () {
      return this
    }),
    set: jest.fn().mockImplementation(function (data) {
      Object.assign(this, data)
      return this
    }),
  }
  beforeEach(async () => {
    jest.clearAllMocks()
    mockServiceModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
      create: jest.fn(),
      exec: jest.fn(),
    }
    mockServiceModel.find.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    })
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getModelToken(Service.name),
          useValue: mockServiceModel,
        },
        {
          provide: getModelToken(Order.name),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken(Arrival.name),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getModelToken(Invoice.name),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: LogsService,
          useValue: {
            generateLogForCreate: jest.fn().mockReturnValue({
              user: 'user-id',
              action: 'создание',
              date: new Date(),
            }),
            trackChanges: jest.fn().mockReturnValue({
              user: 'user-id',
              action: 'обновление',
              date: new Date(),
              changes: []
            }),
            generateLogForArchive: jest.fn().mockReturnValue({
              user: 'user-id',
              action: 'архивация',
              date: new Date(),
            }),
          },
        },
      ],
    }).compile()
    service = module.get<ServicesService>(ServicesService)
    serviceModel = module.get<Model<ServiceDocument>>(getModelToken(Service.name))
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getAll', () => {
    it('should return all non-archived services', async () => {
      const services = [mockService]
      mockServiceModel.find().populate().exec.mockResolvedValue(services)
      const result = await service.getAll()
      expect(result).toEqual(services)
      expect(mockServiceModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(mockServiceModel.find().populate).toHaveBeenCalledWith('serviceCategory')
      expect(mockServiceModel.find().populate().exec).toHaveBeenCalled()
    })
  })
  describe('getAllArchived', () => {
    it('should return all archived services', async () => {
      const services = [{ ...mockService, isArchived: true }]
      mockServiceModel.find().populate().exec.mockResolvedValue(services)
      const result = await service.getAllArchived()
      expect(result).toEqual(services)
      expect(mockServiceModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(mockServiceModel.find().populate).toHaveBeenCalledWith('serviceCategory')
      expect(mockServiceModel.find().populate().exec).toHaveBeenCalled()
    })
  })
  describe('getAllByName', () => {
    it('should return all non-archived services filtered by name', async () => {
      const name = 'Тест'
      const services = [mockService]
      mockServiceModel.find().find().populate().exec.mockResolvedValue(services)
      const result = await service.getAllByName(name)
      expect(result).toEqual(services)
      expect(mockServiceModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(mockServiceModel.find().find).toHaveBeenCalledWith({ name: { $regex: name, $options: 'i' } })
      expect(mockServiceModel.find().find().populate).toHaveBeenCalledWith('serviceCategory')
      expect(mockServiceModel.find().find().populate().exec).toHaveBeenCalled()
    })
  })
  describe('getAllArchivedByName', () => {
    it('should return all archived services filtered by name', async () => {
      const name = 'Тест'
      const services = [{ ...mockService, isArchived: true }]
      mockServiceModel.find().find().populate().exec.mockResolvedValue(services)
      const result = await service.getAllArchivedByName(name)
      expect(result).toEqual(services)
      expect(mockServiceModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(mockServiceModel.find().find).toHaveBeenCalledWith({ name: { $regex: name, $options: 'i' } })
      expect(mockServiceModel.find().find().populate).toHaveBeenCalledWith('serviceCategory')
      expect(mockServiceModel.find().find().populate().exec).toHaveBeenCalled()
    })
  })
  describe('getById', () => {
    it('should return a service by id', async () => {
      mockServiceModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockService),
      })
      const result = await service.getById(mockService._id.toString())
      expect(result).toEqual(mockService)
      expect(mockServiceModel.findById).toHaveBeenCalledWith(mockService._id.toString())
    })
    it('should throw NotFoundException if service is not found', async () => {
      mockServiceModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(service.getById('nonexistentid')).rejects.toThrow(NotFoundException)
      expect(mockServiceModel.findById).toHaveBeenCalledWith('nonexistentid')
    })
    it('should throw ForbiddenException if service is archived', async () => {
      const archivedService = { ...mockService, isArchived: true }
      mockServiceModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(archivedService),
      })
      await expect(service.getById(mockService._id.toString())).rejects.toThrow(ForbiddenException)
      expect(mockServiceModel.findById).toHaveBeenCalledWith(mockService._id.toString())
    })
  })
  describe('getArchivedById', () => {
    it('should return an archived service by id', async () => {
      const archivedService = { ...mockService, isArchived: true }
      mockServiceModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(archivedService),
        }),
      })
      const result = await service.getArchivedById(mockService._id.toString())
      expect(result).toEqual(archivedService)
      expect(mockServiceModel.findById).toHaveBeenCalledWith(mockService._id.toString())
    })
    it('should throw NotFoundException if service is not found', async () => {
      mockServiceModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      })
      await expect(service.getArchivedById('nonexistentid')).rejects.toThrow(NotFoundException)
      expect(mockServiceModel.findById).toHaveBeenCalledWith('nonexistentid')
    })
    it('should throw ForbiddenException if service is not archived', async () => {
      mockServiceModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockService),
        }),
      })
      await expect(service.getArchivedById(mockService._id.toString())).rejects.toThrow(ForbiddenException)
      expect(mockServiceModel.findById).toHaveBeenCalledWith(mockService._id.toString())
    })
  })
  describe('create', () => {
    it('should create a service', async () => {
      const serviceDto = {
        name: 'New Service',
        description: 'New Description',
        price: 1000,
        type: 'внутренняя',
        serviceCategory: 'category-id-1',
      }
      jest
        .spyOn(serviceModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockService as any))
      const result = await service.create(serviceDto as any, mockUserId)
      expect(result).toEqual(mockService)
    })
  })
  describe('update', () => {
    it('should update a service', async () => {
      const updateDto = {
        name: 'Updated Service',
        description: 'Updated Description',
      }
      const mockServiceWithMethods = {
        ...mockService,
        set: jest.fn(),
        populate: jest.fn().mockReturnThis(),
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue(mockService),
        logs: []
      }
      jest.spyOn(serviceModel, 'findById').mockResolvedValueOnce(mockServiceWithMethods)
      const result = await service.update(mockService._id.toString(), updateDto as any, false, mockUserId)
      expect(mockServiceWithMethods.set).toHaveBeenCalledWith(updateDto)
      expect(mockServiceWithMethods.save).toHaveBeenCalled()
    })
    it('should throw NotFoundException if service not found', async () => {
      jest.spyOn(serviceModel, 'findById').mockResolvedValueOnce(null)
      await expect(service.update('nonexistentid', {}, false, mockUserId)).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if service is archived and force is false', async () => {
      jest
        .spyOn(serviceModel, 'findById')
        .mockResolvedValueOnce({ ...mockService, isArchived: true } as any)
      await expect(service.update(mockService._id.toString(), {}, false, mockUserId)).rejects.toThrow(ForbiddenException)
    })
    it('should update an archived service if force is true', async () => {
      const updateDto = {
        name: 'Updated Service',
        description: 'Updated Description',
      }
      const mockServiceWithMethods = {
        ...mockService,
        isArchived: true,
        set: jest.fn(),
        populate: jest.fn().mockReturnThis(),
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({...mockService, isArchived: true}),
        logs: []
      }
      jest
        .spyOn(serviceModel, 'findById')
        .mockResolvedValueOnce(mockServiceWithMethods)
      const result = await service.update(mockService._id.toString(), updateDto as any, true, mockUserId)
      expect(mockServiceWithMethods.set).toHaveBeenCalledWith(updateDto)
      expect(mockServiceWithMethods.save).toHaveBeenCalled()
    })
  })
  describe('isLocked', () => {
    it('should return true for any service', async () => {
      mockServiceModel.findById.mockResolvedValue(mockService)
      const result = await service.isLocked('service-id')
      expect(result).toBe(true)
      expect(mockServiceModel.findById).toHaveBeenCalledWith('service-id')
    })
    it('should throw NotFoundException when service not found', async () => {
      mockServiceModel.findById.mockResolvedValue(null)
      await expect(service.isLocked('non-existent-id'))
        .rejects.toThrow('Товар не найден')
    })
  })
  describe('isLockedService', () => {
    it('should return true when service has active arrivals', async () => {
      mockServiceModel.findById.mockResolvedValue(mockService)
      const arrivalModel = {
        exists: jest.fn().mockResolvedValue(true)
      }
      Object.defineProperty(service, 'arrivalModel', {
        value: arrivalModel,
        writable: true
      })
      const result = await service.isLockedService('service-id')
      expect(result).toBe(true)
    })
    it('should return true when service has active orders', async () => {
      mockServiceModel.findById.mockResolvedValue(mockService)
      const arrivalModel = {
        exists: jest.fn().mockResolvedValue(false)
      }
      const orderModel = {
        exists: jest.fn().mockResolvedValue(true)
      }
      Object.defineProperty(service, 'arrivalModel', {
        value: arrivalModel,
        writable: true
      })
      Object.defineProperty(service, 'orderModel', {
        value: orderModel,
        writable: true
      })
      const result = await service.isLockedService('service-id')
      expect(result).toBe(true)
    })
    it('should return true when service has active invoices', async () => {
      mockServiceModel.findById.mockResolvedValue(mockService)
      const arrivalModel = {
        exists: jest.fn().mockResolvedValue(false)
      }
      const orderModel = {
        exists: jest.fn().mockResolvedValue(false)
      }
      const invoiceModel = {
        exists: jest.fn().mockResolvedValue(true)
      }
      Object.defineProperty(service, 'arrivalModel', {
        value: arrivalModel,
        writable: true
      })
      Object.defineProperty(service, 'orderModel', {
        value: orderModel,
        writable: true
      })
      Object.defineProperty(service, 'invoiceModel', {
        value: invoiceModel,
        writable: true
      })
      const result = await service.isLockedService('service-id')
      expect(result).toBe(true)
    })
    it('should return false when service has no active relations', async () => {
      mockServiceModel.findById.mockResolvedValue(mockService)
      const arrivalModel = {
        exists: jest.fn().mockResolvedValue(false)
      }
      const orderModel = {
        exists: jest.fn().mockResolvedValue(false)
      }
      const invoiceModel = {
        exists: jest.fn().mockResolvedValue(false)
      }
      Object.defineProperty(service, 'arrivalModel', {
        value: arrivalModel,
        writable: true
      })
      Object.defineProperty(service, 'orderModel', {
        value: orderModel,
        writable: true
      })
      Object.defineProperty(service, 'invoiceModel', {
        value: invoiceModel,
        writable: true
      })
      const result = await service.isLockedService('service-id')
      expect(result).toBe(false)
    })
    it('should throw NotFoundException when service not found', async () => {
      mockServiceModel.findById.mockResolvedValue(null)
      await expect(service.isLockedService('non-existent-id'))
        .rejects.toThrow('Услуга не найдена')
    })
  })
  describe('archive', () => {
    it('should archive service successfully', async () => {
      const serviceToArchive = {
        ...mockService,
        isArchived: false,
        logs: [],
        save: jest.fn().mockResolvedValue(mockService)
      }
      mockServiceModel.findById.mockResolvedValue(serviceToArchive)
      jest.spyOn(service, 'isLockedService').mockResolvedValue(false)
      const result = await service.archive('service-id', mockUserId)
      expect(serviceToArchive.isArchived).toBe(true)
      expect(serviceToArchive.save).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Услуга перемещена в архив' })
    })
    it('should throw NotFoundException when service not found', async () => {
      mockServiceModel.findById.mockResolvedValue(null)
      await expect(service.archive('non-existent-id', mockUserId))
        .rejects.toThrow('Услуга не найдена')
    })
    it('should throw ForbiddenException when service already archived', async () => {
      const archivedService = { ...mockService, isArchived: true }
      mockServiceModel.findById.mockResolvedValue(archivedService)
      await expect(service.archive('service-id', mockUserId))
        .rejects.toThrow('Услуга уже в архиве')
    })
    it('should throw ForbiddenException when service is locked', async () => {
      const serviceToArchive = { ...mockService, isArchived: false }
      mockServiceModel.findById.mockResolvedValue(serviceToArchive)
      jest.spyOn(service, 'isLockedService').mockResolvedValue(true)
      await expect(service.archive('service-id', mockUserId))
        .rejects.toThrow('Невозможно заархивировать услугу, так как она используется в поставках, заказах или счетах')
    })
  })
  describe('unarchive', () => {
    it('should unarchive service successfully', async () => {
      const serviceToUnarchive = {
        ...mockService,
        isArchived: true,
        logs: [],
        save: jest.fn().mockResolvedValue(mockService)
      }
      mockServiceModel.findById.mockResolvedValue(serviceToUnarchive)
      const result = await service.unarchive('service-id', mockUserId)
      expect(serviceToUnarchive.isArchived).toBe(false)
      expect(serviceToUnarchive.save).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Услуга восстановлена из архива' })
    })
    it('should throw NotFoundException when service not found', async () => {
      mockServiceModel.findById.mockResolvedValue(null)
      await expect(service.unarchive('non-existent-id', mockUserId))
        .rejects.toThrow('Услуга не найдена')
    })
    it('should throw ForbiddenException when service not archived', async () => {
      const nonArchivedService = { ...mockService, isArchived: false }
      mockServiceModel.findById.mockResolvedValue(nonArchivedService)
      await expect(service.unarchive('service-id', mockUserId))
        .rejects.toThrow('Услуга не находится в архиве')
    })
  })
  describe('delete', () => {
    it('should delete service successfully', async () => {
      const serviceToDelete = {
        ...mockService,
        deleteOne: jest.fn().mockResolvedValue(true)
      }
      mockServiceModel.findById.mockResolvedValue(serviceToDelete)
      jest.spyOn(service, 'isLockedService').mockResolvedValue(false)
      const result = await service.delete('service-id')
      expect(serviceToDelete.deleteOne).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Услуга успешно удалёна' })
    })
    it('should throw NotFoundException when service not found', async () => {
      mockServiceModel.findById.mockResolvedValue(null)
      await expect(service.delete('non-existent-id'))
        .rejects.toThrow('Услуга не найдена')
    })
    it('should throw ForbiddenException when service is locked', async () => {
      const serviceToDelete = { ...mockService }
      mockServiceModel.findById.mockResolvedValue(serviceToDelete)
      jest.spyOn(service, 'isLockedService').mockResolvedValue(true)
      await expect(service.delete('service-id'))
        .rejects.toThrow('Невозможно удалить услугу, так как она используется в поставках, заказах или счетах')
    })
  })
})

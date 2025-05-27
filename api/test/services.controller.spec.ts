/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ServicesController } from '../src/controllers/services.controller'
import { ServicesService } from '../src/services/services.service'
import { CreateServiceDto } from '../src/dto/create-service.dto'
import { UpdateServiceDto } from '../src/dto/update-service.dto'
import mongoose from 'mongoose'
import { RolesGuard } from '../src/guards/roles.guard'
import { RequestWithUser } from '../src/types'
describe('ServicesController', () => {
  let controller: ServicesController
  let service: ServicesService
  const mockService = {
    getAll: jest.fn(),
    getAllByName: jest.fn(),
    getAllArchived: jest.fn(),
    getById: jest.fn(),
    getArchivedById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    delete: jest.fn(),
  }
  const mockRolesGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  }
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockReq = {
    user: {
      _id: mockUserId,
      email: 'test@example.com',
      role: 'admin'
    }
  } as RequestWithUser;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile()
    controller = module.get<ServicesController>(ServicesController)
    service = module.get<ServicesService>(ServicesService)
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('getAllServices', () => {
    it('should get all services when no name provided', async () => {
      const result = [{ name: 'Test Service' }]
      mockService.getAll.mockResolvedValue(result)
      expect(await controller.getAllServices()).toEqual(result)
      expect(mockService.getAll).toHaveBeenCalled()
      expect(mockService.getAllByName).not.toHaveBeenCalled()
    })
    it('should get services by name when name provided', async () => {
      const result = [{ name: 'Test Service' }]
      const name = 'Test'
      mockService.getAllByName.mockResolvedValue(result)
      expect(await controller.getAllServices(name)).toEqual(result)
      expect(mockService.getAllByName).toHaveBeenCalledWith(name)
      expect(mockService.getAll).not.toHaveBeenCalled()
    })
  })
  describe('getAllArchivedServices', () => {
    it('should get all archived services', async () => {
      const result = [{ name: 'Archived Service', isArchived: true }]
      mockService.getAllArchived.mockResolvedValue(result)
      expect(await controller.getAllArchivedServices()).toEqual(result)
      expect(mockService.getAllArchived).toHaveBeenCalled()
    })
  })
  describe('getServiceById', () => {
    it('should get service by id', async () => {
      const result = { name: 'Test Service', id: '123' }
      const id = '123'
      mockService.getById.mockResolvedValue(result)
      expect(await controller.getServiceById(id)).toEqual(result)
      expect(mockService.getById).toHaveBeenCalledWith(id)
    })
  })
  describe('getArchivedServiceById', () => {
    it('should get archived service by id', async () => {
      const result = { name: 'Archived Service', id: '123', isArchived: true }
      const id = '123'
      mockService.getArchivedById.mockResolvedValue(result)
      expect(await controller.getArchivedServiceById(id)).toEqual(result)
      expect(mockService.getArchivedById).toHaveBeenCalledWith(id)
    })
  })
  describe('createService', () => {
    it('should create a service', async () => {
      const dto: CreateServiceDto = {
        name: 'Test Service',
        serviceCategory: new mongoose.Types.ObjectId(),
        price: 100,
        description: 'Test Description',
        type: 'внутренняя',
      }
      const result = {
        _id: 'service-id',
        ...dto,
      }
      jest.spyOn(service, 'create').mockResolvedValue(result as any)
      expect(await controller.createService(dto, mockReq)).toEqual(result)
      expect(service.create).toHaveBeenCalledWith(dto, mockUserId)
    })
  })
  describe('updateService', () => {
    it('should update a service', async () => {
      const id = 'service-id'
      const dto: UpdateServiceDto = {
        name: 'Updated Service',
        price: 200,
      }
      const result = {
        _id: id,
        name: 'Updated Service',
        price: 200,
        serviceCategory: new mongoose.Types.ObjectId(),
        description: 'Test Description',
        type: 'внутренняя',
      }
      jest.spyOn(service, 'update').mockResolvedValue(result as any)
      expect(await controller.updateService(id, dto, mockReq)).toEqual(result)
      expect(service.update).toHaveBeenCalledWith(id, dto, false, mockUserId)
    })
  })
  describe('archiveService', () => {
    it('should archive a service', async () => {
      const id = 'service-id'
      const result = { message: 'Услуга перемещена в архив' }
      jest.spyOn(service, 'archive').mockResolvedValue(result)
      expect(await controller.archiveService(id, mockReq)).toEqual(result)
      expect(service.archive).toHaveBeenCalledWith(id, mockUserId)
    })
  })
  describe('deleteService', () => {
    it('should delete a service', async () => {
      const id = '123'
      const result = { message: 'Услуга успешно удалёна' }
      mockService.delete.mockResolvedValue(result)
      expect(await controller.deleteService(id)).toEqual(result)
      expect(mockService.delete).toHaveBeenCalledWith(id)
    })
  })
})

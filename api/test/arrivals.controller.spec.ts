/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ArrivalsController } from '../src/controllers/arrivals.controller'
import { ArrivalsService } from '../src/services/arrivals.service'
import { RolesGuard } from '../src/guards/roles.guard'
import { Readable } from 'stream'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import mongoose from 'mongoose'
import { RequestWithUser } from '../src/types'
class MockArrivalDocument {
  isArchived: boolean = false
  client: string
  stock: string
  arrival_status: string
  received_amount: any[] = []
  defects: any[] = []
  constructor(data: any = {}) {
    Object.assign(this, data)
  }
  populate(field: string) {
    return this
  }
}
describe('ArrivalsController', () => {
  let controller: ArrivalsController
  let service: ArrivalsService
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockReq = {
    user: {
      _id: mockUserId,
      email: 'test@example.com',
      role: 'admin'
    }
  } as RequestWithUser;
  const mockRolesGuard = {
    canActivate: jest.fn().mockImplementation(() => true),
  }
  const mockArrivalsService = {
    getAllByClient: jest.fn(),
    getAll: jest.fn(),
    getArchivedAll: jest.fn(),
    getOne: jest.fn(),
    getArchivedOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    delete: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArrivalsController],
      providers: [
        {
          provide: ArrivalsService,
          useValue: mockArrivalsService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile()
    controller = module.get<ArrivalsController>(ArrivalsController)
    service = module.get<ArrivalsService>(ArrivalsService)
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('getAllArrivals', () => {
    it('должен вызвать getAllByClient с clientId, если clientId указан', async () => {
      const clientId = 'client-id'
      const expectedArrivals = [new MockArrivalDocument({
        _id: 'arrival-id',
        client: clientId,
        stock: 'stock-id',
        arrival_status: 'pending',
      })]
      mockArrivalsService.getAllByClient.mockResolvedValue(expectedArrivals)
      const result = await controller.getAllArrivals(clientId, '1')
      expect(service.getAllByClient).toHaveBeenCalledWith(clientId, true)
      expect(result).toEqual(expectedArrivals)
    })
    it('должен вызвать getAll, если clientId не указан', async () => {
      const expectedArrivals = [new MockArrivalDocument({
        _id: 'arrival-id',
        client: 'client-id',
        stock: 'stock-id',
        arrival_status: 'pending',
      })]
      mockArrivalsService.getAll.mockResolvedValue(expectedArrivals)
      const result = await controller.getAllArrivals('', '1')
      expect(service.getAll).toHaveBeenCalledWith(true)
      expect(result).toEqual(expectedArrivals)
    })
    it('должен передать параметр populate как false, если он не равен "1"', async () => {
      const expectedArrivals = [new MockArrivalDocument()]
      mockArrivalsService.getAll.mockResolvedValue(expectedArrivals)
      await controller.getAllArrivals('', '0')
      expect(service.getAll).toHaveBeenCalledWith(false)
    })
  })
  describe('getAllArchivedArrivals', () => {
    it('должен вызвать getArchivedAll с правильными параметрами', async () => {
      const expectedArrivals = [new MockArrivalDocument({ isArchived: true })]
      mockArrivalsService.getArchivedAll.mockResolvedValue(expectedArrivals)
      const result = await controller.getAllArchivedArrivals('1')
      expect(service.getArchivedAll).toHaveBeenCalledWith(true)
      expect(result).toEqual(expectedArrivals)
    })
    it('должен передать параметр populate как false, если он не равен "1"', async () => {
      mockArrivalsService.getArchivedAll.mockResolvedValue([])
      await controller.getAllArchivedArrivals('0')
      expect(service.getArchivedAll).toHaveBeenCalledWith(false)
    })
  })
  describe('getOneArrival', () => {
    it('должен вызвать getOne с правильными параметрами', async () => {
      const arrivalId = 'arrival-id'
      const expectedArrival = new MockArrivalDocument({
        _id: arrivalId,
        client: 'client-id',
        stock: 'stock-id',
      })
      mockArrivalsService.getOne.mockResolvedValue(expectedArrival)
      const result = await controller.getOneArrival(arrivalId, '1')
      expect(service.getOne).toHaveBeenCalledWith(arrivalId, true)
      expect(result).toEqual(expectedArrival)
    })
    it('должен передать параметр populate как false, если он не равен "1"', async () => {
      const arrivalId = 'arrival-id'
      mockArrivalsService.getOne.mockResolvedValue(new MockArrivalDocument())
      await controller.getOneArrival(arrivalId, '0')
      expect(service.getOne).toHaveBeenCalledWith(arrivalId, false)
    })
  })
  describe('getOneArchivedArrival', () => {
    it('должен вызвать getArchivedOne с правильными параметрами', async () => {
      const arrivalId = 'arrival-id'
      const expectedArrival = new MockArrivalDocument({
        _id: arrivalId,
        isArchived: true,
      })
      mockArrivalsService.getArchivedOne.mockResolvedValue(expectedArrival)
      const result = await controller.getOneArchivedArrival(arrivalId, '1')
      expect(service.getArchivedOne).toHaveBeenCalledWith(arrivalId, true)
      expect(result).toEqual(expectedArrival)
    })
    it('должен передать параметр populate как false, если он не равен "1"', async () => {
      const arrivalId = 'arrival-id'
      mockArrivalsService.getArchivedOne.mockResolvedValue(new MockArrivalDocument())
      await controller.getOneArchivedArrival(arrivalId, '0')
      expect(service.getArchivedOne).toHaveBeenCalledWith(arrivalId, false)
    })
  })
  describe('createArrival', () => {
    it('should create an arrival', async () => {
      const files = [] as Express.Multer.File[]
      const arrivalDto = {
        client: new mongoose.Types.ObjectId(),
        products: [
          {
            product: new mongoose.Types.ObjectId(),
            quantity: 5,
          },
        ],
        services: [],
      }
      const mockArrival = {
        _id: 'arrival-id',
        arrivalNumber: 'ARR-001',
        ...arrivalDto,
      }
      mockArrivalsService.create.mockResolvedValue(mockArrival)
      const result = await controller.createArrival(arrivalDto as any, files, mockReq)
      expect(service.create).toHaveBeenCalledWith(arrivalDto, files, mockUserId)
      expect(result).toEqual(mockArrival)
    })
  })
  describe('updateArrival', () => {
    it('should update an arrival', async () => {
      const arrivalId = 'arrival-id'
      const files = [] as Express.Multer.File[]
      const updateDto = {
        client: new mongoose.Types.ObjectId(),
        products: [
          {
            product: new mongoose.Types.ObjectId(),
            quantity: 10,
          },
        ],
      }
      const updatedArrival = {
        _id: arrivalId,
        arrivalNumber: 'ARR-001',
        ...updateDto,
      }
      mockArrivalsService.update.mockResolvedValue(updatedArrival)
      const result = await controller.updateArrival(arrivalId, updateDto as any, files, mockReq)
      expect(service.update).toHaveBeenCalledWith(arrivalId, updateDto, files, mockUserId)
      expect(result).toEqual(updatedArrival)
    })
  })
  describe('archiveArrival', () => {
    it('should archive an arrival', async () => {
      const arrivalId = 'arrival-id'
      const archiveResult = { message: 'Приход перемещен в архив' }
      mockArrivalsService.archive.mockResolvedValue(archiveResult)
      const result = await controller.archiveArrival(arrivalId, mockReq)
      expect(service.archive).toHaveBeenCalledWith(arrivalId, mockUserId)
      expect(result).toEqual(archiveResult)
    })
  })
  describe('unarchiveArrival', () => {
    it('should unarchive an arrival', async () => {
      const arrivalId = 'arrival-id'
      const unarchiveResult = { message: 'Приход восстановлен из архива' }
      mockArrivalsService.unarchive.mockResolvedValue(unarchiveResult)
      const result = await controller.unarchiveArrival(arrivalId, mockReq)
      expect(service.unarchive).toHaveBeenCalledWith(arrivalId, mockUserId)
      expect(result).toEqual(unarchiveResult)
    })
  })
  describe('deleteArrival', () => {
    it('должен вызвать delete с правильными параметрами', async () => {
      const arrivalId = 'arrival-id'
      const deletedArrival = new MockArrivalDocument({
        _id: arrivalId,
      })
      mockArrivalsService.delete.mockResolvedValue(deletedArrival)
      const result = await controller.deleteArrival(arrivalId)
      expect(service.delete).toHaveBeenCalledWith(arrivalId)
      expect(result).toEqual(deletedArrival)
    })
  })
})

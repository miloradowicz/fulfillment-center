/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Model } from 'mongoose'
import { InvoicesService } from '../src/services/invoices.service'
import { Invoice, InvoiceDocument } from '../src/schemas/invoice.schema'
import { Service, ServiceDocument } from '../src/schemas/service.schema'
import { CounterService } from '../src/services/counter.service'
import { LogsService } from '../src/services/logs.service'
import mongoose from 'mongoose'
describe('InvoicesService', () => {
  let service: InvoicesService
  let invoiceModel: Model<InvoiceDocument>
  let serviceModel: Model<ServiceDocument>
  let counterService: CounterService
  let logsService: LogsService
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockInvoice = {
    _id: 'invoice-id-1',
    invoiceNumber: 'INV-1',
    client: 'client-id-1',
    services: [
      {
        service: 'service-id-1',
        service_price: 1000,
        service_amount: 2,
      },
    ],
    totalAmount: 2000,
    paid_amount: 0,
    discount: 0,
    status: 'в ожидании',
    isArchived: false,
    logs: [],
    save: jest.fn().mockResolvedValue(this),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  }
  const mockArchivedInvoice = {
    ...mockInvoice,
    _id: 'invoice-id-2',
    isArchived: true,
  }
  const mockService = {
    _id: 'service-id-1',
    name: 'Test Service',
    type: 'внутренняя',
    price: 1000,
  }
  const mockInvoiceModel = {
    find: jest.fn(),
    findById: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockInvoice),
    }),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }
  const mockServiceModel = {
    findById: jest.fn(),
  }
  const mockCounterService = {
    getNextSequence: jest.fn(),
  }
  const mockLogsService = {
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
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
        {
          provide: getModelToken(Service.name),
          useValue: mockServiceModel,
        },
        {
          provide: CounterService,
          useValue: mockCounterService,
        },
        {
          provide: LogsService,
          useValue: mockLogsService,
        },
      ],
    }).compile()
    service = module.get<InvoicesService>(InvoicesService)
    invoiceModel = module.get<Model<InvoiceDocument>>(getModelToken(Invoice.name))
    serviceModel = module.get<Model<ServiceDocument>>(getModelToken(Service.name))
    counterService = module.get<CounterService>(CounterService)
    logsService = module.get<LogsService>(LogsService)
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getAll', () => {
    it('should return all non-archived invoices', async () => {
      const invoices = [mockInvoice]
      jest.spyOn(mockInvoiceModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(invoices),
        }),
      } as any)
      const result = await service.getAll()
      expect(result).toEqual(invoices)
      expect(mockInvoiceModel.find).toHaveBeenCalledWith({ isArchived: false })
    })
  })
  const createPopulateChain = (result: any) => {
    const mockQuery = {
      populate: jest.fn().mockReturnThis()
    };
    let callCount = 0;
    mockQuery.populate = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount >= 6) { 
        return Promise.resolve(result);
      }
      return mockQuery; 
    });
    return mockQuery;
  };
  describe('getOne', () => {
    it('should return an invoice by id', async () => {
      const mockWithForbiddenCheck = {
        ...mockInvoice,
        isArchived: false
      };
      jest.spyOn(mockInvoiceModel, 'findById').mockReturnValue(createPopulateChain(mockWithForbiddenCheck) as any);
      const result = await service.getOne('invoice-id-1')
      expect(result).toEqual(mockWithForbiddenCheck)
    })
    it('should throw NotFoundException if invoice not found', async () => {
      jest.spyOn(mockInvoiceModel, 'findById').mockReturnValue(createPopulateChain(null) as any);
      await expect(service.getOne('non-existent-id')).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if invoice is archived', async () => {
      const mockWithForbiddenCheck = {
        ...mockInvoice,
        isArchived: true
      };
      jest.spyOn(mockInvoiceModel, 'findById').mockReturnValue(createPopulateChain(mockWithForbiddenCheck) as any);
      await expect(service.getOne('invoice-id-2')).rejects.toThrow(ForbiddenException)
    })
  })
  describe('getArchived', () => {
    it('should return all archived invoices', async () => {
      const invoices = [mockArchivedInvoice]
      jest.spyOn(mockInvoiceModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(invoices),
        }),
      } as any)
      const result = await service.getArchived()
      expect(result).toEqual(invoices)
      expect(mockInvoiceModel.find).toHaveBeenCalledWith({ isArchived: true })
    })
  })
  describe('getArchivedOne', () => {
    it('should return an archived invoice by id with populate=true', async () => {
      const mockWithArchivedCheck = {
        ...mockInvoice,
        isArchived: true
      };
      jest.spyOn(mockInvoiceModel, 'findById').mockReturnValue(createPopulateChain(mockWithArchivedCheck) as any);
      const result = await service.getArchivedOne('invoice-id-2', true)
      expect(result).toEqual(mockWithArchivedCheck)
    })
    it('should throw NotFoundException if invoice not found', async () => {
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue(null);
      await expect(service.getArchivedOne('non-existent-id', false)).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if invoice is not archived', async () => {
      const mockNonArchivedInvoice = {
        ...mockInvoice,
        isArchived: false
      };
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue(mockNonArchivedInvoice);
      await expect(service.getArchivedOne('invoice-id-1', false)).rejects.toThrow(ForbiddenException)
    })
  })
  describe('create', () => {
    it('should have a create method', () => {
      expect(service.create).toBeDefined()
    })
  })
  describe('update', () => {
    it('should have an update method', () => {
      expect(service.update).toBeDefined()
    })
    it('should throw NotFoundException if invoice not found', async () => {
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue(null)
      await expect(service.update('non-existent-id', {}, mockUserId)).rejects.toThrow(NotFoundException)
    })
  })
  describe('archive', () => {
    it('should archive an invoice', async () => {
      const saveSpy = jest.fn().mockResolvedValue({ ...mockInvoice, isArchived: true })
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue({
        ...mockInvoice,
        save: saveSpy,
      } as any)
      const result = await service.archive('invoice-id-1', mockUserId)
      expect(result).toEqual({ message: 'Счёт перемещён в архив.' })
      expect(saveSpy).toHaveBeenCalled()
    })
    it('should throw NotFoundException if invoice not found', async () => {
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue(null)
      await expect(service.archive('non-existent-id', mockUserId)).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if invoice is already archived', async () => {
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue(mockArchivedInvoice as any)
      await expect(service.archive('invoice-id-2', mockUserId)).rejects.toThrow(ForbiddenException)
    })
  })
  describe('delete', () => {
    it('should delete an invoice', async () => {
      jest.spyOn(mockInvoiceModel, 'findByIdAndDelete').mockResolvedValue(mockInvoice as any)
      const result = await service.delete('invoice-id-1')
      expect(result).toEqual({ message: 'Счёт успешно удалён.' })
    })
    it('should throw NotFoundException if invoice not found', async () => {
      jest.spyOn(mockInvoiceModel, 'findByIdAndDelete').mockResolvedValue(null)
      await expect(service.delete('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })
  describe('calculateTotalAmount', () => {
    it('should calculate total amount correctly', async () => {
      const services = [
        {
          service: 'service-id-1',
          service_amount: 2,
          service_price: 100,
          type: 'внутренняя' as const
        }
      ]
      jest.spyOn(mockServiceModel, 'findById').mockResolvedValue(mockService as any)
      const result = await (service as any).calculateTotalAmount(services, 10)
      expect(result).toBe(180) 
    })
    it('should handle external services without discount', async () => {
      const services = [
        {
          service: 'service-id-1',
          service_amount: 1,
          service_price: 200,
          type: 'внешняя' as const
        }
      ]
      jest.spyOn(mockServiceModel, 'findById').mockResolvedValue({
        ...mockService,
        type: 'внешняя'
      } as any)
      const result = await (service as any).calculateTotalAmount(services, 20)
      expect(result).toBe(200) 
    })
  })
  describe('determineStatus', () => {
    it('should return "оплачено" when fully paid', () => {
      const result = (service as any).determineStatus(1000, 1000)
      expect(result).toBe('оплачено')
    })
    it('should return "частично оплачено" when partially paid', () => {
      const result = (service as any).determineStatus(500, 1000)
      expect(result).toBe('частично оплачено')
    })
    it('should return "в ожидании" when not paid', () => {
      const result = (service as any).determineStatus(0, 1000)
      expect(result).toBe('в ожидании')
    })
  })
  describe('validate', () => {
    it('should not throw for valid data', () => {
      const validDto = {
        client: 'client-id',
        services: [
          {
            service: 'service-id',
            service_amount: 1,
            service_price: 100
          }
        ],
        associatedArrival: 'arrival-id' 
      }
      expect(() => (service as any).validate(validDto)).not.toThrow()
    })
  })
  describe('unarchive', () => {
    it('should unarchive an invoice', async () => {
      const saveSpy = jest.fn().mockResolvedValue({ ...mockArchivedInvoice, isArchived: false })
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue({
        ...mockArchivedInvoice,
        save: saveSpy,
      } as any)
      const result = await service.unarchive('invoice-id-2', mockUserId)
      expect(result).toEqual({ message: 'Счёт восстановлен из архива' })
      expect(saveSpy).toHaveBeenCalled()
    })
    it('should throw NotFoundException if invoice not found', async () => {
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue(null)
      await expect(service.unarchive('non-existent-id', mockUserId)).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if invoice is not archived', async () => {
      jest.spyOn(mockInvoiceModel, 'findById').mockResolvedValue(mockInvoice as any)
      await expect(service.unarchive('invoice-id-1', mockUserId)).rejects.toThrow(ForbiddenException)
    })
  })
})

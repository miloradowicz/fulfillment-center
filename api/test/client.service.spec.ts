/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ClientsService } from '../src/services/clients.service'
import { getModelToken } from '@nestjs/mongoose'
import { Client, ClientDocument } from '../src/schemas/client.schema'
import { Product } from 'src/schemas/product.schema'
import { Arrival } from 'src/schemas/arrival.schema'
import { ProductsService } from '../src/services/products.service'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { CreateClientDto } from '../src/dto/create-client.dto'
import { Order } from '../src/schemas/order.schema'
import { Invoice } from '../src/schemas/invoice.schema'
let mockClientModel: {
  findById: jest.Mock,
  find: jest.Mock,
  create: jest.Mock,
  deleteOne: jest.Mock,
  isLockedArchived:  jest.Mock,
  save?: jest.Mock
}
let mockArrivalModel: {
  findById: jest.Mock,
  find: jest.Mock,
  create: jest.Mock,
  updateMany: jest.Mock,
  exists: jest.Mock,
}
let mockProductModel: {
  find: jest.Mock,
  create: jest.Mock,
  updateMany: jest.Mock,
}
let mockProductsService: {
  isLocked: jest.Mock,
  getById: jest.Mock,
}
let mockOrderModel: {
  findById: jest.Mock,
  find: jest.Mock,
  create: jest.Mock,
  exists: jest.Mock,
  updateMany: jest.Mock,
  deleteMany: jest.Mock,
}
let mockInvoiceModel: {
  exists: jest.Mock,
  updateMany: jest.Mock,
  deleteMany: jest.Mock,
}
describe('ClientsService', () => {
  let service: ClientsService
  beforeEach(async () => {
    mockClientModel = {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
      isLockedArchived: jest.fn(),
      save: jest.fn(),
    }
    mockArrivalModel= {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      exists: jest.fn(),
    }
    mockProductModel = {
      find: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    }
    mockProductsService = {
      isLocked: jest.fn(),
      getById: jest.fn(),
    }
    mockOrderModel = {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      exists: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    }
    mockInvoiceModel = {
      exists: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getModelToken(Client.name),
          useValue: mockClientModel,
        },
        {
          provide: getModelToken(Arrival.name),
          useValue: mockArrivalModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
      ],
    }).compile()
    service = module.get<ClientsService>(ClientsService)
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  it('should create a client successfully', async () => {
    const createClientDto: CreateClientDto = {
      name: 'John Doe',
      phone_number: '+1234567890',
      email: 'client@example.com',
      inn: '1234567890',
      address: 'sdg',
      ogrn: 'sdfs',
      banking_data: 'sdf',
    }
    mockClientModel.create.mockResolvedValue(createClientDto)
    const result = await service.create(createClientDto)
    expect(result).toEqual(createClientDto)
    expect(mockClientModel.create).toHaveBeenCalledWith(createClientDto)
  })
  it('should throw NotFoundException if client is not found', async () => {
    const clientId = '12345'
    mockClientModel.findById.mockResolvedValue(null)
    await expect(service.getById(clientId)).rejects.toThrow(NotFoundException)
  })
  it('should return a client by id', async () => {
    const clientId = '12345'
    const client: ClientDocument = {
      _id: clientId,
      name: 'John Doe',
      phone_number: '+1234567890',
      email: 'client@example.com',
      inn: '1234567890',
      isArchived: false,
    } as ClientDocument
    mockClientModel.findById.mockResolvedValue(client)
    const result = await service.getById(clientId)
    expect(result).toEqual(client)
  })
  it('should throw ForbiddenException if client is archived', async () => {
    const clientId = '12345'
    const client: ClientDocument = {
      _id: clientId,
      name: 'John Doe',
      phone_number: '+1234567890',
      email: 'client@example.com',
      inn: '1234567890',
      isArchived: true,
    } as ClientDocument
    mockClientModel.findById.mockResolvedValue(client)
    await expect(service.getById(clientId)).rejects.toThrow(ForbiddenException)
  })
  describe('archive', () => {
    it('should throw ForbiddenException for active products', async () => {
      const clientId = '12345'
      mockClientModel.findById.mockResolvedValue({
        _id: clientId,
        isArchived: false,
      })
      mockProductModel.find.mockResolvedValue([{ _id: 'prod1' }])
      mockArrivalModel.exists.mockResolvedValue(true)
      await expect(service.archive(clientId)).rejects.toThrow(
        new ForbiddenException(
          'Клиент не может быть перемещен в архив, поскольку его товары используются в неархивированных поставках и/или заказах.'
        )
      )
    })
    it('should throw ForbiddenException for unpaid invoices', async () => {
      const clientId = '12345'
      mockClientModel.findById.mockResolvedValue({
        _id: clientId,
        isArchived: false,
      })
      mockProductModel.find.mockResolvedValue([])
      mockInvoiceModel.exists.mockResolvedValue(true)
      await expect(service.archive(clientId)).rejects.toThrow(
        new ForbiddenException(
          'Клиент не может быть перемещен в архив, так как у него есть неоплаченные счета.'
        )
      )
    })
    it('should successfully archive client', async () => {
      const clientId = '12345'
      const client = {
        _id: clientId,
        isArchived: false,
        save: mockClientModel.save,
      }
      mockClientModel.findById.mockResolvedValue(client)
      mockProductModel.find.mockResolvedValue([])
      mockInvoiceModel.exists.mockResolvedValue(false)
      const result = await service.archive(clientId)
      expect(result).toEqual({
        message: 'Клиент и все его товары, поставки, заказы и счета перемещены в архив',
      })
      expect(mockClientModel.save).toHaveBeenCalled()
    })
  })
  it('should throw ForbiddenException if trying to delete a locked client', async () => {
    const clientId = '12345'
    const client: ClientDocument = {
      _id: clientId,
      isArchived: false,
    } as ClientDocument
    mockClientModel.findById.mockResolvedValue(client)
    mockProductModel.find.mockResolvedValue([{ _id: 'prod1' }])
    mockProductsService.isLocked.mockResolvedValue(true)
    await expect(service.delete(clientId)).rejects.toThrow(ForbiddenException)
  })
  it('should throw NotFoundException if client not found for update', async () => {
    const clientId = '12345'
    const updateClientDto = { name: 'Updated Client' }
    mockClientModel.findById.mockResolvedValue(null)
    await expect(service.update(clientId, updateClientDto)).rejects.toThrow(NotFoundException)
  })
  describe('getArchivedById', () => {
    it('should throw NotFoundException if client is not found', async () => {
      const clientId = '12345'
      mockClientModel.findById.mockResolvedValue(null)
      await expect(service.getArchivedById(clientId)).rejects.toThrow(NotFoundException)
    })
    it('should throw ForbiddenException if client is not archived', async () => {
      const clientId = '12345'
      const client = { _id: clientId, isArchived: false }
      mockClientModel.findById.mockResolvedValue(client)
      await expect(service.getArchivedById(clientId)).rejects.toThrow(ForbiddenException)
    })
    it('should return archived client', async () => {
      const clientId = '12345'
      const client = { _id: clientId, isArchived: true }
      mockClientModel.findById.mockResolvedValue(client)
      const result = await service.getArchivedById(clientId)
      expect(result).toEqual(client)
    })
  })
  describe('isLocked', () => {
    it('should throw NotFoundException if client is not found', async () => {
      const clientId = '12345'
      mockClientModel.findById.mockResolvedValue(null)
      await expect(service.isLocked(clientId)).rejects.toThrow(NotFoundException)
    })
    it('should return false if client has no products', async () => {
      const clientId = '12345'
      const client = { _id: clientId }
      mockClientModel.findById.mockResolvedValue(client)
      mockProductModel.find.mockResolvedValue([])
      const result = await service.isLocked(clientId)
      expect(result).toBe(false)
    })
    it('should return true if any product is locked', async () => {
      const clientId = '12345'
      const client = { _id: clientId }
      mockClientModel.findById.mockResolvedValue(client)
      mockProductModel.find.mockResolvedValue([{ _id: 'prod1' }])
      mockProductsService.isLocked.mockResolvedValue(true)
      const result = await service.isLocked(clientId)
      expect(result).toBe(true)
    })
  })
  describe('isLockedArchived', () => {
    it('should throw NotFoundException if client is not found', async () => {
      const clientId = '12345'
      mockClientModel.findById.mockResolvedValue(null)
      await expect(service.isLockedArchived(clientId)).rejects.toThrow(NotFoundException)
    })
    it('should return false if client has no products', async () => {
      const clientId = '12345'
      const client = { _id: clientId }
      mockClientModel.findById.mockResolvedValue(client)
      mockProductModel.find.mockResolvedValue([])
      const result = await service.isLockedArchived(clientId)
      expect(result).toBe(false)
    })
    it('should return true if has active arrivals', async () => {
      const clientId = '12345'
      const client = { _id: clientId }
      mockClientModel.findById.mockResolvedValue(client)
      mockProductModel.find.mockResolvedValue([{ _id: 'prod1' }])
      mockArrivalModel.exists.mockResolvedValue(true)
      const result = await service.isLockedArchived(clientId)
      expect(result).toBe(true)
    })
    it('should return true if has active orders', async () => {
      const clientId = '12345'
      const client = { _id: clientId }
      mockClientModel.findById.mockResolvedValue(client)
      mockProductModel.find.mockResolvedValue([{ _id: 'prod1' }])
      mockArrivalModel.exists.mockResolvedValue(false)
      mockOrderModel.exists.mockResolvedValue(true)
      const result = await service.isLockedArchived(clientId)
      expect(result).toBe(true)
    })
    it('should return false if no active arrivals or orders', async () => {
      const clientId = '12345'
      const client = { _id: clientId }
      mockClientModel.findById.mockResolvedValue(client)
      mockProductModel.find.mockResolvedValue([{ _id: 'prod1' }])
      mockArrivalModel.exists.mockResolvedValue(false)
      mockOrderModel.exists.mockResolvedValue(false)
      const result = await service.isLockedArchived(clientId)
      expect(result).toBe(false)
    })
  })
  describe('getAllArchived', () => {
    it('should return archived clients in reverse order', async () => {
      const clients = [{ _id: '1', isArchived: true }, { _id: '2', isArchived: true }]
      const mockExec = jest.fn().mockResolvedValue(clients)
      mockClientModel.find.mockReturnValue({ exec: mockExec })
      const result = await service.getAllArchived()
      expect(mockClientModel.find).toHaveBeenCalledWith({ isArchived: true })
      expect(result).toEqual(clients.reverse())
    })
  })
  describe('getAll', () => {
    it('should return non-archived clients in reverse order', async () => {
      const clients = [{ _id: '1', isArchived: false }, { _id: '2', isArchived: false }]
      const mockExec = jest.fn().mockResolvedValue(clients)
      mockClientModel.find.mockReturnValue({ exec: mockExec })
      const result = await service.getAll()
      expect(mockClientModel.find).toHaveBeenCalledWith({ isArchived: false })
      expect(result).toEqual(clients.reverse())
    })
  })
  describe('update', () => {
    it('should update client successfully', async () => {
      const clientId = '12345'
      const updateDto = { name: 'Updated Name' }
      const client = {
        _id: clientId,
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      }
      mockClientModel.findById.mockResolvedValue(client)
      const result = await service.update(clientId, updateDto)
      expect(client.set).toHaveBeenCalledWith(updateDto)
      expect(client.save).toHaveBeenCalled()
      expect(result).toEqual(client)
    })
  })
})

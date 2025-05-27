/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ServiceCategoriesController } from '../src/controllers/service-categories.controller'
import { ServiceCategoriesService } from '../src/services/service-categories.service'
import { CreateServiceCategoryDto } from '../src/dto/create-service-category.dto'
import { UpdateServiceCategoryDto } from '../src/dto/update-service-category.dto'
import { RequestWithUser } from '../src/types'
import mongoose from 'mongoose'
describe('ServiceCategoriesController', () => {
  let controller: ServiceCategoriesController
  let serviceCategoriesService: ServiceCategoriesService
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockUser = {
    _id: mockUserId,
    name: 'Test User',
    role: 'admin',
  }
  const mockServiceCategory = {
    _id: 'category-id-1',
    name: 'Test Category',
    isArchived: false,
  }
  const mockServiceCategoriesService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getAllArchived: jest.fn(),
    getById: jest.fn(),
    getArchivedById: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    delete: jest.fn(),
  }
  const mockRolesService = {
    hasRole: jest.fn().mockReturnValue(true),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceCategoriesController],
      providers: [
        {
          provide: ServiceCategoriesService,
          useValue: mockServiceCategoriesService,
        },
        {
          provide: 'RolesService',
          useValue: mockRolesService,
        },
      ],
    })
      .overrideGuard(require('../src/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()
    controller = module.get<ServiceCategoriesController>(ServiceCategoriesController)
    serviceCategoriesService = module.get<ServiceCategoriesService>(ServiceCategoriesService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('createServiceCategory', () => {
    it('should create a service category', async () => {
      const createDto: CreateServiceCategoryDto = {
        name: 'New Category',
      }
      jest.spyOn(mockServiceCategoriesService, 'create').mockResolvedValue(mockServiceCategory)
      const result = await controller.createServiceCategory(createDto)
      expect(result).toEqual(mockServiceCategory)
      expect(mockServiceCategoriesService.create).toHaveBeenCalledWith(createDto)
    })
  })
  describe('getAllServiceCategories', () => {
    it('should get all service categories', async () => {
      const categories = [mockServiceCategory]
      jest.spyOn(mockServiceCategoriesService, 'getAll').mockResolvedValue(categories)
      const result = await controller.getAllServiceCategories()
      expect(result).toEqual(categories)
      expect(mockServiceCategoriesService.getAll).toHaveBeenCalled()
    })
  })
  describe('getServiceCategoryById', () => {
    it('should get a service category by id', async () => {
      jest.spyOn(mockServiceCategoriesService, 'getById').mockResolvedValue(mockServiceCategory)
      const result = await controller.getServiceCategoryById('category-id-1')
      expect(result).toEqual(mockServiceCategory)
      expect(mockServiceCategoriesService.getById).toHaveBeenCalledWith('category-id-1')
    })
  })
  describe('updateCounterparty', () => {
    it('should update a service category', async () => {
      const updateDto: UpdateServiceCategoryDto = {
        name: 'Updated Category',
      }
      const updatedCategory = { ...mockServiceCategory, ...updateDto }
      jest.spyOn(mockServiceCategoriesService, 'update').mockResolvedValue(updatedCategory)
      const result = await controller.updateCounterparty('category-id-1', updateDto)
      expect(result).toEqual(updatedCategory)
      expect(mockServiceCategoriesService.update).toHaveBeenCalledWith('category-id-1', updateDto)
    })
  })
  describe('archiveServiceCategory', () => {
    it('should archive a service category', async () => {
      const archiveResult = { message: 'Category archived successfully' }
      jest.spyOn(mockServiceCategoriesService, 'archive').mockResolvedValue(archiveResult)
      const result = await controller.archiveServiceCategory('category-id-1')
      expect(result).toEqual(archiveResult)
      expect(mockServiceCategoriesService.archive).toHaveBeenCalledWith('category-id-1')
    })
  })
  describe('deleteServiceCategory', () => {
    it('should delete a service category', async () => {
      const deleteResult = { message: 'Category deleted successfully' }
      jest.spyOn(mockServiceCategoriesService, 'delete').mockResolvedValue(deleteResult)
      const result = await controller.deleteServiceCategory('category-id-1')
      expect(result).toEqual(deleteResult)
      expect(mockServiceCategoriesService.delete).toHaveBeenCalledWith('category-id-1')
    })
  })
}) 
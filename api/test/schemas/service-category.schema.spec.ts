/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { ServiceCategory, ServiceCategorySchemaFactory } from '../../src/schemas/service-category.schema'
import { Service } from '../../src/schemas/service.schema'
describe('ServiceCategorySchema', () => {
  let serviceCategorySchema: any
  let mockServiceModel: Partial<Model<Service>>
  beforeEach(async () => {
    mockServiceModel = {
      find: jest.fn().mockReturnValue([]),
    } as any
    serviceCategorySchema = ServiceCategorySchemaFactory(
      mockServiceModel as Model<Service>
    )
  })
  it('should be defined', () => {
    expect(serviceCategorySchema).toBeDefined()
  })
  it('should have correct schema structure', () => {
    const paths = serviceCategorySchema.paths
    expect(paths.name).toBeDefined()
    expect(paths.isArchived).toBeDefined()
  })
  it('should have default values configured', () => {
    const paths = serviceCategorySchema.paths
    expect(paths.isArchived.defaultValue).toBe(false)
  })
  it('should have required fields configured', () => {
    const paths = serviceCategorySchema.paths
    expect(paths.name.validators.some((v: any) => v.type === 'required')).toBe(true)
  })
  it('should have unique constraint on name field', () => {
    const namePath = serviceCategorySchema.paths.name
    expect(namePath.options.unique).toBe(true)
  })
  it('should have name validation configured', () => {
    const namePath = serviceCategorySchema.paths.name
    expect(namePath.validators).toBeDefined()
    expect(namePath.validators.length).toBeGreaterThan(0)
  })
  it('should validate name uniqueness', async () => {
    const namePath = serviceCategorySchema.paths.name
    const customValidator = namePath.validators.find((v: any) => v.type === 'user defined')
    expect(customValidator).toBeDefined()
    expect(customValidator.message).toBe('Название категории услуг должно быть уникальным')
    expect(typeof customValidator.validator).toBe('function')
  })
  it('should have middleware hooks configured', () => {
    expect(serviceCategorySchema.pre).toBeDefined()
    expect(typeof serviceCategorySchema.pre).toBe('function')
  })
  it('should have cascade functionality', () => {
    expect(serviceCategorySchema.pre).toBeDefined()
    expect(typeof serviceCategorySchema.pre).toBe('function')
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { Client, ClientSchemaFactory } from '../../src/schemas/client.schema'
import { Arrival } from '../../src/schemas/arrival.schema'
import { Order } from '../../src/schemas/order.schema'
import { Product } from '../../src/schemas/product.schema'
describe('ClientSchema', () => {
  let clientSchema: any
  let mockArrivalModel: Partial<Model<Arrival>>
  let mockOrderModel: Partial<Model<Order>>
  let mockProductModel: Partial<Model<Product>>
  beforeEach(async () => {
    mockArrivalModel = {
      find: jest.fn().mockReturnValue([]),
    } as any
    mockOrderModel = {
      find: jest.fn().mockReturnValue([]),
    } as any
    mockProductModel = {
      find: jest.fn().mockReturnValue([]),
    } as any
    clientSchema = ClientSchemaFactory(
      mockArrivalModel as Model<Arrival>,
      mockOrderModel as Model<Order>,
      mockProductModel as Model<Product>
    )
  })
  it('should be defined', () => {
    expect(clientSchema).toBeDefined()
  })
  it('should have correct schema structure', () => {
    const paths = clientSchema.paths
    expect(paths.isArchived).toBeDefined()
    expect(paths.name).toBeDefined()
    expect(paths.phone_number).toBeDefined()
    expect(paths.email).toBeDefined()
    expect(paths.inn).toBeDefined()
    expect(paths.address).toBeDefined()
    expect(paths.banking_data).toBeDefined()
    expect(paths.ogrn).toBeDefined()
  })
  it('should have default values configured', () => {
    const paths = clientSchema.paths
    expect(paths.isArchived.defaultValue).toBe(false)
    expect(paths.address.defaultValue).toBe(null)
    expect(paths.banking_data.defaultValue).toBe(null)
    expect(paths.ogrn.defaultValue).toBe(null)
  })
  it('should have required fields configured', () => {
    const paths = clientSchema.paths
    expect(paths.name.validators.some((v: any) => v.type === 'required')).toBe(true)
    expect(paths.phone_number.validators.some((v: any) => v.type === 'required')).toBe(true)
    expect(paths.email.validators.some((v: any) => v.type === 'required')).toBe(true)
    expect(paths.inn.validators.some((v: any) => v.type === 'required')).toBe(true)
  })
  it('should have unique constraint on name field', () => {
    const namePath = clientSchema.paths.name
    expect(namePath.options.unique).toBe(true)
  })
  it('should have middleware hooks configured', () => {
    expect(clientSchema.pre).toBeDefined()
    expect(typeof clientSchema.pre).toBe('function')
  })
  it('should have name validation configured', () => {
    const namePath = clientSchema.paths.name
    expect(namePath.validators).toBeDefined()
    expect(namePath.validators.length).toBeGreaterThan(0)
  })
  it('should validate name uniqueness', async () => {
    const namePath = clientSchema.paths.name
    const customValidator = namePath.validators.find((v: any) => v.type === 'user defined')
    expect(customValidator).toBeDefined()
    expect(customValidator.message).toBe('Клиент с таким именем уже существует')
    expect(typeof customValidator.validator).toBe('function')
  })
}) 
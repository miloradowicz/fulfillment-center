/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Arrival, ArrivalSchemaFactory } from '../../src/schemas/arrival.schema'
import { Task } from '../../src/schemas/task.schema'
describe('ArrivalSchema', () => {
  let arrivalSchema: any
  let mockTaskModel: Partial<Model<Task>>
  beforeEach(async () => {
    mockTaskModel = {
      find: jest.fn().mockReturnValue({
        map: jest.fn().mockReturnValue([])
      }),
    } as any
    arrivalSchema = ArrivalSchemaFactory(mockTaskModel as Model<Task>)
  })
  it('should be defined', () => {
    expect(arrivalSchema).toBeDefined()
  })
  it('should have virtual invoice field', () => {
    expect(arrivalSchema.virtuals['invoice']).toBeDefined()
  })
  it('should have correct schema structure', () => {
    const paths = arrivalSchema.paths
    expect(paths.isArchived).toBeDefined()
    expect(paths.arrivalNumber).toBeDefined()
    expect(paths.client).toBeDefined()
    expect(paths.products).toBeDefined()
    expect(paths.arrival_status).toBeDefined()
    expect(paths.arrival_date).toBeDefined()
    expect(paths.stock).toBeDefined()
  })
  it('should have default values configured', () => {
    const paths = arrivalSchema.paths
    expect(paths.isArchived.defaultValue).toBe(false)
    expect(paths.arrival_status.defaultValue).toBe('ожидается доставка')
    expect(typeof paths.logs.defaultValue).toBe('function')
    expect(typeof paths.defects.defaultValue).toBe('function')
    expect(typeof paths.received_amount.defaultValue).toBe('function')
    expect(typeof paths.services.defaultValue).toBe('function')
  })
  it('should have required fields configured', () => {
    const paths = arrivalSchema.paths
    expect(paths.client.isRequired).toBe(true)
    expect(paths.products.isRequired).toBe(true)
    expect(paths.arrival_date.isRequired).toBe(true)
    expect(paths.stock.isRequired).toBe(true)
    expect(paths.arrivalNumber.options.unique).toBe(true)
  })
  it('should have enum values for arrival_status', () => {
    const arrivalStatusPath = arrivalSchema.paths.arrival_status
    expect(arrivalStatusPath.enumValues).toContain('ожидается доставка')
    expect(arrivalStatusPath.enumValues).toContain('получена')
    expect(arrivalStatusPath.enumValues).toContain('отсортирована')
  })
  it('should have middleware hooks configured', () => {
    expect(arrivalSchema.pre).toBeDefined()
    expect(typeof arrivalSchema.pre).toBe('function')
  })
}) 
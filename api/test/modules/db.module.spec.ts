/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { DbModule } from '../../src/modules/db.module'
jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockMongooseRootModule {},
      providers: [],
      exports: []
    }),
    forFeature: jest.fn().mockReturnValue({
      module: class MockMongooseFeatureModule {},
      providers: [],
      exports: []
    }),
    forFeatureAsync: jest.fn().mockReturnValue({
      module: class MockMongooseFeatureAsyncModule {},
      providers: [],
      exports: []
    })
  },
  getModelToken: jest.fn().mockImplementation((name) => `${name}Model`)
}))
jest.mock('../../src/config', () => ({
  default: {
    mongo: {
      host: 'mongodb://localhost:27017',
      username: 'test',
      password: 'test',
      db: 'test'
    }
  }
}))
jest.mock('../../src/schemas/arrival.schema', () => ({
  Arrival: { name: 'Arrival' },
  ArrivalSchemaFactory: jest.fn()
}))
jest.mock('../../src/schemas/client.schema', () => ({
  Client: { name: 'Client' },
  ClientSchemaFactory: jest.fn()
}))
jest.mock('../../src/schemas/product.schema', () => ({
  Product: { name: 'Product' },
  ProductSchema: {}
}))
jest.mock('../../src/schemas/order.schema', () => ({
  Order: { name: 'Order' },
  OrderSchemaFactory: jest.fn()
}))
jest.mock('../../src/schemas/user.schema', () => ({
  User: { name: 'User' },
  UserSchemaFactory: jest.fn()
}))
jest.mock('../../src/schemas/task.schema', () => ({
  Task: { name: 'Task' },
  TaskSchema: {}
}))
jest.mock('../../src/schemas/service.schema', () => ({
  Service: { name: 'Service' },
  ServiceSchema: {}
}))
jest.mock('../../src/schemas/stock.schema', () => ({
  Stock: { name: 'Stock' },
  StockSchema: {}
}))
jest.mock('../../src/schemas/counter.schema', () => ({
  Counter: { name: 'Counter' },
  CounterSchema: {}
}))
jest.mock('../../src/schemas/counterparty.schema', () => ({
  Counterparty: { name: 'Counterparty' },
  CounterpartySchema: {}
}))
jest.mock('../../src/schemas/service-category.schema', () => ({
  ServiceCategory: { name: 'ServiceCategory' },
  ServiceCategorySchemaFactory: jest.fn()
}))
jest.mock('../../src/schemas/invoice.schema', () => ({
  Invoice: { name: 'Invoice' },
  InvoiceSchema: {}
}))
describe('DbModule', () => {
  it('должен быть определен', () => {
    expect(DbModule).toBeDefined()
  })
  it('должен быть классом', () => {
    expect(typeof DbModule).toBe('function')
  })
  it('должен иметь декоратор @Module', () => {
    expect(Reflect.getMetadata('imports', DbModule)).toBeDefined()
  })
}) 
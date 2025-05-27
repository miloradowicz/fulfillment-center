/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { OrdersModule } from '../../src/modules/orders.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ValidatorsModule } from '../../src/modules/validators.module'
import { FilesModule } from '../../src/modules/file-upload.module'
import { OrdersController } from '../../src/controllers/orders.controller'
import { OrdersService } from '../../src/services/orders.service'
import { CounterService } from '../../src/services/counter.service'
import { StockManipulationService } from '../../src/services/stock-manipulation.service'
import { LogsService } from '../../src/services/logs.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../../src/modules/validators.module', () => ({
  ValidatorsModule: class MockValidatorsModule {}
}))
jest.mock('../../src/modules/file-upload.module', () => ({
  FilesModule: class MockFilesModule {}
}))
jest.mock('../../src/controllers/orders.controller', () => ({
  OrdersController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/orders.service', () => ({
  OrdersService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/counter.service', () => ({
  CounterService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/stock-manipulation.service', () => ({
  StockManipulationService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('OrdersModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [OrdersModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(ValidatorsModule)
    .useModule(class MockValidatorsModule {})
    .overrideModule(FilesModule)
    .useModule(class MockFilesModule {})
    .overrideProvider(OrdersController)
    .useValue({})
    .overrideProvider(OrdersService)
    .useValue({})
    .overrideProvider(CounterService)
    .useValue({})
    .overrideProvider(StockManipulationService)
    .useValue({})
    .overrideProvider(LogsService)
    .useValue({})
    .compile()
  })
  afterEach(async () => {
    await module.close()
  })
  it('должен быть определен', () => {
    expect(module).toBeDefined()
  })
  it('должен успешно компилироваться', () => {
    expect(module.get(OrdersModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const ordersModule = module.get(OrdersModule)
    expect(ordersModule).toBeInstanceOf(OrdersModule)
  })
  it('должен предоставлять OrdersController', () => {
    const ordersController = module.get(OrdersController)
    expect(ordersController).toBeDefined()
  })
  it('должен предоставлять OrdersService', () => {
    const ordersService = module.get(OrdersService)
    expect(ordersService).toBeDefined()
  })
  it('должен предоставлять CounterService', () => {
    const counterService = module.get(CounterService)
    expect(counterService).toBeDefined()
  })
  it('должен предоставлять StockManipulationService', () => {
    const stockManipulationService = module.get(StockManipulationService)
    expect(stockManipulationService).toBeDefined()
  })
  it('должен предоставлять LogsService', () => {
    const logsService = module.get(LogsService)
    expect(logsService).toBeDefined()
  })
}) 
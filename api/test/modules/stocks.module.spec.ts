/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { StocksModule } from '../../src/modules/stocks.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ValidatorsModule } from '../../src/modules/validators.module'
import { StocksController } from '../../src/controllers/stocks.controller'
import { StocksService } from '../../src/services/stocks.service'
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
jest.mock('../../src/controllers/stocks.controller', () => ({
  StocksController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/stocks.service', () => ({
  StocksService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/stock-manipulation.service', () => ({
  StockManipulationService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('StocksModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [StocksModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(ValidatorsModule)
    .useModule(class MockValidatorsModule {})
    .overrideProvider(StocksController)
    .useValue({})
    .overrideProvider(StocksService)
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
    expect(module.get(StocksModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const stocksModule = module.get(StocksModule)
    expect(stocksModule).toBeInstanceOf(StocksModule)
  })
  it('должен предоставлять StocksController', () => {
    const stocksController = module.get(StocksController)
    expect(stocksController).toBeDefined()
  })
  it('должен предоставлять StocksService', () => {
    const stocksService = module.get(StocksService)
    expect(stocksService).toBeDefined()
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
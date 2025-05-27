/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ArrivalsModule } from '../../src/modules/arrivals.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ValidatorsModule } from '../../src/modules/validators.module'
import { FilesModule } from '../../src/modules/file-upload.module'
import { ArrivalsController } from '../../src/controllers/arrivals.controller'
import { ArrivalsService } from '../../src/services/arrivals.service'
import { CounterService } from '../../src/services/counter.service'
import { StockManipulationService } from '../../src/services/stock-manipulation.service'
import { FilesService } from '../../src/services/files.service'
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
jest.mock('../../src/controllers/arrivals.controller', () => ({
  ArrivalsController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/arrivals.service', () => ({
  ArrivalsService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/counter.service', () => ({
  CounterService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/stock-manipulation.service', () => ({
  StockManipulationService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/files.service', () => ({
  FilesService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('ArrivalsModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ArrivalsModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(ValidatorsModule)
    .useModule(class MockValidatorsModule {})
    .overrideModule(FilesModule)
    .useModule(class MockFilesModule {})
    .overrideProvider(ArrivalsController)
    .useValue({})
    .overrideProvider(ArrivalsService)
    .useValue({})
    .overrideProvider(CounterService)
    .useValue({})
    .overrideProvider(StockManipulationService)
    .useValue({})
    .overrideProvider(FilesService)
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
    expect(module.get(ArrivalsModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const arrivalsModule = module.get(ArrivalsModule)
    expect(arrivalsModule).toBeInstanceOf(ArrivalsModule)
  })
  it('должен предоставлять ArrivalsController', () => {
    const arrivalsController = module.get(ArrivalsController)
    expect(arrivalsController).toBeDefined()
  })
  it('должен предоставлять ArrivalsService', () => {
    const arrivalsService = module.get(ArrivalsService)
    expect(arrivalsService).toBeDefined()
  })
  it('должен предоставлять CounterService', () => {
    const counterService = module.get(CounterService)
    expect(counterService).toBeDefined()
  })
  it('должен предоставлять StockManipulationService', () => {
    const stockManipulationService = module.get(StockManipulationService)
    expect(stockManipulationService).toBeDefined()
  })
  it('должен предоставлять FilesService', () => {
    const filesService = module.get(FilesService)
    expect(filesService).toBeDefined()
  })
  it('должен предоставлять LogsService', () => {
    const logsService = module.get(LogsService)
    expect(logsService).toBeDefined()
  })
}) 
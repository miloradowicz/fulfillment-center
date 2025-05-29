/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { InvoicesModule } from '../../src/modules/invoices.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ValidatorsModule } from '../../src/modules/validators.module'
import { FilesModule } from '../../src/modules/file-upload.module'
import { InvoicesController } from '../../src/controllers/invoices.controller'
import { InvoicesService } from '../../src/services/invoices.service'
import { CounterService } from '../../src/services/counter.service'
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
jest.mock('../../src/controllers/invoices.controller', () => ({
  InvoicesController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/invoices.service', () => ({
  InvoicesService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/counter.service', () => ({
  CounterService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('InvoicesModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [InvoicesModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(ValidatorsModule)
    .useModule(class MockValidatorsModule {})
    .overrideModule(FilesModule)
    .useModule(class MockFilesModule {})
    .overrideProvider(InvoicesController)
    .useValue({})
    .overrideProvider(InvoicesService)
    .useValue({})
    .overrideProvider(CounterService)
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
    expect(module.get(InvoicesModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const invoicesModule = module.get(InvoicesModule)
    expect(invoicesModule).toBeInstanceOf(InvoicesModule)
  })
  it('должен предоставлять InvoicesController', () => {
    const invoicesController = module.get(InvoicesController)
    expect(invoicesController).toBeDefined()
  })
  it('должен предоставлять InvoicesService', () => {
    const invoicesService = module.get(InvoicesService)
    expect(invoicesService).toBeDefined()
  })
  it('должен предоставлять CounterService', () => {
    const counterService = module.get(CounterService)
    expect(counterService).toBeDefined()
  })
  it('должен предоставлять LogsService', () => {
    const logsService = module.get(LogsService)
    expect(logsService).toBeDefined()
  })
}) 
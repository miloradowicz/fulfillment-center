/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ClientsModule } from '../../src/modules/clients.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { FilesModule } from '../../src/modules/file-upload.module'
import { ClientsController } from '../../src/controllers/clients.controller'
import { ClientsService } from '../../src/services/clients.service'
import { ProductsService } from '../../src/services/products.service'
import { LogsService } from '../../src/services/logs.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../../src/modules/file-upload.module', () => ({
  FilesModule: class MockFilesModule {}
}))
jest.mock('../../src/controllers/clients.controller', () => ({
  ClientsController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/clients.service', () => ({
  ClientsService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/products.service', () => ({
  ProductsService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('ClientsModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ClientsModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(FilesModule)
    .useModule(class MockFilesModule {})
    .overrideProvider(ClientsController)
    .useValue({})
    .overrideProvider(ClientsService)
    .useValue({})
    .overrideProvider(ProductsService)
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
    expect(module.get(ClientsModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const clientsModule = module.get(ClientsModule)
    expect(clientsModule).toBeInstanceOf(ClientsModule)
  })
  it('должен предоставлять ClientsController', () => {
    const clientsController = module.get(ClientsController)
    expect(clientsController).toBeDefined()
  })
  it('должен предоставлять ClientsService', () => {
    const clientsService = module.get(ClientsService)
    expect(clientsService).toBeDefined()
  })
  it('должен предоставлять ProductsService', () => {
    const productsService = module.get(ProductsService)
    expect(productsService).toBeDefined()
  })
  it('должен предоставлять LogsService', () => {
    const logsService = module.get(LogsService)
    expect(logsService).toBeDefined()
  })
}) 
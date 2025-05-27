/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ServicesModule } from '../../src/modules/services.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { FilesModule } from '../../src/modules/file-upload.module'
import { ServicesController } from '../../src/controllers/services.controller'
import { ServicesService } from '../../src/services/services.service'
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
jest.mock('../../src/controllers/services.controller', () => ({
  ServicesController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/services.service', () => ({
  ServicesService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('ServicesModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ServicesModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(FilesModule)
    .useModule(class MockFilesModule {})
    .overrideProvider(ServicesController)
    .useValue({})
    .overrideProvider(ServicesService)
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
    expect(module.get(ServicesModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const servicesModule = module.get(ServicesModule)
    expect(servicesModule).toBeInstanceOf(ServicesModule)
  })
  it('должен предоставлять ServicesController', () => {
    const servicesController = module.get(ServicesController)
    expect(servicesController).toBeDefined()
  })
  it('должен предоставлять ServicesService', () => {
    const servicesService = module.get(ServicesService)
    expect(servicesService).toBeDefined()
  })
  it('должен предоставлять LogsService', () => {
    const logsService = module.get(LogsService)
    expect(logsService).toBeDefined()
  })
}) 
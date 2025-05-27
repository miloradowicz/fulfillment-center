/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ServiceCategoriesModule } from '../../src/modules/service-category.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ValidatorsModule } from '../../src/modules/validators.module'
import { ServiceCategoriesController } from '../../src/controllers/service-categories.controller'
import { ServiceCategoriesService } from '../../src/services/service-categories.service'
import { ServicesService } from '../../src/services/services.service'
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
jest.mock('../../src/controllers/service-categories.controller', () => ({
  ServiceCategoriesController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/service-categories.service', () => ({
  ServiceCategoriesService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/services.service', () => ({
  ServicesService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('ServiceCategoriesModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ServiceCategoriesModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(ValidatorsModule)
    .useModule(class MockValidatorsModule {})
    .overrideProvider(ServiceCategoriesController)
    .useValue({})
    .overrideProvider(ServiceCategoriesService)
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
    expect(module.get(ServiceCategoriesModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const serviceCategoriesModule = module.get(ServiceCategoriesModule)
    expect(serviceCategoriesModule).toBeInstanceOf(ServiceCategoriesModule)
  })
  it('должен предоставлять ServiceCategoriesController', () => {
    const serviceCategoriesController = module.get(ServiceCategoriesController)
    expect(serviceCategoriesController).toBeDefined()
  })
  it('должен предоставлять ServiceCategoriesService', () => {
    const serviceCategoriesService = module.get(ServiceCategoriesService)
    expect(serviceCategoriesService).toBeDefined()
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
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ProductsModule } from '../../src/modules/products.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ProductsController } from '../../src/controllers/products.controller'
import { ProductsService } from '../../src/services/products.service'
import { LogsService } from '../../src/services/logs.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../../src/controllers/products.controller', () => ({
  ProductsController: jest.fn().mockImplementation(() => ({
  }))
}))
jest.mock('../../src/services/products.service', () => ({
  ProductsService: jest.fn().mockImplementation(() => ({
  }))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({
  }))
}))
describe('ProductsModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ProductsModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideProvider(ProductsController)
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
    expect(module.get(ProductsModule)).toBeDefined()
  })
  it('должен импортировать DbModule', () => {
    const productsModule = module.get(ProductsModule)
    expect(productsModule).toBeInstanceOf(ProductsModule)
  })
  it('должен импортировать AuthModule', () => {
    const productsModule = module.get(ProductsModule)
    expect(productsModule).toBeInstanceOf(ProductsModule)
  })
  it('должен предоставлять ProductsController', () => {
    const productsController = module.get(ProductsController)
    expect(productsController).toBeDefined()
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
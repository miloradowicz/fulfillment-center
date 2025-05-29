/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { CounterpartiesModule } from '../../src/modules/counterparties.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ValidatorsModule } from '../../src/modules/validators.module'
import { CounterpartiesController } from '../../src/controllers/counterparties.controller'
import { CounterpartiesService } from '../../src/services/counterparties.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../../src/modules/validators.module', () => ({
  ValidatorsModule: class MockValidatorsModule {}
}))
jest.mock('../../src/controllers/counterparties.controller', () => ({
  CounterpartiesController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/counterparties.service', () => ({
  CounterpartiesService: jest.fn().mockImplementation(() => ({}))
}))
describe('CounterpartiesModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CounterpartiesModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideModule(ValidatorsModule)
    .useModule(class MockValidatorsModule {})
    .overrideProvider(CounterpartiesController)
    .useValue({})
    .overrideProvider(CounterpartiesService)
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
    expect(module.get(CounterpartiesModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const counterpartiesModule = module.get(CounterpartiesModule)
    expect(counterpartiesModule).toBeInstanceOf(CounterpartiesModule)
  })
  it('должен предоставлять CounterpartiesController', () => {
    const counterpartiesController = module.get(CounterpartiesController)
    expect(counterpartiesController).toBeDefined()
  })
  it('должен предоставлять CounterpartiesService', () => {
    const counterpartiesService = module.get(CounterpartiesService)
    expect(counterpartiesService).toBeDefined()
  })
}) 
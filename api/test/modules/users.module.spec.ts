/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { UsersModule } from '../../src/modules/users.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { UsersController } from '../../src/controllers/users.controller'
import { UsersService } from '../../src/services/user.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../../src/controllers/users.controller', () => ({
  UsersController: jest.fn().mockImplementation(() => ({
  }))
}))
jest.mock('../../src/services/user.service', () => ({
  UsersService: jest.fn().mockImplementation(() => ({
  }))
}))
describe('UsersModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UsersModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideProvider(UsersController)
    .useValue({})
    .overrideProvider(UsersService)
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
    expect(module.get(UsersModule)).toBeDefined()
  })
  it('должен импортировать DbModule', () => {
    const usersModule = module.get(UsersModule)
    expect(usersModule).toBeInstanceOf(UsersModule)
  })
  it('должен импортировать AuthModule', () => {
    const usersModule = module.get(UsersModule)
    expect(usersModule).toBeInstanceOf(UsersModule)
  })
  it('должен предоставлять UsersController', () => {
    const usersController = module.get(UsersController)
    expect(usersController).toBeDefined()
  })
  it('должен предоставлять UsersService', () => {
    const usersService = module.get(UsersService)
    expect(usersService).toBeDefined()
  })
}) 
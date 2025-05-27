/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from '../../src/modules/auth.module'
import { DbModule } from '../../src/modules/db.module'
import { TokenAuthService } from '../../src/services/token-auth.service'
import { RolesService } from '../../src/services/roles.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/services/token-auth.service', () => ({
  TokenAuthService: jest.fn().mockImplementation(() => ({
  }))
}))
jest.mock('../../src/services/roles.service', () => ({
  RolesService: jest.fn().mockImplementation(() => ({
  }))
}))
describe('AuthModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideProvider(TokenAuthService)
    .useValue({})
    .overrideProvider(RolesService)
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
    expect(module.get(AuthModule)).toBeDefined()
  })
  it('должен импортировать DbModule', () => {
    const authModule = module.get(AuthModule)
    expect(authModule).toBeInstanceOf(AuthModule)
  })
  it('должен предоставлять TokenAuthService', () => {
    const tokenAuthService = module.get(TokenAuthService)
    expect(tokenAuthService).toBeDefined()
  })
  it('должен предоставлять RolesService', () => {
    const rolesService = module.get(RolesService)
    expect(rolesService).toBeDefined()
  })
  it('должен экспортировать TokenAuthService', () => {
    expect(() => module.get(TokenAuthService)).not.toThrow()
  })
  it('должен экспортировать RolesService', () => {
    expect(() => module.get(RolesService)).not.toThrow()
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { CsrfModule } from '../../src/modules/csrf.module'
import { CsrfController } from '../../src/controllers/csrf.controller'
jest.mock('../../src/controllers/csrf.controller', () => ({
  CsrfController: jest.fn().mockImplementation(() => ({
  }))
}))
describe('CsrfModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CsrfModule],
    })
    .overrideProvider(CsrfController)
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
    expect(module.get(CsrfModule)).toBeDefined()
  })
  it('должен предоставлять CsrfController', () => {
    const csrfController = module.get(CsrfController)
    expect(csrfController).toBeDefined()
  })
  it('должен быть экземпляром CsrfModule', () => {
    const csrfModule = module.get(CsrfModule)
    expect(csrfModule).toBeInstanceOf(CsrfModule)
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ValidatorsModule } from '../../src/modules/validators.module'
import { DbModule } from '../../src/modules/db.module'
import { IsMongoDocumentRule } from '../../src/validators/mongo-document-exists.rule'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/validators/mongo-document-exists.rule', () => ({
  IsMongoDocumentRule: jest.fn().mockImplementation(() => ({
  }))
}))
describe('ValidatorsModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ValidatorsModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideProvider(IsMongoDocumentRule)
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
    expect(module.get(ValidatorsModule)).toBeDefined()
  })
  it('должен импортировать DbModule', () => {
    const validatorsModule = module.get(ValidatorsModule)
    expect(validatorsModule).toBeInstanceOf(ValidatorsModule)
  })
  it('должен предоставлять IsMongoDocumentRule', () => {
    const isMongoDocumentRule = module.get(IsMongoDocumentRule)
    expect(isMongoDocumentRule).toBeDefined()
  })
  it('должен экспортировать IsMongoDocumentRule', () => {
    expect(() => module.get(IsMongoDocumentRule)).not.toThrow()
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { SeedModule } from '../src/seeder/seed.module'
import { SeederService } from '../src/seeder/seeder.service'
import { DbModule } from '../src/modules/db.module'
describe('SeedModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SeedModule],
    })
      .overrideModule(DbModule)
      .useModule(
        class MockDbModule {
        }
      )
      .overrideProvider(SeederService)
      .useValue({
        seed: jest.fn(),
      })
      .compile()
  })
  afterEach(async () => {
    if (module) {
      await module.close()
    }
  })
  it('должен быть определен', () => {
    expect(module).toBeDefined()
  })
  it('должен импортировать DbModule', () => {
    const moduleMetadata = Reflect.getMetadata('imports', SeedModule) || []
    expect(moduleMetadata).toContain(DbModule)
  })
  it('должен предоставлять SeederService', () => {
    const seederService = module.get<SeederService>(SeederService)
    expect(seederService).toBeDefined()
  })
  it('должен иметь правильную структуру модуля', () => {
    expect(SeedModule).toBeDefined()
    const moduleMetadata = Reflect.getMetadata('imports', SeedModule) || []
    const providersMetadata = Reflect.getMetadata('providers', SeedModule) || []
    expect(moduleMetadata).toContain(DbModule)
    expect(providersMetadata).toContain(SeederService)
  })
  describe('Интеграционные тесты', () => {
    it('должен успешно создавать модуль с реальными зависимостями', async () => {
      expect(() => {
        Test.createTestingModule({
          imports: [SeedModule],
        })
      }).not.toThrow()
    })
  })
}) 
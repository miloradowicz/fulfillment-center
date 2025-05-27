/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { FilesModule } from '../../src/modules/file-upload.module'
import { DbModule } from '../../src/modules/db.module'
import { FilesController } from '../../src/controllers/files.controller'
import { FilesService } from '../../src/services/files.service'
import { MulterModule } from '@nestjs/platform-express'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/controllers/files.controller', () => ({
  FilesController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/files.service', () => ({
  FilesService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('@nestjs/platform-express', () => ({
  MulterModule: {
    register: jest.fn().mockReturnValue({
      module: class MockMulterModule {},
      providers: [],
      exports: []
    })
  }
}))
jest.mock('src/config', () => ({
  default: {
    server: {
      uploadsPath: '/tmp/uploads'
    }
  }
}))
describe('FilesModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FilesModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideProvider(FilesController)
    .useValue({})
    .overrideProvider(FilesService)
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
    expect(module.get(FilesModule)).toBeDefined()
  })
  it('должен импортировать DbModule', () => {
    const filesModule = module.get(FilesModule)
    expect(filesModule).toBeInstanceOf(FilesModule)
  })
  it('должен предоставлять FilesController', () => {
    const filesController = module.get(FilesController)
    expect(filesController).toBeDefined()
  })
  it('должен предоставлять FilesService', () => {
    const filesService = module.get(FilesService)
    expect(filesService).toBeDefined()
  })
  it('должен экспортировать FilesService', () => {
    expect(() => module.get(FilesService)).not.toThrow()
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ReportsModule } from '../../src/modules/reports.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { ReportsController } from '../../src/controllers/reports.controller'
import { ReportService } from '../../src/services/report.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../../src/controllers/reports.controller', () => ({
  ReportsController: jest.fn().mockImplementation(() => ({
  }))
}))
jest.mock('../../src/services/report.service', () => ({
  ReportService: jest.fn().mockImplementation(() => ({
  }))
}))
describe('ReportsModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ReportsModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideProvider(ReportsController)
    .useValue({})
    .overrideProvider(ReportService)
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
    expect(module.get(ReportsModule)).toBeDefined()
  })
  it('должен импортировать DbModule', () => {
    const reportsModule = module.get(ReportsModule)
    expect(reportsModule).toBeInstanceOf(ReportsModule)
  })
  it('должен импортировать AuthModule', () => {
    const reportsModule = module.get(ReportsModule)
    expect(reportsModule).toBeInstanceOf(ReportsModule)
  })
  it('должен предоставлять ReportsController', () => {
    const reportsController = module.get(ReportsController)
    expect(reportsController).toBeDefined()
  })
  it('должен предоставлять ReportService', () => {
    const reportService = module.get(ReportService)
    expect(reportService).toBeDefined()
  })
}) 
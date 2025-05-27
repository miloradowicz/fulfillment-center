/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { TasksModule } from '../../src/modules/tasks.module'
import { DbModule } from '../../src/modules/db.module'
import { AuthModule } from '../../src/modules/auth.module'
import { TasksController } from '../../src/controllers/tasks.controller'
import { TasksService } from '../../src/services/tasks.service'
import { CounterService } from '../../src/services/counter.service'
import { LogsService } from '../../src/services/logs.service'
jest.mock('../../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../../src/controllers/tasks.controller', () => ({
  TasksController: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/tasks.service', () => ({
  TasksService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/counter.service', () => ({
  CounterService: jest.fn().mockImplementation(() => ({}))
}))
jest.mock('../../src/services/logs.service', () => ({
  LogsService: jest.fn().mockImplementation(() => ({}))
}))
describe('TasksModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TasksModule],
    })
    .overrideModule(DbModule)
    .useModule(class MockDbModule {})
    .overrideModule(AuthModule)
    .useModule(class MockAuthModule {})
    .overrideProvider(TasksController)
    .useValue({})
    .overrideProvider(TasksService)
    .useValue({})
    .overrideProvider(CounterService)
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
    expect(module.get(TasksModule)).toBeDefined()
  })
  it('должен импортировать все необходимые модули', () => {
    const tasksModule = module.get(TasksModule)
    expect(tasksModule).toBeInstanceOf(TasksModule)
  })
  it('должен предоставлять TasksController', () => {
    const tasksController = module.get(TasksController)
    expect(tasksController).toBeDefined()
  })
  it('должен предоставлять TasksService', () => {
    const tasksService = module.get(TasksService)
    expect(tasksService).toBeDefined()
  })
  it('должен предоставлять CounterService', () => {
    const counterService = module.get(CounterService)
    expect(counterService).toBeDefined()
  })
  it('должен предоставлять LogsService', () => {
    const logsService = module.get(LogsService)
    expect(logsService).toBeDefined()
  })
}) 
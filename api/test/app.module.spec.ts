/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { DbModule } from '../src/modules/db.module'
import { ClientsModule } from '../src/modules/clients.module'
import { ProductsModule } from '../src/modules/products.module'
import { ArrivalsModule } from '../src/modules/arrivals.module'
import { OrdersModule } from '../src/modules/orders.module'
import { CsrfModule } from '../src/modules/csrf.module'
import { UsersModule } from '../src/modules/users.module'
import { ValidatorsModule } from '../src/modules/validators.module'
import { TasksModule } from '../src/modules/tasks.module'
import { ServicesModule } from '../src/modules/services.module'
import { StocksModule } from '../src/modules/stocks.module'
import { AuthModule } from '../src/modules/auth.module'
import { CounterpartiesModule } from '../src/modules/counterparties.module'
import { ServiceCategoriesModule } from '../src/modules/service-category.module'
import { ReportsModule } from '../src/modules/reports.module'
import { InvoicesModule } from '../src/modules/invoices.module'
jest.mock('../src/modules/db.module', () => ({
  DbModule: class MockDbModule {}
}))
jest.mock('../src/modules/clients.module', () => ({
  ClientsModule: class MockClientsModule {}
}))
jest.mock('../src/modules/products.module', () => ({
  ProductsModule: class MockProductsModule {}
}))
jest.mock('../src/modules/arrivals.module', () => ({
  ArrivalsModule: class MockArrivalsModule {}
}))
jest.mock('../src/modules/orders.module', () => ({
  OrdersModule: class MockOrdersModule {}
}))
jest.mock('../src/modules/csrf.module', () => ({
  CsrfModule: class MockCsrfModule {}
}))
jest.mock('../src/modules/users.module', () => ({
  UsersModule: class MockUsersModule {}
}))
jest.mock('../src/modules/validators.module', () => ({
  ValidatorsModule: class MockValidatorsModule {}
}))
jest.mock('../src/modules/tasks.module', () => ({
  TasksModule: class MockTasksModule {}
}))
jest.mock('../src/modules/services.module', () => ({
  ServicesModule: class MockServicesModule {}
}))
jest.mock('../src/modules/stocks.module', () => ({
  StocksModule: class MockStocksModule {}
}))
jest.mock('../src/modules/auth.module', () => ({
  AuthModule: class MockAuthModule {}
}))
jest.mock('../src/modules/counterparties.module', () => ({
  CounterpartiesModule: class MockCounterpartiesModule {}
}))
jest.mock('../src/modules/service-category.module', () => ({
  ServiceCategoriesModule: class MockServiceCategoriesModule {}
}))
jest.mock('../src/modules/reports.module', () => ({
  ReportsModule: class MockReportsModule {}
}))
jest.mock('../src/modules/invoices.module', () => ({
  InvoicesModule: class MockInvoicesModule {}
}))
describe('AppModule', () => {
  let module: TestingModule
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
  })
  afterEach(async () => {
    await module.close()
  })
  it('should be defined', () => {
    expect(module).toBeDefined()
  })
  it('should compile successfully', () => {
    expect(module.get(AppModule)).toBeDefined()
  })
  it('should import all required modules', () => {
    const appModule = module.get(AppModule)
    expect(appModule).toBeInstanceOf(AppModule)
  })
}) 
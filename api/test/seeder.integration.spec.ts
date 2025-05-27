/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { getConnectionToken, getModelToken } from '@nestjs/mongoose'
import { Connection } from 'mongoose'
import { SeederService } from '../src/seeder/seeder.service'
import { SeedModule } from '../src/seeder/seed.module'
import { DbModule } from '../src/modules/db.module'
import { Client } from '../src/schemas/client.schema'
import { Product } from '../src/schemas/product.schema'
import { User } from '../src/schemas/user.schema'
import { Task } from '../src/schemas/task.schema'
import { Arrival } from '../src/schemas/arrival.schema'
import { Service } from '../src/schemas/service.schema'
import { Stock } from '../src/schemas/stock.schema'
import { Order } from '../src/schemas/order.schema'
import { Counter } from '../src/schemas/counter.schema'
import { Counterparty } from '../src/schemas/counterparty.schema'
import { ServiceCategory } from '../src/schemas/service-category.schema'
import { Invoice } from '../src/schemas/invoice.schema'
import { createMockModel } from './test-utils'
describe('Seeder Integration Tests', () => {
  let module: TestingModule
  let seederService: SeederService
  let connection: jest.Mocked<Connection>
  let userModel: any
  let clientModel: any
  let productModel: any
  beforeAll(async () => {
    userModel = createMockModel()
    clientModel = createMockModel()
    productModel = createMockModel()
    connection = {
      dropDatabase: jest.fn().mockResolvedValue(undefined),
      readyState: 1,
      close: jest.fn().mockResolvedValue(undefined),
    } as any
    module = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: getConnectionToken(),
          useValue: connection,
        },
        {
          provide: getModelToken(Client.name),
          useValue: clientModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: productModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: getModelToken(Task.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(Arrival.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(Service.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(Stock.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(Order.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(Counter.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(Counterparty.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(ServiceCategory.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(Invoice.name),
          useValue: createMockModel(),
        },
      ],
          })
        .compile()
      seederService = module.get<SeederService>(SeederService)
    })
    afterAll(async () => {
      if (module) {
        await module.close()
      }
    })
    beforeEach(() => {
      jest.clearAllMocks()
      userModel.create.mockResolvedValue([
        { _id: 'user1', email: 'test@gmail.com', role: 'stock-worker' },
        { _id: 'user2', email: 'admin@test.com', role: 'super-admin' },
        { _id: 'user3', email: 'john@doe1.com', role: 'manager' },
        { _id: 'user4', email: 'john@doe12.com', role: 'manager' },
        { _id: 'user5', email: 'john1234@doe.com', role: 'super-admin' },
        { _id: 'user6', email: 'alexandr@gmail.com', role: 'super-admin' },
        { _id: 'user7', email: 'abc@gmail.com', role: 'admin' },
      ])
      clientModel.create.mockResolvedValue([
        { _id: 'client1', name: 'CHAPSAN' },
        { _id: 'client2', name: 'ИП Петрова' }
      ])
      productModel.create.mockResolvedValue([
        { _id: 'product1', title: 'Сарафан' },
        { _id: 'product2', title: 'Джинсы' },
        { _id: 'product3', title: 'Футболка' },
        { _id: 'product4', title: 'Худи' },
        { _id: 'product5', title: 'Кепка' },
        { _id: 'product6', title: 'Платье' },
      ])
      const serviceCategoryModel = module.get(getModelToken(ServiceCategory.name))
      const serviceModel = module.get(getModelToken(Service.name))
      const stockModel = module.get(getModelToken(Stock.name))
      const orderModel = module.get(getModelToken(Order.name))
      const taskModel = module.get(getModelToken(Task.name))
      const arrivalModel = module.get(getModelToken(Arrival.name))
      const counterpartyModel = module.get(getModelToken(Counterparty.name))
      const invoiceModel = module.get(getModelToken(Invoice.name))
      const counterModel = module.get(getModelToken(Counter.name))
      serviceCategoryModel.create.mockResolvedValue([
        { _id: 'servicecat1', name: 'Работа с товаром' },
        { _id: 'servicecat2', name: 'Дополнительные услуги' }
      ])
      serviceModel.create.mockResolvedValue([
        { _id: 'service1', name: 'Приемка, пересчет товара', price: 50000, type: 'внутренняя' },
        { _id: 'service2', name: 'Маркировка двойная', price: 30000, type: 'внутренняя' },
        { _id: 'service3', name: 'Погрузка-Разгрузка на складе фулфилмента', price: 70000, type: 'внешняя' },
        { _id: 'service4', name: 'Забор с другого адреса', price: 100000, type: 'внешняя' }
      ])
      stockModel.create.mockResolvedValue([
        { _id: 'stock1', name: 'Склад Бишкек' },
        { _id: 'stock2', name: 'Склад Москва' }
      ])
      orderModel.create.mockResolvedValue([
        { _id: 'order1', orderNumber: 'ORD-1' },
        { _id: 'order2', orderNumber: 'ORD-2' },
        { _id: 'order3', orderNumber: 'ORD-3' },
        { _id: 'order4', orderNumber: 'ORD-4' },
        { _id: 'order5', orderNumber: 'ORD-5' },
        { _id: 'order6', orderNumber: 'ORD-6' }
      ])
      taskModel.create.mockResolvedValue([
        { _id: 'task1' },
        { _id: 'task2' },
        { _id: 'task3' },
        { _id: 'task4' },
        { _id: 'task5' },
        { _id: 'task6' },
        { _id: 'task7' },
        { _id: 'task8' },
        { _id: 'task9' },
        { _id: 'task10' },
        { _id: 'task11' },
        { _id: 'task12' },
        { _id: 'task13' }
      ])
      arrivalModel.create.mockResolvedValue([
        { _id: 'arrival1' },
        { _id: 'arrival2' },
        { _id: 'arrival3' },
        { _id: 'arrival4' },
        { _id: 'arrival5' }
      ])
      counterpartyModel.create.mockResolvedValue([
        { _id: 'counterparty1' },
        { _id: 'counterparty2' },
        { _id: 'counterparty3' },
        { _id: 'counterparty4' },
        { _id: 'counterparty5' }
      ])
      invoiceModel.create.mockResolvedValue([
        { _id: 'invoice1' },
        { _id: 'invoice2' },
        { _id: 'invoice3' },
        { _id: 'invoice4' },
        { _id: 'invoice5' },
        { _id: 'invoice6' }
      ])
      counterModel.findOneAndUpdate = jest.fn().mockResolvedValue({ _id: 'counter1', name: 'task', seq: 13 })
    })
    describe('SeederService Integration', () => {
      it('должен успешно выполнить полный процесс seeding', async () => {
        await seederService.seed()
        expect(connection.dropDatabase).toHaveBeenCalledTimes(1)
        expect(userModel.create).toHaveBeenCalledTimes(1)
        expect(clientModel.create).toHaveBeenCalledTimes(1)
        expect(productModel.create).toHaveBeenCalledTimes(1)
      })
      it('должен создавать пользователей с правильными данными', async () => {
        await seederService.seed()
        const userCreateCall = userModel.create.mock.calls[0][0]
        expect(userCreateCall).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: 'test@gmail.com',
              displayName: 'Мария',
              role: 'stock-worker',
            }),
            expect.objectContaining({
              email: 'john@doe.com',
              displayName: 'Admin',
              role: 'super-admin',
            }),
          ])
        )
      })
      it('должен создавать клиентов с правильными данными', async () => {
        await seederService.seed()
        expect(clientModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'CHAPSAN',
            phone_number: '1 123-456-7890',
            email: 'test@gmail.com',
            inn: '123123',
          }),
          expect.objectContaining({
            name: 'ИП Петрова',
          }),
          expect.objectContaining({
            name: 'ИП Сидорова',
          }),
          expect.objectContaining({
            name: 'ОсOO CHAPSAN-GROUP',
            isArchived: true,
          }),
          expect.objectContaining({
            name: 'ИП Асанов',
            isArchived: true,
          })
        )
      })
      it('должен обрабатывать ошибки при seeding', async () => {
        const error = new Error('Ошибка создания пользователей')
        userModel.create.mockRejectedValue(error)
        await expect(seederService.seed()).rejects.toThrow('Ошибка создания пользователей')
      })
    })
    describe('SeedModule Integration', () => {
      it('должен корректно инициализировать все зависимости', () => {
        expect(seederService).toBeDefined()
        expect(connection).toBeDefined()
        expect(connection.readyState).toBe(1) 
      })
      it('должен предоставлять доступ к SeederService через модуль', () => {
        const service = module.get<SeederService>(SeederService)
        expect(service).toBe(seederService)
        expect(service.seed).toBeDefined()
        expect(typeof service.seed).toBe('function')
      })
    })
    describe('Производительность', () => {
      it('должен выполнить seeding за разумное время', async () => {
        const startTime = Date.now()
        await seederService.seed()
        const endTime = Date.now()
        const executionTime = endTime - startTime
        expect(executionTime).toBeLessThan(1000)
      })
    })
  }) 
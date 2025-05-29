/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { getConnectionToken, getModelToken } from '@nestjs/mongoose'
import { Connection } from 'mongoose'
import { SeederService } from '../src/seeder/seeder.service'
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
describe('SeederService', () => {
  let service: SeederService
  let connection: jest.Mocked<Connection>
  let clientModel: any
  let productModel: any
  let userModel: any
  let taskModel: any
  let arrivalModel: any
  let serviceModel: any
  let stockModel: any
  let orderModel: any
  let counterModel: any
  let counterpartyModel: any
  let serviceCategoryModel: any
  let invoiceModel: any
  const mockUsers = [
    { _id: 'user1', email: 'test@gmail.com', displayName: 'Мария', role: 'stock-worker' },
    { _id: 'user2', email: 'test1@gmail.com', displayName: 'Оля Макарова', role: 'stock-worker' },
    { _id: 'admin', email: 'john@doe.com', displayName: 'Admin', role: 'super-admin' },
    { _id: 'user3', email: 'john@doe1.com', displayName: 'Артем Иванов', role: 'manager' },
    { _id: 'user4', email: 'john@doe12.com', displayName: 'Игорь', role: 'manager' },
    { _id: 'user5', email: 'john1234@doe.com', displayName: 'Кристина', role: 'super-admin' },
    { _id: 'user6', email: 'alexandr@gmail.com', displayName: 'Саша', role: 'super-admin' },
    { _id: 'user7', email: 'abc@gmail.com', displayName: 'Маша', role: 'admin' },
  ]
  const mockClients = [
    { _id: 'client1', name: 'CHAPSAN', email: 'test@gmail.com', inn: '123123' },
    { _id: 'client2', name: 'ИП Петрова', email: 'test1@gmail.com', inn: '1231423' },
    { _id: 'client3', name: 'ИП Сидорова', email: 'test2@gmail.com', inn: '12213' },
  ]
  const mockServiceCategories = [
    { _id: 'servicecat1', name: 'Работа с товаром', isArchived: false },
    { _id: 'servicecat2', name: 'Дополнительные услуги', isArchived: false },
  ]
  const mockServices = [
    { _id: 'service1', name: 'Приемка, пересчет товара', price: 50000, type: 'внутренняя' },
    { _id: 'service2', name: 'Маркировка двойная', price: 30000, type: 'внутренняя' },
    { _id: 'service3', name: 'Погрузка-Разгрузка на складе фулфилмента', price: 70000, type: 'внешняя' },
    { _id: 'service4', name: 'Забор с другого адреса', price: 100000, type: 'внешняя' },
  ]
  const mockProducts = [
    { _id: 'product1', title: 'Сарафан', barcode: '012345678901', article: '01234567' },
    { _id: 'product2', title: 'Джинсы', barcode: '987654321012', article: '987654' },
    { _id: 'product3', title: 'Футболка', barcode: '567890123456', article: '567890' },
    { _id: 'product4', title: 'Худи', barcode: '987654321012', article: '987654' },
    { _id: 'product5', title: 'Кепка', barcode: '987654321012', article: '987654' },
    { _id: 'product6', title: 'Платье', barcode: '987644321012', article: '987954' },
  ]
  const mockStocks = [
    { _id: 'stock1', name: 'Склад Бишкек', address: 'Ул. Малдыбаева 7/1' },
    { _id: 'stock2', name: 'Склад Москва', address: 'Ул. Гагарина 102' },
  ]
  const mockOrders = [
    { _id: 'order1', orderNumber: 'ORD-1', status: 'в сборке' },
    { _id: 'order2', orderNumber: 'ORD-2', status: 'отправлен' },
    { _id: 'order3', orderNumber: 'ORD-3', status: 'доставлен' },
    { _id: 'order4', orderNumber: 'ORD-4', status: 'в сборке' },
    { _id: 'order5', orderNumber: 'ORD-5', status: 'в пути' },
    { _id: 'order6', orderNumber: 'ORD-6', status: 'в сборке' },
  ]
  beforeEach(async () => {
    clientModel = createMockModel()
    productModel = createMockModel()
    userModel = createMockModel()
    taskModel = createMockModel()
    arrivalModel = createMockModel()
    serviceModel = createMockModel()
    stockModel = createMockModel()
    orderModel = createMockModel()
    counterModel = createMockModel()
    counterpartyModel = createMockModel()
    serviceCategoryModel = createMockModel()
    invoiceModel = createMockModel()
    userModel.create.mockResolvedValue(mockUsers)
    clientModel.create.mockResolvedValue(mockClients)
    serviceCategoryModel.create.mockResolvedValue(mockServiceCategories)
    serviceModel.create.mockResolvedValue(mockServices)
    productModel.create.mockResolvedValue(mockProducts)
    stockModel.create.mockResolvedValue(mockStocks)
    orderModel.create.mockResolvedValue(mockOrders)
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
    connection = {
      dropDatabase: jest.fn().mockResolvedValue(undefined),
    } as any
    const module: TestingModule = await Test.createTestingModule({
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
          useValue: taskModel,
        },
        {
          provide: getModelToken(Arrival.name),
          useValue: arrivalModel,
        },
        {
          provide: getModelToken(Service.name),
          useValue: serviceModel,
        },
        {
          provide: getModelToken(Stock.name),
          useValue: stockModel,
        },
        {
          provide: getModelToken(Order.name),
          useValue: orderModel,
        },
        {
          provide: getModelToken(Counter.name),
          useValue: counterModel,
        },
        {
          provide: getModelToken(Counterparty.name),
          useValue: counterpartyModel,
        },
        {
          provide: getModelToken(ServiceCategory.name),
          useValue: serviceCategoryModel,
        },
        {
          provide: getModelToken(Invoice.name),
          useValue: invoiceModel,
        },
      ],
    }).compile()
    service = module.get<SeederService>(SeederService)
    jest.clearAllMocks()
  })
  it('должен быть определен', () => {
    expect(service).toBeDefined()
  })
  describe('seed', () => {
    it('должен успешно выполнить полный процесс заполнения базы данных', async () => {
      await service.seed()
      expect(connection.dropDatabase).toHaveBeenCalledTimes(1)
      expect(userModel.create).toHaveBeenCalledTimes(1)
      expect(userModel.create).toHaveBeenCalledWith(
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
      expect(clientModel.create).toHaveBeenCalledTimes(1)
      expect(clientModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'CHAPSAN',
          phone_number: '1 123-456-7890',
          email: 'test@gmail.com',
          inn: '123123',
        }),
        expect.objectContaining({
          name: 'ИП Петрова',
          phone_number: '1 123-456-7899',
          email: 'test1@gmail.com',
        }),
        expect.objectContaining({
          name: 'ИП Сидорова',
          phone_number: '1 123-056-7899',
          email: 'test2@gmail.com',
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
      expect(serviceCategoryModel.create).toHaveBeenCalledTimes(1)
      expect(serviceCategoryModel.create).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Работа с товаром',
          isArchived: false,
        }),
        expect.objectContaining({
          name: 'Дополнительные услуги',
          isArchived: false,
        }),
      ])
      expect(serviceModel.create).toHaveBeenCalledTimes(1)
      expect(serviceModel.create).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Приемка, пересчет товара',
          price: 50000,
          type: 'внутренняя',
        }),
        expect.objectContaining({
          name: 'Маркировка двойная',
          price: 30000,
          type: 'внутренняя',
        }),
        expect.objectContaining({
          name: 'Погрузка-Разгрузка на складе фулфилмента',
          price: 70000,
          type: 'внешняя',
        }),
        expect.objectContaining({
          name: 'Забор с другого адреса',
          price: 100000,
          type: 'внешняя',
        }),
      ])
      expect(productModel.create).toHaveBeenCalledTimes(1)
      expect(productModel.create).toHaveBeenCalledWith([
        expect.objectContaining({
          title: 'Сарафан',
          barcode: '012345678901',
          article: '01234567',
          dynamic_fields: expect.arrayContaining([
            { label: 'Размер', key: 'size', value: '42' },
            { label: 'Цвет', key: 'color', value: 'Красный' },
          ]),
        }),
        expect.objectContaining({
          title: 'Джинсы',
          barcode: '987654321012',
          article: '987654',
        }),
        expect.objectContaining({
          title: 'Футболка',
          barcode: '567890123456',
          article: '567890',
          logs: expect.any(Array),
        }),
        expect.objectContaining({
          title: 'Худи',
          isArchived: true,
        }),
        expect.objectContaining({
          title: 'Кепка',
          isArchived: true,
        }),
        expect.objectContaining({
          title: 'Платье',
          barcode: '987644321012',
          article: '987954',
        }),
      ])
      expect(stockModel.create).toHaveBeenCalledTimes(1)
      expect(stockModel.create).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Склад Бишкек',
          address: 'Ул. Малдыбаева 7/1',
          products: expect.any(Array),
          defects: expect.any(Array),
          write_offs: expect.any(Array),
        }),
        expect.objectContaining({
          name: 'Склад Москва',
          address: 'Ул. Гагарина 102',
        }),
        expect.objectContaining({
          name: 'Склад Санкт-Петербург',
          isArchived: true,
        }),
        expect.objectContaining({
          name: 'Склад Кант',
          isArchived: true,
        }),
      ])
      expect(orderModel.create).toHaveBeenCalledTimes(1)
      expect(taskModel.create).toHaveBeenCalledTimes(1)
      expect(arrivalModel.create).toHaveBeenCalledTimes(1)
      expect(counterpartyModel.create).toHaveBeenCalledTimes(1)
      expect(invoiceModel.create).toHaveBeenCalledTimes(1)
      expect(counterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: 'task' },
        { $set: { seq: 13 } },
        { upsert: true }
      )
      expect(counterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: 'invoice' },
        { $set: { seq: 6 } },
        { upsert: true }
      )
    })
    it('должен обрабатывать ошибки при очистке базы данных', async () => {
      const error = new Error('Ошибка подключения к базе данных')
      connection.dropDatabase.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка подключения к базе данных')
    })
    it('должен обрабатывать ошибки при создании пользователей', async () => {
      const error = new Error('Ошибка создания пользователей')
      userModel.create.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка создания пользователей')
    })
    it('должен обрабатывать ошибки при создании клиентов', async () => {
      const error = new Error('Ошибка создания клиентов')
      clientModel.create.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка создания клиентов')
    })
    it('должен обрабатывать ошибки при создании категорий услуг', async () => {
      const error = new Error('Ошибка создания категорий услуг')
      serviceCategoryModel.create.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка создания категорий услуг')
    })
    it('должен обрабатывать ошибки при создании услуг', async () => {
      const error = new Error('Ошибка создания услуг')
      serviceModel.create.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка создания услуг')
    })
    it('должен обрабатывать ошибки при создании товаров', async () => {
      const error = new Error('Ошибка создания товаров')
      productModel.create.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка создания товаров')
    })
    it('должен обрабатывать ошибки при создании складов', async () => {
      const error = new Error('Ошибка создания складов')
      stockModel.create.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка создания складов')
    })
    it('должен обрабатывать ошибки при создании заказов', async () => {
      const error = new Error('Ошибка создания заказов')
      orderModel.create.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка создания заказов')
    })
    it('должен обрабатывать ошибки при обновлении счетчиков', async () => {
      const error = new Error('Ошибка обновления счетчиков')
      counterModel.findOneAndUpdate.mockRejectedValue(error)
      await expect(service.seed()).rejects.toThrow('Ошибка обновления счетчиков')
    })
    it('должен создавать пользователей с правильными ролями', async () => {
      await service.seed()
      const createCall = userModel.create.mock.calls[0][0]
      const roles = createCall.map((user: any) => user.role)
      expect(roles).toContain('stock-worker')
      expect(roles).toContain('super-admin')
      expect(roles).toContain('manager')
      expect(roles).toContain('admin')
    })
    it('должен создавать товары с динамическими полями', async () => {
      await service.seed()
      const createCall = productModel.create.mock.calls[0][0]
      const productWithDynamicFields = createCall.find((product: any) => product.title === 'Сарафан')
      expect(productWithDynamicFields.dynamic_fields).toEqual([
        { label: 'Размер', key: 'size', value: '42' },
        { label: 'Цвет', key: 'color', value: 'Красный' },
      ])
    })
    it('должен создавать товары с логами', async () => {
      await service.seed()
      const createCall = productModel.create.mock.calls[0][0]
      const productWithLogs = createCall.find((product: any) => product.title === 'Футболка')
      expect(productWithLogs.logs).toBeDefined()
      expect(productWithLogs.logs).toHaveLength(4)
      expect(productWithLogs.logs[0]).toHaveProperty('change', 'record #1')
    })
    it('должен создавать склады с товарами, дефектами и списаниями', async () => {
      await service.seed()
      const createCall = stockModel.create.mock.calls[0][0]
      const bishkekStock = createCall.find((stock: any) => stock.name === 'Склад Бишкек')
      expect(bishkekStock.products).toBeDefined()
      expect(bishkekStock.defects).toBeDefined()
      expect(bishkekStock.write_offs).toBeDefined()
      expect(bishkekStock.write_offs[0]).toHaveProperty('reason', 'Someone stole it.')
    })
    it('должен создавать заказы с услугами', async () => {
      await service.seed()
      const createCall = orderModel.create.mock.calls[0][0]
      const orderWithServices = createCall.find((order: any) => order.orderNumber === 'ORD-1')
      expect(orderWithServices.services).toBeDefined()
      expect(orderWithServices.services).toHaveLength(2)
    })
    it('должен правильно устанавливать архивные записи', async () => {
      await service.seed()
      const clientCreateCall = clientModel.create.mock.calls[0]
      const archivedClients = clientCreateCall.filter((client: any) => client.isArchived === true)
      expect(archivedClients).toHaveLength(2)
      const productCreateCall = productModel.create.mock.calls[0][0]
      const archivedProducts = productCreateCall.filter((product: any) => product.isArchived === true)
      expect(archivedProducts).toHaveLength(2)
      const stockCreateCall = stockModel.create.mock.calls[0][0]
      const archivedStocks = stockCreateCall.filter((stock: any) => stock.isArchived === true)
      expect(archivedStocks).toHaveLength(2)
    })
  })
}) 
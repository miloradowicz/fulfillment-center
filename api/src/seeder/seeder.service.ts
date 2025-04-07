import { Injectable } from '@nestjs/common'
import { Connection, Model } from 'mongoose'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Client, ClientDocument } from '../schemas/client.schema'
import { Product, ProductDocument } from '../schemas/product.schema'
import { User, UserDocument } from 'src/schemas/user.schema'
import { Task, TaskDocument } from '../schemas/task.schema'
import { Arrival, ArrivalDocument } from '../schemas/arrival.schema'
import { randomUUID } from 'node:crypto'
import { Service, ServiceDocument } from '../schemas/service.schema'
import { Stock, StockDocument } from '../schemas/stock.schema'
import { Order, OrderDocument } from '../schemas/order.schema'
import { Counter, CounterDocument } from '../schemas/counter.schema'
import { Counterparty, CounterpartyDocument } from '../schemas/counterparty.schema'
import { ServiceCategory, ServiceCategoryDocument } from '../schemas/service-category.schema'

@Injectable()
export class SeederService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Arrival.name)
    private readonly arrivalModel: Model<ArrivalDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(Stock.name)
    private readonly stockModel: Model<StockDocument>,
    @InjectModel(Counter.name)
    private readonly counterModel: Model<CounterDocument>,
    @InjectModel(Counterparty.name)
    private readonly counterpartyModel: Model<CounterpartyDocument>,
    @InjectModel(ServiceCategory.name)
    private readonly serviceCategoryModel: Model<ServiceCategoryDocument>,
  ) { }

  async seed() {
    await this.connection.dropDatabase()

    const [_User1, _User2, _admin, _User3, _User4, _User5, _User6, _User7] = await this.userModel.create([
      {
        email: 'test@gmail.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        displayName: 'Мария',
        role: 'stock-worker',
        token: randomUUID(),
      },
      {
        email: 'test1@gmail.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        displayName: 'Оля Макарова',
        role: 'stock-worker',
        token: randomUUID(),
      },
      {
        email: 'john@doe.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        displayName: 'Admin',
        role: 'super-admin',
        token: randomUUID(),
      },
      {
        email: 'john@doe1.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        displayName: 'Артем Иванов',
        role: 'super-admin',
        token: randomUUID(),
      },
      {
        email: 'john@doe12.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        displayName: 'Игорь',
        role: 'super-admin',
        token: randomUUID(),
      },
      {
        email: 'john1234@doe.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        displayName: 'Кристина',
        role: 'super-admin',
        token: randomUUID(),
      },
      {
        email: 'john123а4@doe.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        displayName: 'Саша',
        role: 'super-admin',
        token: randomUUID(),
      },
    ])

    const [_client_1] = await this.clientModel.create(
      {
        name: 'CHAPSAN',
        phone_number: '1 123-456-7890',
        email: 'test@gmail.com',
        inn: '123123',
        address: 'Малдыбаева 7/1',
        banking_data: '123123',
        ogrn: '123123',
        isArchived: false,
      },
      {
        name: 'ОсOO CHAPSAN-GROUP',
        phone_number: '1 123-456-7890',
        email: 'test@gmail.com',
        inn: '111',
        address: 'Малдыбаева 7/2',
        banking_data: '111',
        ogrn: '111',
        isArchived: true,
      },
      {
        name: 'ИП Асанов',
        phone_number: '1 123-456-7890',
        email: 'test@gmail.com',
        inn: '888',
        address: 'Малдыбаева 7/3',
        banking_data: '888',
        ogrn: '888',
        isArchived: true,
      },

    )

    const [_product1, _product2, _product3] = await this.productModel.create([
      {
        client: _client_1._id,
        title: 'Сарафан',
        barcode: '012345678901',
        article: '01234567',
        dynamic_fields: [
          { label: 'Размер', key: 'size', value: '42' },
          { label: 'Цвет', key: 'color', value: 'Красный' },
        ],
        isArchived: false,
      },
      {
        client: _client_1._id,
        title: 'Джинсы',
        barcode: '987654321012',
        article: '987654',
        dynamic_fields: [
          { label: 'Размер', key: 'size', value: '48' },
          { label: 'Цвет', key: 'color', value: 'Синий' },
        ],
        isArchived: false,
      },
      {
        client: _client_1._id,
        title: 'Футболка',
        barcode: '567890123456',
        article: '567890',
        dynamic_fields: [
          { label: 'Размер', key: 'size', value: 'L' },
          { label: 'Цвет', key: 'color', value: 'Белый' },
        ],
        logs: [
          { user: _User1, change: 'record #1', date: new Date().toISOString() },
          { user: _User1, change: 'record #2', date: new Date().toISOString() },
          { user: _User1, change: 'record #3', date: new Date().toISOString() },
          { user: _User2, change: 'record #4', date: new Date().toISOString() },
        ],
        isArchived: false,
      },
      {
        client: _client_1._id,
        title: 'Худи',
        barcode: '987654321012',
        article: '987654',
        dynamic_fields: [
          { label: 'Размер', key: 'size', value: '48' },
          { label: 'Цвет', key: 'color', value: 'Синий' },
        ],
        isArchived: true,
      },
      {
        client: _client_1._id,
        title: 'Кепка',
        barcode: '987654321012',
        article: '987654',
        dynamic_fields: [
          { label: 'Размер', key: 'size', value: '48' },
          { label: 'Цвет', key: 'color', value: 'Синий' },
        ],
        isArchived: true,
      },
    ])

    const [_stock1, _stock2] = await this.stockModel.create([
      {
        name: 'Склад Бишкек',
        address: 'Ул. Малдыбаева 7/1',
        products: [{ product: _product1._id, amount: 20 }],
        isArchived: false,
      },
      {
        name: 'Склад Москва',
        address: 'Ул. Гагарина 102',
        products: [{ product: _product2._id, amount: 20 }],
        isArchived: false,
      },
      {
        name: 'Склад Санкт-Петербург',
        address: 'Ул. Ленина 100',
        products: [],
        isArchived: true,
      },
      {
        name: 'Склад Кант',
        address: 'Ул. Советская 101',
        products: [],
        isArchived: true,
      },
    ])

    const [_order1, _order2, _order3] = await this.orderModel.create([
      {
        orderNumber: 'ORD-1',
        client: _client_1._id,
        stock: _stock1._id,
        products: [
          { product: _product1._id, description: 'Заказ 1 - Сарафан', amount: 2 },
          { product: _product2._id, description: 'Заказ 1 - Джинсы', amount: 1 },
        ],
        price: 2500,
        sent_at: new Date().toISOString(),
        delivered_at: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        status: 'в сборке',
      },
      {
        orderNumber: 'ORD-2',
        client: _client_1._id,
        stock: _stock2._id,
        products: [
          { product: _product2._id, description: 'Заказ 2 - Джинсы', amount: 2 },
          { product: _product3._id, description: 'Заказ 2 - Футболка', amount: 3 },
        ],
        price: 4500,
        sent_at: new Date().toISOString(),
        delivered_at: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        status: 'в пути',
      },
      {
        orderNumber: 'ORD-3',
        client: _client_1._id,
        stock: _stock1._id,
        products: [
          { product: _product1._id, description: 'Заказ 3 - Сарафан', amount: 1 },
          { product: _product3._id, description: 'Заказ 3 - Футболка', amount: 2 },
        ],
        price: 1900,
        sent_at: new Date().toISOString(),
        delivered_at: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        status: 'доставлен',
      },
    ])

    await this.counterModel.findOneAndUpdate(
      { name: 'order' },
      { $set: { seq: 3 } },
      { upsert: true }
    )


    const [_counterparty1, _counterparty2, _counterparty3] = await this.counterpartyModel.create([
      {
        name: 'ООО "Фулфилмент Партнер"',
        phone_number: '+7 999 123-45-67',
        address: 'Москва, ул. Достоевского, д. 10',
        isArchived: false,
      },
      {
        name: 'ИП Осмонов',
        phone_number: '+996 700 456-789',
        address: 'Бишкек, пр. Чуй, д. 55',
        isArchived: false,
      },
      {
        name: 'OОО "Складской Логистик"',
        phone_number: '+996 500 789-456',
        address: 'Бишкек, пр. Манаса, д. 30',
        isArchived: false,
      },
      {
        name: 'ОсОО "Магнум"',
        phone_number: '+996 550 555-555',
        address: 'Бишкек, ул. Горького, д. 321',
        isArchived: true,
      },
      {
        name: 'ИП Исаев',
        phone_number: '+996 999 999-999',
        address: 'Бишкек, ул. Ахунбаева, д. 54',
        isArchived: true,
      },
    ])

    const [_arrival1, _arrival2, _arrival3] = await this.arrivalModel.create([
      {
        arrivalNumber: 'ARL-1',
        client: _client_1._id,
        products: [{ product: _product1._id, description: '', amount: 20 }],
        arrival_price: 500,
        arrival_date: new Date().toISOString(),
        sent_amount: '2 короба',
        stock: _stock1._id,
        shipping_agent: _counterparty2._id,
        pickup_location: 'Ул. Пушкина, д. 67',
        isArchived: false,
      },
      {
        arrivalNumber: 'ARL-2',
        client: _client_1._id,
        products: [{ product: _product2._id, description: '', amount: 100 }],
        arrival_price: 2500,
        arrival_status: 'получена',
        arrival_date: new Date().toISOString(),
        sent_amount: '2 мешка',
        stock: _stock2._id,
        logs: [
          { user: _User2, change: 'record #1', date: new Date().toISOString() },
          { user: _User1, change: 'record #2', date: new Date().toISOString() },
          { user: _admin, change: 'record #3', date: new Date().toISOString() },
          { user: _User2, change: 'record #4', date: new Date().toISOString() },
        ],
        isArchived: false,
      },
      {
        arrivalNumber: 'ARL-3',
        client: _client_1._id,
        products: [{ product: _product3._id, description: '', amount: 30 }],
        arrival_price: 1000,
        arrival_status: 'отсортирована',
        arrival_date: new Date().toISOString(),
        sent_amount: '5 коробов',
        stock: _stock1._id,
        shipping_agent: _counterparty1._id,
        pickup_location: 'Ул. Авиаторов, д. 88',
        isArchived: false,
      },
      {
        arrivalNumber: 'ARL-4',
        client: _client_1._id,
        products: [{ product: _product1._id, description: '', amount: 30 }],
        arrival_price: 100,
        arrival_status: 'отсортирована',
        arrival_date: new Date().toISOString(),
        sent_amount: '5 коробов',
        stock: _stock1._id,
        shipping_agent: _counterparty1._id,
        pickup_location: 'Ул. Авиаторов, д. 88',
        isArchived: true,
      },
      {
        arrivalNumber: 'ARL-5',
        client: _client_1._id,
        products: [{ product: _product2._id, description: '', amount: 30 }],
        arrival_price: 1200,
        arrival_status: 'отсортирована',
        arrival_date: new Date().toISOString(),
        sent_amount: '5 коробов',
        stock: _stock1._id,
        shipping_agent: _counterparty1._id,
        pickup_location: 'Ул. Авиаторов, д. 88',
        isArchived: true,
      },
    ])

    await this.counterModel.findOneAndUpdate(
      { name: 'arrival' },
      { $set: { seq: 3 } },
      { upsert: true }
    )

    await this.taskModel.create([
      {
        taskNumber: 'TSK-1',
        user: _User1._id,
        title: 'Принять товар из поставки',
        description: 'Проверить товар на дефекты и внести информацию в базу',
        status: 'к выполнению',
        type: 'поставка',
        associated_arrival: _arrival1._id,
      },
      {
        taskNumber: 'TSK-2',
        user: _User2._id,
        title: 'Собрать заказ',
        status: 'в работе',
        type: 'заказ',
        associated_order: _order2._id,
      },
      {
        taskNumber: 'TSK-3',
        user: _User1._id,
        title: 'Упаковка товара для заказа',
        status: 'готово',
        type: 'другое',
        date_Done: '2025-03-29T08:27:17.078Z',
      },
      {
        taskNumber: 'TSK-4',
        user: _User2._id,
        title: 'Проверить складские остатки',
        status: 'в работе',
        type: 'другое',
      },
      {
        taskNumber: 'TSK-5',
        user: _User1._id,
        title: 'Связаться с клиентом по заказу',
        status: 'готово',
        type: 'заказ',
        associated_order: _order2._id,
        date_Done: '2025-03-23T08:27:17.078Z',
      },
      {
        taskNumber: 'TSK-6',
        user: _User4._id,
        title: 'Связаться с клиентом по заказу',
        status: 'готово',
        type: 'заказ',
        associated_order: _order2._id,
        date_Done: '2025-03-20T08:27:17.078Z',
      },
      {
        taskNumber: 'TSK-7',
        user: _User3._id,
        title: 'Связаться с клиентом по заказу',
        status: 'готово',
        type: 'заказ',
        associated_order: _order2._id,
        date_Done: '2025-03-21T08:27:17.078Z',
      },
      {
        taskNumber: 'TSK-8',
        user: _User3._id,
        title: 'Связаться с клиентом по заказу',
        status: 'готово',
        type: 'заказ',
        associated_order: _order2._id,
        date_Done: '2025-03-22T08:27:17.078Z',
      },
      {
        taskNumber: 'TSK-9',
        user: _User1._id,
        title: 'Решить вопрос по начислению оплаты по заказу',
        status: 'готово',
        type: 'заказ',
        associated_order: _order2._id,
        date_Done: '2025-03-23T08:27:17.078Z',
      },
      {
        taskNumber: 'TSK-10',
        user: _User5._id,
        title: 'Связаться с клиентом ',
        status: 'готово',
        type: 'другое',
        date_Done: '2025-03-26T08:27:17.078Z',
      },
      {
        taskNumber: 'TSK-11',
        user: _User6._id,
        title: 'Узнать информацию у клиента по прибытию поставки ',
        status: 'к выполнению',
        type: 'поставка',
        associated_arrival: _arrival2._id,
        date_Done: '2025-03-28T08:27:17.078Z',
      },
    ])

    await this.counterModel.findOneAndUpdate(
      { name: 'task' },
      { $set: { seq: 11 } },
      { upsert: true }
    )

    const [_serviceCat1, _serviceCat2] = await this.serviceCategoryModel.create([
      {
        name: 'Работа с товаром',
        isArchived: false,
      },
      {
        name: 'Дополнительные услуги',
        isArchived: false,
      }]
    )

    await this.serviceModel.create([
      {
        name: 'Приемка, пересчет товара',
        price: 50000,
        serviceCategory: _serviceCat1._id,
      },
      {
        name: 'Маркировка двойная',
        price: 30000,
        serviceCategory: _serviceCat1._id,
      },
      {
        name: 'Погрузка-Разгрузка на складе фулфилмента',
        price: 70000,
        serviceCategory: _serviceCat2._id,
      },
      {
        name: 'Забор с другого адреса',
        serviceCategory: _serviceCat2._id,
        price: 100000,
      },
    ])
  }
}

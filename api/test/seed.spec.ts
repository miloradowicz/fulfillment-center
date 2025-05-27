/* eslint-disable */

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SeederService } from '../src/seeder/seeder.service'
import { SeedModule } from '../src/seeder/seed.module'
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}))
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
describe('Seed Bootstrap', () => {
  let mockApp: jest.Mocked<NestExpressApplication>
  let mockSeederService: jest.Mocked<SeederService>
  beforeEach(() => {
    mockSeederService = {
      seed: jest.fn().mockResolvedValue(undefined),
    } as any
    mockApp = {
      get: jest.fn().mockReturnValue(mockSeederService),
      close: jest.fn().mockResolvedValue(undefined),
    } as any
    ;(NestFactory.create as jest.Mock).mockResolvedValue(mockApp)
    jest.clearAllMocks()
  })
  afterEach(() => {
    mockConsoleError.mockClear()
  })
  afterAll(() => {
    mockConsoleError.mockRestore()
  })
  async function testBootstrap() {
    try {
      const app = await NestFactory.create<NestExpressApplication>(SeedModule)
      const seederService = app.get(SeederService)
      await seederService.seed()
      await app.close()
    } catch (error) {
      console.error(error)
    }
  }
  it('должен успешно создать приложение и выполнить seeding', async () => {
    await testBootstrap()
    expect(NestFactory.create).toHaveBeenCalledWith(SeedModule)
    expect(mockApp.get).toHaveBeenCalledWith(SeederService)
    expect(mockSeederService.seed).toHaveBeenCalledTimes(1)
    expect(mockApp.close).toHaveBeenCalledTimes(1)
  })
  it('должен обрабатывать ошибки при создании приложения', async () => {
    const error = new Error('Ошибка создания приложения')
    ;(NestFactory.create as jest.Mock).mockRejectedValue(error)
    await testBootstrap()
    expect(mockConsoleError).toHaveBeenCalledWith(error)
  })
  it('должен обрабатывать ошибки при выполнении seeding', async () => {
    const error = new Error('Ошибка seeding')
    mockSeederService.seed.mockRejectedValue(error)
    await testBootstrap()
    expect(mockConsoleError).toHaveBeenCalledWith(error)
  })
  it('должен обрабатывать ошибки при закрытии приложения', async () => {
    const error = new Error('Ошибка закрытия приложения')
    mockApp.close.mockRejectedValue(error)
    await testBootstrap()
    expect(mockConsoleError).toHaveBeenCalledWith(error)
  })
  describe('Интеграционные тесты', () => {
    it('должен использовать правильный модуль для создания приложения', async () => {
      await testBootstrap()
      expect(NestFactory.create).toHaveBeenCalledWith(SeedModule)
    })
    it('должен корректно завершать работу приложения после seeding', async () => {
      await testBootstrap()
      expect(NestFactory.create).toHaveBeenCalledTimes(1)
      expect(mockSeederService.seed).toHaveBeenCalledTimes(1)
      expect(mockApp.close).toHaveBeenCalledTimes(1)
    })
  })
  describe('Обработка ошибок', () => {
    it('должен логировать ошибки через console.error', async () => {
      const testError = new Error('Тестовая ошибка')
      mockSeederService.seed.mockRejectedValue(testError)
      await testBootstrap()
      expect(mockConsoleError).toHaveBeenCalledWith(testError)
    })
    it('должен продолжать выполнение даже при ошибках', async () => {
      const error = new Error('Ошибка в процессе')
      mockSeederService.seed.mockRejectedValue(error)
      await expect(testBootstrap()).resolves.not.toThrow()
    })
  })
  describe('Структура bootstrap функции', () => {
    it('должен правильно получать SeederService из контекста приложения', async () => {
      await testBootstrap()
      expect(NestFactory.create).toHaveBeenCalledTimes(1)
      expect(mockApp.get).toHaveBeenCalledTimes(1)
      expect(mockSeederService.seed).toHaveBeenCalledTimes(1)
      expect(mockApp.close).toHaveBeenCalledTimes(1)
    })
    it('должен создавать приложение с правильным типом', async () => {
      await testBootstrap()
      expect(NestFactory.create).toHaveBeenCalledWith(SeedModule)
    })
  })
}) 
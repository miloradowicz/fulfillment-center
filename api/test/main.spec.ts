/* eslint-disable */

const mockApp = {
  select: jest.fn().mockReturnThis(),
  use: jest.fn(),
  enableCors: jest.fn(),
  useGlobalGuards: jest.fn(),
  useGlobalPipes: jest.fn(),
  useGlobalFilters: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockReturnValue({ validateToken: jest.fn(), validateRoles: jest.fn() })
}
const mockNestFactory = {
  create: jest.fn().mockResolvedValue(mockApp)
}
const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}
const mockUseContainer = jest.fn()
const mockCookieParser = jest.fn()
const mockCsurf = jest.fn(() => jest.fn())
const mockExpress = {
  static: jest.fn(),
  json: jest.fn(),
  urlencoded: jest.fn()
}
jest.mock('@nestjs/core', () => ({
  NestFactory: mockNestFactory
}))
jest.mock('../src/app.module', () => ({
  AppModule: class MockAppModule {}
}))
jest.mock('../src/config', () => ({
  default: {
    server: {
      port: 3000,
      sslPrivateKeyLocation: '/path/to/privkey.pem',
      sslCertificateLocation: '/path/to/fullchain.pem',
      uploadsPath: '/uploads'
    },
    csrf: {
      origin: ['http://localhost:3000']
    }
  }
}))
jest.mock('fs', () => mockFs)
jest.mock('cookie-parser', () => mockCookieParser)
jest.mock('csurf', () => mockCsurf)
jest.mock('express', () => mockExpress)
jest.mock('class-validator', () => ({
  useContainer: mockUseContainer
}))
jest.mock('../src/guards/token-auth.guard', () => ({
  TokenAuthGuard: jest.fn().mockImplementation(() => ({ canActivate: jest.fn() }))
}))
jest.mock('../src/guards/roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => ({ canActivate: jest.fn() }))
}))
jest.mock('../src/services/token-auth.service', () => ({
  TokenAuthService: jest.fn()
}))
jest.mock('../src/services/roles.service', () => ({
  RolesService: jest.fn()
}))
jest.mock('../src/exception-filters/dto-validation-error.filter', () => ({
  DtoValidationErrorFilter: jest.fn().mockImplementation(() => ({ catch: jest.fn() })),
  DtoValidationError: jest.fn()
}))
jest.mock('../src/exception-filters/mongo-cast-error.filter', () => ({
  CastErrorFilter: jest.fn().mockImplementation(() => ({ catch: jest.fn() }))
}))
jest.mock('../src/exception-filters/mongo-validation-error.filter', () => ({
  ValidationErrorFilter: jest.fn().mockImplementation(() => ({ catch: jest.fn() }))
}))
describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })
  describe('bootstrap function behavior', () => {
    it('должна создать NestJS приложение с HTTPS опциями когда SSL сертификаты существуют', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValueOnce('private-key-content' as any)
      mockFs.readFileSync.mockReturnValueOnce('certificate-content' as any)
      await import('../src/main')
      expect(mockNestFactory.create).toHaveBeenCalledWith(expect.any(Function), {
        httpsOptions: {
          key: 'private-key-content',
          cert: 'certificate-content'
        }
      })
    })
    it('должна создать NestJS приложение без HTTPS опций когда SSL сертификаты не существуют', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockNestFactory.create).toHaveBeenCalledWith(expect.any(Function), {
        httpsOptions: undefined
      })
    })
    it('должна настроить статические файлы для uploads', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.use).toHaveBeenCalledWith('/uploads', mockExpress.static('/uploads'))
    })
    it('должна настроить middleware для парсинга JSON и URL-encoded данных', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.use).toHaveBeenCalledWith(mockExpress.json({ limit: '10mb' }))
      expect(mockApp.use).toHaveBeenCalledWith(mockExpress.urlencoded({ limit: '10mb', extended: true }))
    })
    it('должна настроить cookie parser', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.use).toHaveBeenCalledWith(mockCookieParser())
    })
    it('должна настроить CSRF защиту', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockCsurf).toHaveBeenCalledWith({
        cookie: {
          httpOnly: true,
          sameSite: 'strict',
          secure: false
        }
      })
    })
    it('должна настроить CORS с правильными параметрами', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.enableCors).toHaveBeenCalledWith({
        credentials: true,
        origin: ['http://localhost:3000']
      })
    })
    it('должна настроить глобальные guards', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.useGlobalGuards).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      )
    })
    it('должна настроить глобальные pipes с правильной конфигурацией', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
        expect.objectContaining({
          isTransformEnabled: true
        })
      )
    })
    it('должна настроить глобальные exception filters', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.useGlobalFilters).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.any(Object)
      )
    })
    it('должна запустить приложение на правильном порту', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.listen).toHaveBeenCalledWith(3000)
    })
    it('должна настроить class-validator container', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockUseContainer).toHaveBeenCalledWith(mockApp, { fallbackOnErrors: true })
    })
    it('должна правильно читать SSL сертификаты когда они существуют', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync
        .mockReturnValueOnce('private-key-content' as any)
        .mockReturnValueOnce('certificate-content' as any)
      await import('../src/main')
      expect(mockFs.existsSync).toHaveBeenCalledWith('/path/to/privkey.pem')
      expect(mockFs.existsSync).toHaveBeenCalledWith('/path/to/fullchain.pem')
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/path/to/privkey.pem')
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/path/to/fullchain.pem')
    })
    it('должна создать ValidationPipe с правильной конфигурацией', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
        expect.objectContaining({
          isTransformEnabled: true,
          transformOptions: expect.objectContaining({
            enableImplicitConversion: true
          })
        })
      )
    })
  })
  describe('SSL configuration', () => {
    it('должна проверить существование обоих SSL файлов', async () => {
      mockFs.existsSync.mockImplementation((path) => {
        if (path === '/path/to/privkey.pem') return true
        if (path === '/path/to/fullchain.pem') return false
        return false
      })
      await import('../src/main')
      expect(mockNestFactory.create).toHaveBeenCalledWith(expect.any(Function), {
        httpsOptions: undefined
      })
    })
    it('должна создать HTTPS опции только когда оба файла существуют', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync
        .mockReturnValueOnce('key-content' as any)
        .mockReturnValueOnce('cert-content' as any)
      await import('../src/main')
      expect(mockNestFactory.create).toHaveBeenCalledWith(expect.any(Function), {
        httpsOptions: {
          key: 'key-content',
          cert: 'cert-content'
        }
      })
    })
  })
  describe('error handling', () => {
    it('должна обработать ошибку при запуске приложения', async () => {
      mockFs.existsSync.mockReturnValue(false)
      const error = new Error('Ошибка запуска')
      mockApp.listen.mockRejectedValue(error)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      await import('../src/main')
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(consoleSpy).toHaveBeenCalledWith(error)
      consoleSpy.mockRestore()
    })
  })
  describe('configuration validation', () => {
    it('должна использовать правильные настройки для ValidationPipe', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      const pipeCall = mockApp.useGlobalPipes.mock.calls[0][0]
      expect(pipeCall.constructor.name).toBe('ValidationPipe')
      expect(pipeCall.isTransformEnabled).toBe(true)
      expect(pipeCall.transformOptions.enableImplicitConversion).toBe(true)
    })
    it('должна настроить правильные параметры для CSURF', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockCsurf).toHaveBeenCalledWith({
        cookie: {
          httpOnly: true,
          sameSite: 'strict',
          secure: false
        }
      })
    })
    it('должна настроить правильные лимиты для body parser', async () => {
      mockFs.existsSync.mockReturnValue(false)
      await import('../src/main')
      expect(mockExpress.json).toHaveBeenCalledWith({ limit: '10mb' })
      expect(mockExpress.urlencoded).toHaveBeenCalledWith({ limit: '10mb', extended: true })
    })
  })
})

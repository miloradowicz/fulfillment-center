// Мокируем dayjs перед всеми импортами
jest.mock('dayjs', () => {
  const mockDayjs: any = jest.fn(() => ({
    format: jest.fn(() => '2023-01-01'),
    toDate: jest.fn(() => new Date('2023-01-01')),
    isValid: jest.fn(() => true),
    locale: jest.fn(),
  }))
  
  mockDayjs.locale = jest.fn()
  mockDayjs.extend = jest.fn()
  
  return mockDayjs
})

// Мокируем import.meta.env
const mockImportMeta = {
  env: {
    VITE_API_HOST: 'http://localhost:8000',
    NODE_ENV: 'test',
    VITE_FEATURE_PROTECTION: 'false',
  },
}

// Устанавливаем глобальный мок
Object.defineProperty(globalThis, 'import', {
  value: { meta: mockImportMeta },
  writable: true,
  configurable: true,
})

// Дополнительная проверка
if (typeof (globalThis as any).import === 'undefined') {
  (globalThis as any).import = { meta: mockImportMeta }
}

// Мокируем constants
jest.mock('@/constants', () => ({
  apiHost: 'http://localhost:8000',
  OrderStatus: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  featureProtection: process.env.VITE_FEATURE_PROTECTION === 'true',
}))

import '@testing-library/jest-dom'

// Мокируем window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Мокируем ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Мокируем IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Мокируем HTMLFormElement.prototype.requestSubmit
HTMLFormElement.prototype.requestSubmit = jest.fn()

// Мокируем navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
  writable: true,
})

// Мокируем document.execCommand
document.execCommand = jest.fn(() => true)

// Подавляем console.error для тестов
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 
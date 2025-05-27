/* eslint-disable */
import { mockButton, mockIcons } from './__mocks__/common.tsx'

// Мокируем @/components/ui/button один раз для всех тестов
jest.mock('@/components/ui/button', () => ({
  Button: mockButton
}))

// Мокируем lucide-react один раз для всех тестов
jest.mock('lucide-react', () => mockIcons)

// Мокируем window.history для BackButton
Object.defineProperty(window, 'history', {
  value: {
    back: jest.fn()
  },
  writable: true
}) 
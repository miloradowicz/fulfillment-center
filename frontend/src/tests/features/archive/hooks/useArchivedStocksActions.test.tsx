/* eslint-disable */
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import useArchivedStocksActions from '@/features/archive/hooks/useArchivedStocksActions.ts'
import { useAppSelector } from '@/app/hooks.ts'
import { selectAllArchivedStocks, selectLoadingFetchArchivedStocks } from '@/store/slices/stocksSlice.ts'
import { selectUser } from '@/store/slices/authSlice'

// Простые моки
const mockDispatch = jest.fn()
const mockNavigate = jest.fn()

// Мокируем зависимости
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@/app/hooks.ts', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}))

describe('useArchivedStocksActions Hook', () => {
  const createWrapper = () => {
    const store = configureStore({
      reducer: {
        auth: (state = {}) => state,
        stocks: (state = {}) => state,
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Правильно настраиваем mockDispatch для возврата thunk с unwrap
    mockDispatch.mockImplementation(() => ({
      unwrap: jest.fn().mockResolvedValue({})
    }))
    
    // Настраиваем мок useAppSelector
    ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectAllArchivedStocks) {
        return [
          { _id: '1', name: 'Stock 1', address: 'Address 1' },
          { _id: '2', name: 'Stock 2', address: 'Address 2' },
        ]
      }
      if (selector === selectLoadingFetchArchivedStocks) {
        return false
      }
      if (selector === selectUser) {
        return { _id: 'user1', role: 'manager' }
      }
      return null
    })
  })

  describe('Инициализация хука', () => {
    it('должен возвращать правильные начальные значения', () => {
      const { result } = renderHook(() => useArchivedStocksActions(), {
        wrapper: createWrapper(),
      })

      expect(result.current.stocks).toHaveLength(2)
      expect(result.current.loading).toBe(false)
      expect(result.current.confirmationOpen).toBe(false)
      expect(result.current.actionType).toBe('delete')
      expect(typeof result.current.handleConfirmationOpen).toBe('function')
      expect(typeof result.current.handleConfirmationClose).toBe('function')
      expect(typeof result.current.handleConfirmationAction).toBe('function')
    })
  })

  describe('Управление модальным окном подтверждения', () => {
    it('должен открывать модальное окно для удаления', () => {
      const { result } = renderHook(() => useArchivedStocksActions(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleConfirmationOpen('stock1', 'delete')
      })

      expect(result.current.confirmationOpen).toBe(true)
      expect(result.current.actionType).toBe('delete')
    })

    it('должен открывать модальное окно для восстановления', () => {
      const { result } = renderHook(() => useArchivedStocksActions(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleConfirmationOpen('stock1', 'unarchive')
      })

      expect(result.current.confirmationOpen).toBe(true)
      expect(result.current.actionType).toBe('unarchive')
    })

    it('должен закрывать модальное окно', () => {
      const { result } = renderHook(() => useArchivedStocksActions(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleConfirmationOpen('stock1', 'delete')
      })

      expect(result.current.confirmationOpen).toBe(true)

      act(() => {
        result.current.handleConfirmationClose()
      })

      expect(result.current.confirmationOpen).toBe(false)
    })
  })

  describe('Выполнение действий', () => {
    it('должен вызывать dispatch при выполнении действия', async () => {
      const { result } = renderHook(() => useArchivedStocksActions(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.handleConfirmationOpen('stock1', 'delete')
      })

      await act(async () => {
        await result.current.handleConfirmationAction()
      })

      expect(mockDispatch).toHaveBeenCalled()
      expect(result.current.confirmationOpen).toBe(false)
    })

    it('не должен выполнять действие если stockToActionId не установлен', async () => {
      const { result } = renderHook(() => useArchivedStocksActions(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.handleConfirmationAction()
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })
}) 
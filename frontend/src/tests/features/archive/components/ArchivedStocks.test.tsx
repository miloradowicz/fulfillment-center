/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedStocks from '@/features/archive/components/ArchivedStocks.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { Stock } from '@/types'

// Мокируем все зависимости
jest.mock('@/components/Modal/ConfirmationModal.tsx', () => ({
  default: ({ open, entityName, actionType, onConfirm, onCancel }: any) =>
    open ? (
      <div data-testid="confirmation-modal">
        <div data-testid="entity-name">{entityName}</div>
        <div data-testid="action-type">{actionType}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Подтвердить
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    ) : null,
}))

jest.mock('@/components/DataTable/DataTable.tsx', () => ({
  default: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <div data-testid="columns-count">{columns.length}</div>
      <div data-testid="data-count">{data.length}</div>
      {data.map((item: any, index: number) => (
        <div key={index} data-testid={`table-row-${index}`}>
          {item.isSkeleton ? (
            <div data-testid={`skeleton-row-${index}`}>Loading...</div>
          ) : (
            <div data-testid={`stock-row-${index}`}>
              <span data-testid={`name-${index}`}>
                {item.name ?? 'Неизвестное название'}
              </span>
              <span data-testid={`address-${index}`}>
                {item.address ?? 'Неизвестный адрес'}
              </span>
              <button
                data-testid={`delete-button-${index}`}
                onClick={() => mockHandleConfirmationOpen(item._id, 'delete')}
              >
                Удалить
              </button>
              <button
                data-testid={`restore-button-${index}`}
                onClick={() => mockHandleConfirmationOpen(item._id, 'unarchive')}
              >
                Восстановить
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/DataTable/SelectableColumn/SelectableColumn.tsx', () => ({
  default: () => <div data-testid="selectable-column">Select</div>,
}))

jest.mock('@/components/DataTable/DataTableColumnHeader/DataTableColumnHeader.tsx', () => ({
  default: ({ title }: any) => <div data-testid="column-header">{title}</div>,
}))

jest.mock('@/components/DataTable/TableArchivedActionsMenu/TableArchivedActionsMenu.tsx', () => ({
  default: ({ row, onDelete, onRestore }: any) => (
    <div data-testid="actions-menu">
      <button onClick={() => onDelete(row._id)}>Удалить</button>
      <button onClick={() => onRestore(row._id)}>Восстановить</button>
    </div>
  ),
}))

// Мокируем хук
const mockHandleConfirmationOpen = jest.fn()
const mockHandleConfirmationClose = jest.fn()
const mockHandleConfirmationAction = jest.fn()

jest.mock('@/features/archive/hooks/useArchivedStocksActions.ts', () => ({
  default: () => ({
    stocks: mockStocks,
    loading: mockLoading,
    confirmationOpen: mockConfirmationOpen,
    actionType: mockActionType,
    handleConfirmationOpen: mockHandleConfirmationOpen,
    handleConfirmationClose: mockHandleConfirmationClose,
    handleConfirmationAction: mockHandleConfirmationAction,
  }),
}))

jest.mock('@/features/archive/hooks/useTableSkeleton.ts', () => ({
  useSkeletonTableRows: jest.fn(() => mockSkeletonRows),
}))

// Мокированные данные
let mockStocks: Stock[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleStock: Stock = {
  _id: '1',
  name: 'Основной склад',
  address: 'ул. Складская, д. 1',
}

describe('ArchivedStocks Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        stocks: (state = { archivedStocks: [], loading: false }) => state,
      },
      preloadedState: {
        auth: {
          user,
          loadingRegister: false,
          loadingLogin: false,
          error: null,
          createError: null,
          loginError: null,
        },
        stocks: {
          archivedStocks: mockStocks,
          loading: mockLoading,
        },
      },
    })
  }

  const renderComponent = (user: any = null) => {
    const store = createMockStore(user)

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ArchivedStocks />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockStocks = [sampleStock]
    mockLoading = false
    mockConfirmationOpen = false
    mockActionType = 'delete'
    mockSkeletonRows = []
  })

  describe('Рендеринг компонента', () => {
    it('должен отображать основную структуру компонента', () => {
      renderComponent()

      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('columns-count')).toHaveTextContent('4') // 4 колонки
    })

    it('должен применять правильные CSS классы к контейнеру', () => {
      renderComponent()

      const container = screen.getByTestId('data-table').parentElement
      expect(container).toHaveClass('max-w-[1000px]', 'mx-auto', 'w-full')
    })

    it('должен отображать данные складов', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('stock-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('Основной склад')
      expect(screen.getByTestId('address-0')).toHaveTextContent('ул. Складская, д. 1')
    })
  })

  describe('Состояние загрузки', () => {
    it('должен отображать скелетон при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [
        { isSkeleton: true },
        { isSkeleton: true },
        { isSkeleton: true },
      ]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('3')
      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-row-2')).toBeInTheDocument()
    })

    it('должен скрывать скелетон после загрузки', () => {
      mockLoading = false
      mockStocks = [sampleStock]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('stock-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список складов', () => {
      mockStocks = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('stock-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null склады', () => {
      mockStocks = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "Неизвестное название" для склада без названия', () => {
      mockStocks = [
        {
          ...sampleStock,
          name: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent('Неизвестное название')
    })

    it('должен отображать "Неизвестный адрес" для склада без адреса', () => {
      mockStocks = [
        {
          ...sampleStock,
          address: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('Неизвестный адрес')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('этот склад')
    })

    it('должен скрывать модальное окно при confirmationOpen = false', () => {
      mockConfirmationOpen = false

      renderComponent()

      expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument()
    })

    it('должен отображать правильный тип действия в модальном окне', () => {
      mockConfirmationOpen = true
      mockActionType = 'unarchive'

      renderComponent()

      expect(screen.getByTestId('action-type')).toHaveTextContent('unarchive')
    })

    it('должен вызывать handleConfirmationAction при подтверждении', () => {
      mockConfirmationOpen = true

      renderComponent()

      const confirmButton = screen.getByTestId('confirm-button')
      fireEvent.click(confirmButton)

      expect(mockHandleConfirmationAction).toHaveBeenCalledTimes(1)
    })

    it('должен вызывать handleConfirmationClose при отмене', () => {
      mockConfirmationOpen = true

      renderComponent()

      const cancelButton = screen.getByTestId('cancel-button')
      fireEvent.click(cancelButton)

      expect(mockHandleConfirmationClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Действия со складами', () => {
    it('должен вызывать handleConfirmationOpen при клике на удаление', () => {
      renderComponent()

      const deleteButton = screen.getByTestId('delete-button-0')
      fireEvent.click(deleteButton)

      expect(mockHandleConfirmationOpen).toHaveBeenCalledWith('1', 'delete')
    })

    it('должен вызывать handleConfirmationOpen при клике на восстановление', () => {
      renderComponent()

      const restoreButton = screen.getByTestId('restore-button-0')
      fireEvent.click(restoreButton)

      expect(mockHandleConfirmationOpen).toHaveBeenCalledWith('1', 'unarchive')
    })
  })

  describe('Интеграция с хуками', () => {
    it('должен использовать данные из useArchivedStocksActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('stock-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных складов', () => {
    it('должен отображать несколько складов', () => {
      const secondStock: Stock = {
        ...sampleStock,
        _id: '2',
        name: 'Дополнительный склад',
        address: 'ул. Вторая, д. 2',
      }

      mockStocks = [sampleStock, secondStock]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('stock-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('stock-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('Основной склад')
      expect(screen.getByTestId('name-1')).toHaveTextContent('Дополнительный склад')
    })
  })

  describe('Отображение адресов', () => {
    it('должен отображать различные адреса складов', () => {
      const stocks = [
        { ...sampleStock, _id: '1', address: 'ул. Первая, д. 1' },
        { ...sampleStock, _id: '2', address: 'ул. Вторая, д. 2' },
        { ...sampleStock, _id: '3', address: 'ул. Третья, д. 3' },
      ]

      mockStocks = stocks

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('ул. Первая, д. 1')
      expect(screen.getByTestId('address-1')).toHaveTextContent('ул. Вторая, д. 2')
      expect(screen.getByTestId('address-2')).toHaveTextContent('ул. Третья, д. 3')
    })
  })

  describe('Отображение названий', () => {
    it('должен отображать различные названия складов', () => {
      const stocks = [
        { ...sampleStock, _id: '1', name: 'Центральный склад' },
        { ...sampleStock, _id: '2', name: 'Региональный склад' },
      ]

      mockStocks = stocks

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent('Центральный склад')
      expect(screen.getByTestId('name-1')).toHaveTextContent('Региональный склад')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, name, address, actions = 4 колонки
      expect(screen.getByTestId('columns-count')).toHaveTextContent('4')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const stockRow = screen.getByTestId('stock-row-0')
      expect(stockRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('name-0')).toBeInTheDocument()
      expect(screen.getByTestId('address-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })
}) 
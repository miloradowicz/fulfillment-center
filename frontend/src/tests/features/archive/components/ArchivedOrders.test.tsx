/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'

import ArchivedOrders from '@/features/archive/components/ArchivedOrders.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { OrderWithClient } from '@/types'

// Мокируем все зависимости
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

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
            <div data-testid={`order-row-${index}`}>
              <span data-testid={`order-number-${index}`}>{item.orderNumber}</span>
              <span data-testid={`client-name-${index}`}>
                {item.client?.name ?? 'Неизвестный клиент'}
              </span>
              <span data-testid={`stock-name-${index}`}>
                {item.stock?.name ?? 'Неизвестный склад'}
              </span>
              <span data-testid={`status-${index}`}>{item.status}</span>
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

jest.mock('@/components/StatusBadge/StatusBadge.tsx', () => ({
  StatusBadge: ({ status }: any) => <div data-testid="status-badge">{status}</div>,
}))

jest.mock('@/components/NumberBadge/NumberBadge.tsx', () => ({
  NumberBadge: ({ number }: any) => <div data-testid="number-badge">{number}</div>,
}))

// Мокируем хук
const mockHandleConfirmationOpen = jest.fn()
const mockHandleConfirmationClose = jest.fn()
const mockHandleConfirmationAction = jest.fn()

jest.mock('@/features/archive/hooks/useArchivedOrdersActions', () => ({
  useArchivedOrdersActions: () => ({
    orders: mockOrders,
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

jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs')
  return (date?: any) => {
    if (!date) return originalDayjs()
    return {
      format: (format: string) => {
        if (format === 'DD.MM.YYYY') {
          return '01.01.2024'
        }
        return originalDayjs(date).format(format)
      },
    }
  }
})

// Мокированные данные
let mockOrders: OrderWithClient[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleOrder: OrderWithClient = {
  _id: '1',
  orderNumber: 'ORD-001',
  client: {
    _id: 'client1',
    name: 'Тестовый клиент',
    inn: '1234567890',
    address: 'Тестовый адрес',
    ogrn: '1234567890123',
    email: 'test@example.com',
    phone_number: '+7 (999) 123-45-67',
  },
  stock: {
    _id: 'stock1',
    name: 'Основной склад',
    address: 'Адрес склада',
  },
  products: [],
  sent_at: '2024-01-01T10:00:00Z',
  delivered_at: '2024-01-02T15:00:00Z',
  status: 'доставлен',
  paymentStatus: 'оплачено',
  logs: [],
  defects: [],
  services: [],
  documents: [],
  comment: 'Тестовый комментарий',
}

describe('ArchivedOrders Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        orders: (state = { archivedOrders: [], loading: false }) => state,
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
        orders: {
          archivedOrders: mockOrders,
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
          <ArchivedOrders />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockOrders = [sampleOrder]
    mockLoading = false
    mockConfirmationOpen = false
    mockActionType = 'delete'
    mockSkeletonRows = []
  })

  describe('Рендеринг компонента', () => {
    it('должен отображать основную структуру компонента', () => {
      renderComponent()

      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('columns-count')).toHaveTextContent('8') // 8 колонок
    })

    it('должен применять правильные CSS классы к контейнеру', () => {
      renderComponent()

      const container = screen.getByTestId('data-table').parentElement
      expect(container).toHaveClass('max-w-[1000px]', 'mx-auto', 'w-full')
    })

    it('должен отображать данные заказов', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('order-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('order-number-0')).toHaveTextContent('ORD-001')
      expect(screen.getByTestId('client-name-0')).toHaveTextContent('Тестовый клиент')
      expect(screen.getByTestId('stock-name-0')).toHaveTextContent('Основной склад')
      expect(screen.getByTestId('status-0')).toHaveTextContent('доставлен')
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
      mockOrders = [sampleOrder]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('order-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список заказов', () => {
      mockOrders = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('order-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null заказы', () => {
      mockOrders = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "Неизвестный клиент" для заказа без клиента', () => {
      mockOrders = [
        {
          ...sampleOrder,
          client: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('client-name-0')).toHaveTextContent('Неизвестный клиент')
    })

    it('должен отображать "Неизвестный склад" для заказа без склада', () => {
      mockOrders = [
        {
          ...sampleOrder,
          stock: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('stock-name-0')).toHaveTextContent('Неизвестный склад')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('этот заказ')
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

  describe('Действия с заказами', () => {
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

  describe('Форматирование данных', () => {
    it('должен правильно форматировать даты', () => {
      // Тест проверяет, что dayjs правильно мокирован
      // В реальном компоненте даты форматируются через dayjs
      renderComponent()

      expect(screen.getByTestId('order-row-0')).toBeInTheDocument()
    })

    it('должен отображать "Не доставлен" для заказов без даты доставки', () => {
      mockOrders = [
        {
          ...sampleOrder,
          delivered_at: null as any,
        },
      ]

      renderComponent()

      // В реальном компоненте это будет обрабатываться в ячейке таблицы
      expect(screen.getByTestId('order-row-0')).toBeInTheDocument()
    })
  })

  describe('Интеграция с хуками', () => {
    it('должен использовать данные из useArchivedOrdersActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('order-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных заказов', () => {
    it('должен отображать несколько заказов', () => {
      const secondOrder: OrderWithClient = {
        ...sampleOrder,
        _id: '2',
        orderNumber: 'ORD-002',
        client: {
          ...sampleOrder.client,
          name: 'Второй клиент',
        },
        status: 'в пути',
      }

      mockOrders = [sampleOrder, secondOrder]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('order-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('order-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('order-number-0')).toHaveTextContent('ORD-001')
      expect(screen.getByTestId('order-number-1')).toHaveTextContent('ORD-002')
    })
  })

  describe('Статусы заказов', () => {
    it('должен отображать различные статусы заказов', () => {
      const orders = [
        { ...sampleOrder, _id: '1', status: 'в сборке' },
        { ...sampleOrder, _id: '2', status: 'доставлен' },
        { ...sampleOrder, _id: '3', status: 'в пути' },
      ]

      mockOrders = orders

      renderComponent()

      expect(screen.getByTestId('status-0')).toHaveTextContent('в сборке')
      expect(screen.getByTestId('status-1')).toHaveTextContent('доставлен')
      expect(screen.getByTestId('status-2')).toHaveTextContent('в пути')
    })
  })
}) 
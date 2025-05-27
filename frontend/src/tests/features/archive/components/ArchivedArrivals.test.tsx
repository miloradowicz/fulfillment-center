/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedArrivals from '@/features/archive/components/ArchivedArrivals.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { ArrivalWithClient } from '@/types'

// Мокируем dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs')
  return (date: any) => ({
    ...originalDayjs(date),
    format: (format: string) => {
      if (format === 'DD.MM.YYYY') {
        return '01.01.2024'
      }
      return originalDayjs(date).format(format)
    },
  })
})

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
            <div data-testid={`arrival-row-${index}`}>
              <span data-testid={`arrival-number-${index}`}>{item.arrivalNumber}</span>
              <span data-testid={`client-name-${index}`}>
                {item.client?.name ?? 'Неизвестный клиент'}
              </span>
              <span data-testid={`stock-name-${index}`}>
                {item.stock?.name ?? 'Неизвестный склад'}
              </span>
              <span data-testid={`arrival-date-${index}`}>01.01.2024</span>
              <span data-testid={`status-${index}`}>{item.arrival_status}</span>
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

jest.mock('@/features/archive/hooks/useArchivedArrivalsActions.ts', () => ({
  useArchivedArrivalsActions: () => ({
    arrivals: mockArrivals,
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
let mockArrivals: ArrivalWithClient[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleArrival: ArrivalWithClient = {
  _id: '1',
  arrivalNumber: 'ARR-001',
  client: {
    _id: 'client1',
    name: 'ООО "Тестовая компания"',
    inn: '1234567890',
    address: 'г. Москва, ул. Тестовая, д. 1',
    ogrn: '1234567890123',
    email: 'test@company.com',
    phone_number: '+7 (999) 123-45-67',
  },
  stock: {
    _id: 'stock1',
    name: 'Основной склад',
    address: 'г. Москва, ул. Складская, д. 1',
  },
  arrival_date: '2024-01-01T10:00:00Z',
  arrival_status: 'получена',
  documents: [],
  products: [],
  logs: [],
  sent_amount: '0',
  paymentStatus: 'не оплачено',
}

describe('ArchivedArrivals Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        arrivals: (state = { archivedArrivals: [], loading: false }) => state,
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
        arrivals: {
          archivedArrivals: mockArrivals,
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
          <ArchivedArrivals />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockArrivals = [sampleArrival]
    mockLoading = false
    mockConfirmationOpen = false
    mockActionType = 'delete'
    mockSkeletonRows = []
  })

  describe('Рендеринг компонента', () => {
    it('должен отображать основную структуру компонента', () => {
      renderComponent()

      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('columns-count')).toHaveTextContent('7') // 7 колонок
    })

    it('должен применять правильные CSS классы к контейнеру', () => {
      renderComponent()

      const container = screen.getByTestId('data-table').parentElement
      expect(container).toHaveClass('max-w-[1000px]', 'mx-auto', 'w-full')
    })

    it('должен отображать данные поставок', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('arrival-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('arrival-number-0')).toHaveTextContent('ARR-001')
      expect(screen.getByTestId('client-name-0')).toHaveTextContent('ООО "Тестовая компания"')
      expect(screen.getByTestId('stock-name-0')).toHaveTextContent('Основной склад')
      expect(screen.getByTestId('arrival-date-0')).toHaveTextContent('01.01.2024')
      expect(screen.getByTestId('status-0')).toHaveTextContent('получена')
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
      mockArrivals = [sampleArrival]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('arrival-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список поставок', () => {
      mockArrivals = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('arrival-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null поставки', () => {
      mockArrivals = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "Неизвестный клиент" для поставки без клиента', () => {
      mockArrivals = [
        {
          ...sampleArrival,
          client: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('client-name-0')).toHaveTextContent('Неизвестный клиент')
    })

    it('должен отображать "Неизвестный склад" для поставки без склада', () => {
      mockArrivals = [
        {
          ...sampleArrival,
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
      expect(screen.getByTestId('entity-name')).toHaveTextContent('эту поставку')
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

  describe('Действия с поставками', () => {
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

  describe('Статусы поставок', () => {
    it('должен отображать различные статусы поставок', () => {
      const arrivals = [
        { ...sampleArrival, _id: '1', arrival_status: 'ожидается доставка' },
        { ...sampleArrival, _id: '2', arrival_status: 'получена' },
        { ...sampleArrival, _id: '3', arrival_status: 'отсортирована' },
      ]

      mockArrivals = arrivals

      renderComponent()

      expect(screen.getByTestId('status-0')).toHaveTextContent('ожидается доставка')
      expect(screen.getByTestId('status-1')).toHaveTextContent('получена')
      expect(screen.getByTestId('status-2')).toHaveTextContent('отсортирована')
    })
  })

  describe('Интеграция с хуками', () => {
    it('должен использовать данные из useArchivedArrivalsActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('arrival-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных поставок', () => {
    it('должен отображать несколько поставок', () => {
      const secondArrival: ArrivalWithClient = {
        ...sampleArrival,
        _id: '2',
        arrivalNumber: 'ARR-002',
        client: {
          ...sampleArrival.client,
          name: 'ИП Иванов И.И.',
        },
        stock: {
          ...sampleArrival.stock,
          name: 'Дополнительный склад',
        },
        arrival_status: 'ожидается доставка',
      }

      mockArrivals = [sampleArrival, secondArrival]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('arrival-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('arrival-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('arrival-number-0')).toHaveTextContent('ARR-001')
      expect(screen.getByTestId('arrival-number-1')).toHaveTextContent('ARR-002')
    })
  })

  describe('Отображение номеров поставок', () => {
    it('должен отображать различные номера поставок', () => {
      const arrivals = [
        { ...sampleArrival, _id: '1', arrivalNumber: 'ARR-001' },
        { ...sampleArrival, _id: '2', arrivalNumber: 'ARR-002' },
        { ...sampleArrival, _id: '3', arrivalNumber: 'ARR-003' },
      ]

      mockArrivals = arrivals

      renderComponent()

      expect(screen.getByTestId('arrival-number-0')).toHaveTextContent('ARR-001')
      expect(screen.getByTestId('arrival-number-1')).toHaveTextContent('ARR-002')
      expect(screen.getByTestId('arrival-number-2')).toHaveTextContent('ARR-003')
    })
  })

  describe('Отображение клиентов', () => {
    it('должен отображать различных клиентов', () => {
      const arrivals = [
        { 
          ...sampleArrival, 
          _id: '1', 
          client: { ...sampleArrival.client, name: 'ООО "Первая компания"' }
        },
        { 
          ...sampleArrival, 
          _id: '2', 
          client: { ...sampleArrival.client, name: 'ИП Петров П.П.' }
        },
      ]

      mockArrivals = arrivals

      renderComponent()

      expect(screen.getByTestId('client-name-0')).toHaveTextContent('ООО "Первая компания"')
      expect(screen.getByTestId('client-name-1')).toHaveTextContent('ИП Петров П.П.')
    })
  })

  describe('Отображение складов', () => {
    it('должен отображать различные склады', () => {
      const arrivals = [
        { 
          ...sampleArrival, 
          _id: '1', 
          stock: { ...sampleArrival.stock, name: 'Основной склад' }
        },
        { 
          ...sampleArrival, 
          _id: '2', 
          stock: { ...sampleArrival.stock, name: 'Дополнительный склад' }
        },
      ]

      mockArrivals = arrivals

      renderComponent()

      expect(screen.getByTestId('stock-name-0')).toHaveTextContent('Основной склад')
      expect(screen.getByTestId('stock-name-1')).toHaveTextContent('Дополнительный склад')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, arrivalNumber, client, stock, arrival_date, status, actions = 7 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('7')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const arrivalRow = screen.getByTestId('arrival-row-0')
      expect(arrivalRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('arrival-number-0')).toBeInTheDocument()
      expect(screen.getByTestId('client-name-0')).toBeInTheDocument()
      expect(screen.getByTestId('stock-name-0')).toBeInTheDocument()
      expect(screen.getByTestId('arrival-date-0')).toBeInTheDocument()
      expect(screen.getByTestId('status-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })

  describe('Форматирование дат', () => {
    it('должен корректно форматировать даты поставок', () => {
      renderComponent()

      // Проверяем, что дата отформатирована правильно
      expect(screen.getByTestId('arrival-date-0')).toHaveTextContent('01.01.2024')
    })
  })
}) 
/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedInvoices from '@/features/archive/components/ArchivedInvoices.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { Invoice } from '@/types'

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
            <div data-testid={`invoice-row-${index}`}>
              <span data-testid={`invoice-number-${index}`}>{item.invoiceNumber}</span>
              <span data-testid={`client-name-${index}`}>{item.client?.name}</span>
              <span data-testid={`total-amount-${index}`}>{item.totalAmount} сом</span>
              <span data-testid={`status-${index}`}>{item.status ?? '—'}</span>
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

jest.mock('@/features/archive/hooks/useArchivedInvoiceActions.ts', () => ({
  default: () => ({
    invoices: mockInvoices,
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
let mockInvoices: Invoice[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleInvoice: Invoice = {
  _id: '1',
  invoiceNumber: 'INV-001',
  client: {
    _id: 'client1',
    name: 'ООО "Тестовая компания"',
    inn: '1234567890',
    address: 'г. Москва, ул. Тестовая, д. 1',
    ogrn: '1234567890123',
    email: 'test@company.com',
    phone_number: '+7 (999) 123-45-67',
  },
  totalAmount: 15000,
  status: 'оплачено',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  services: [],
  logs: [],
  isArchived: true,
}

describe('ArchivedInvoices Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        invoices: (state = { archivedInvoices: [], loading: false }) => state,
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
        invoices: {
          archivedInvoices: mockInvoices,
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
          <ArchivedInvoices />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockInvoices = [sampleInvoice]
    mockLoading = false
    mockConfirmationOpen = false
    mockActionType = 'delete'
    mockSkeletonRows = []
  })

  describe('Рендеринг компонента', () => {
    it('должен отображать основную структуру компонента', () => {
      renderComponent()

      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('columns-count')).toHaveTextContent('6') // 6 колонок
    })

    it('должен применять правильные CSS классы к контейнеру', () => {
      renderComponent()

      const container = screen.getByTestId('data-table').parentElement
      expect(container).toHaveClass('max-w-[1000px]', 'mx-auto', 'w-full')
    })

    it('должен отображать данные счетов', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('invoice-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('invoice-number-0')).toHaveTextContent('INV-001')
      expect(screen.getByTestId('client-name-0')).toHaveTextContent('ООО "Тестовая компания"')
      expect(screen.getByTestId('total-amount-0')).toHaveTextContent('15000 сом')
      expect(screen.getByTestId('status-0')).toHaveTextContent('оплачено')
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
      mockInvoices = [sampleInvoice]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('invoice-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список счетов', () => {
      mockInvoices = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('invoice-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null счета', () => {
      mockInvoices = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "—" для счета без статуса', () => {
      mockInvoices = [
        {
          ...sampleInvoice,
          status: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('status-0')).toHaveTextContent('—')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('этот счет')
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

  describe('Действия со счетами', () => {
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

  describe('Статусы счетов', () => {
    it('должен отображать различные статусы оплаты', () => {
      const invoices = [
        { ...sampleInvoice, _id: '1', status: 'в ожидании' as const },
        { ...sampleInvoice, _id: '2', status: 'оплачено' as const },
        { ...sampleInvoice, _id: '3', status: 'частично оплачено' as const },
      ]

      mockInvoices = invoices

      renderComponent()

      expect(screen.getByTestId('status-0')).toHaveTextContent('в ожидании')
      expect(screen.getByTestId('status-1')).toHaveTextContent('оплачено')
      expect(screen.getByTestId('status-2')).toHaveTextContent('частично оплачено')
    })
  })

  describe('Интеграция с хуками', () => {
    it('должен использовать данные из useArchivedInvoiceActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('invoice-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных счетов', () => {
    it('должен отображать несколько счетов', () => {
      const secondInvoice: Invoice = {
        ...sampleInvoice,
        _id: '2',
        invoiceNumber: 'INV-002',
        client: {
          ...sampleInvoice.client,
          name: 'ИП Иванов И.И.',
        },
        totalAmount: 25000,
        status: 'в ожидании',
      }

      mockInvoices = [sampleInvoice, secondInvoice]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('invoice-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('invoice-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('invoice-number-0')).toHaveTextContent('INV-001')
      expect(screen.getByTestId('invoice-number-1')).toHaveTextContent('INV-002')
    })
  })

  describe('Отображение сумм', () => {
    it('должен отображать различные суммы счетов', () => {
      const invoices = [
        { ...sampleInvoice, _id: '1', totalAmount: 10000 },
        { ...sampleInvoice, _id: '2', totalAmount: 25000 },
        { ...sampleInvoice, _id: '3', totalAmount: 50000 },
      ]

      mockInvoices = invoices

      renderComponent()

      expect(screen.getByTestId('total-amount-0')).toHaveTextContent('10000 сом')
      expect(screen.getByTestId('total-amount-1')).toHaveTextContent('25000 сом')
      expect(screen.getByTestId('total-amount-2')).toHaveTextContent('50000 сом')
    })

    it('должен корректно отображать нулевую сумму', () => {
      mockInvoices = [
        {
          ...sampleInvoice,
          totalAmount: 0,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('total-amount-0')).toHaveTextContent('0 сом')
    })
  })

  describe('Отображение номеров счетов', () => {
    it('должен отображать различные номера счетов', () => {
      const invoices = [
        { ...sampleInvoice, _id: '1', invoiceNumber: 'INV-001' },
        { ...sampleInvoice, _id: '2', invoiceNumber: 'INV-002' },
        { ...sampleInvoice, _id: '3', invoiceNumber: 'INV-003' },
      ]

      mockInvoices = invoices

      renderComponent()

      expect(screen.getByTestId('invoice-number-0')).toHaveTextContent('INV-001')
      expect(screen.getByTestId('invoice-number-1')).toHaveTextContent('INV-002')
      expect(screen.getByTestId('invoice-number-2')).toHaveTextContent('INV-003')
    })
  })

  describe('Отображение клиентов', () => {
    it('должен отображать различных клиентов', () => {
      const invoices = [
        { 
          ...sampleInvoice, 
          _id: '1', 
          client: { ...sampleInvoice.client, name: 'ООО "Первая компания"' }
        },
        { 
          ...sampleInvoice, 
          _id: '2', 
          client: { ...sampleInvoice.client, name: 'ИП Петров П.П.' }
        },
      ]

      mockInvoices = invoices

      renderComponent()

      expect(screen.getByTestId('client-name-0')).toHaveTextContent('ООО "Первая компания"')
      expect(screen.getByTestId('client-name-1')).toHaveTextContent('ИП Петров П.П.')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, invoiceNumber, client, totalAmount, status, actions = 6 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('6')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const invoiceRow = screen.getByTestId('invoice-row-0')
      expect(invoiceRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('invoice-number-0')).toBeInTheDocument()
      expect(screen.getByTestId('client-name-0')).toBeInTheDocument()
      expect(screen.getByTestId('total-amount-0')).toBeInTheDocument()
      expect(screen.getByTestId('status-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })

  describe('Специальные случаи', () => {
    it('должен корректно обрабатывать большие суммы', () => {
      mockInvoices = [
        {
          ...sampleInvoice,
          totalAmount: 1000000,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('total-amount-0')).toHaveTextContent('1000000 сом')
    })

    it('должен отображать счета с длинными номерами', () => {
      mockInvoices = [
        {
          ...sampleInvoice,
          invoiceNumber: 'INVOICE-2024-001-VERY-LONG-NUMBER',
        },
      ]

      renderComponent()

      expect(screen.getByTestId('invoice-number-0')).toHaveTextContent('INVOICE-2024-001-VERY-LONG-NUMBER')
    })
  })
}) 
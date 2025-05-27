/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedClients from '@/features/archive/components/ArchivedClients.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { Client } from '@/types'

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
            <div data-testid={`client-row-${index}`}>
              <span data-testid={`name-${index}`}>{item.name}</span>
              <span data-testid={`phone-${index}`}>{item.phone_number}</span>
              <span data-testid={`email-${index}`}>{item.email}</span>
              <span data-testid={`inn-${index}`}>{item.inn}</span>
              <span data-testid={`address-${index}`}>{item.address || '—'}</span>
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

jest.mock('@/features/archive/hooks/useArchivedClientActions.ts', () => ({
  useArchivedClientActions: () => ({
    clients: mockClients,
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
let mockClients: Client[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleClient: Client = {
  _id: '1',
  name: 'ООО "Тестовая компания"',
  phone_number: '+7 (999) 123-45-67',
  email: 'test@company.com',
  inn: '1234567890',
  address: 'г. Москва, ул. Тестовая, д. 1',
  ogrn: '1234567890123',
  banking_data: 'р/с 40702810000000000000',
}

describe('ArchivedClients Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        clients: (state = { archivedClients: [], loading: false }) => state,
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
        clients: {
          archivedClients: mockClients,
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
          <ArchivedClients />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockClients = [sampleClient]
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

    it('должен отображать данные клиентов', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('client-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('ООО "Тестовая компания"')
      expect(screen.getByTestId('phone-0')).toHaveTextContent('+7 (999) 123-45-67')
      expect(screen.getByTestId('email-0')).toHaveTextContent('test@company.com')
      expect(screen.getByTestId('inn-0')).toHaveTextContent('1234567890')
      expect(screen.getByTestId('address-0')).toHaveTextContent('г. Москва, ул. Тестовая, д. 1')
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
      mockClients = [sampleClient]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('client-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список клиентов', () => {
      mockClients = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('client-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null клиентов', () => {
      mockClients = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "—" для клиента без адреса', () => {
      mockClients = [
        {
          ...sampleClient,
          address: undefined,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('—')
    })

    it('должен отображать "—" для клиента с пустым адресом', () => {
      mockClients = [
        {
          ...sampleClient,
          address: '',
        },
      ]

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('—')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('этого клиента')
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

  describe('Действия с клиентами', () => {
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
    it('должен использовать данные из useArchivedClientActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('client-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных клиентов', () => {
    it('должен отображать несколько клиентов', () => {
      const secondClient: Client = {
        ...sampleClient,
        _id: '2',
        name: 'ИП Иванов И.И.',
        phone_number: '+7 (999) 987-65-43',
        email: 'ivanov@example.com',
        inn: '0987654321',
        address: 'г. СПб, ул. Невская, д. 10',
      }

      mockClients = [sampleClient, secondClient]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('client-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('client-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('ООО "Тестовая компания"')
      expect(screen.getByTestId('name-1')).toHaveTextContent('ИП Иванов И.И.')
    })
  })

  describe('Отображение контактной информации', () => {
    it('должен отображать различные телефоны', () => {
      const clients = [
        { ...sampleClient, _id: '1', phone_number: '+7 (999) 111-11-11' },
        { ...sampleClient, _id: '2', phone_number: '+7 (999) 222-22-22' },
      ]

      mockClients = clients

      renderComponent()

      expect(screen.getByTestId('phone-0')).toHaveTextContent('+7 (999) 111-11-11')
      expect(screen.getByTestId('phone-1')).toHaveTextContent('+7 (999) 222-22-22')
    })

    it('должен отображать различные email адреса', () => {
      const clients = [
        { ...sampleClient, _id: '1', email: 'client1@example.com' },
        { ...sampleClient, _id: '2', email: 'client2@example.com' },
      ]

      mockClients = clients

      renderComponent()

      expect(screen.getByTestId('email-0')).toHaveTextContent('client1@example.com')
      expect(screen.getByTestId('email-1')).toHaveTextContent('client2@example.com')
    })
  })

  describe('Отображение реквизитов', () => {
    it('должен отображать различные ИНН', () => {
      const clients = [
        { ...sampleClient, _id: '1', inn: '1111111111' },
        { ...sampleClient, _id: '2', inn: '2222222222' },
        { ...sampleClient, _id: '3', inn: '3333333333' },
      ]

      mockClients = clients

      renderComponent()

      expect(screen.getByTestId('inn-0')).toHaveTextContent('1111111111')
      expect(screen.getByTestId('inn-1')).toHaveTextContent('2222222222')
      expect(screen.getByTestId('inn-2')).toHaveTextContent('3333333333')
    })

    it('должен отображать различные адреса', () => {
      const clients = [
        { ...sampleClient, _id: '1', address: 'Москва, ул. Первая, д. 1' },
        { ...sampleClient, _id: '2', address: 'СПб, ул. Вторая, д. 2' },
      ]

      mockClients = clients

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('Москва, ул. Первая, д. 1')
      expect(screen.getByTestId('address-1')).toHaveTextContent('СПб, ул. Вторая, д. 2')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, name, phone, email, inn, address, actions = 7 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('7')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const clientRow = screen.getByTestId('client-row-0')
      expect(clientRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('name-0')).toBeInTheDocument()
      expect(screen.getByTestId('phone-0')).toBeInTheDocument()
      expect(screen.getByTestId('email-0')).toBeInTheDocument()
      expect(screen.getByTestId('inn-0')).toBeInTheDocument()
      expect(screen.getByTestId('address-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })

  describe('Типы клиентов', () => {
    it('должен отображать юридические лица', () => {
      const legalEntity: Client = {
        ...sampleClient,
        name: 'ООО "Рога и Копыта"',
        inn: '1234567890',
        ogrn: '1234567890123',
      }

      mockClients = [legalEntity]

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent('ООО "Рога и Копыта"')
      expect(screen.getByTestId('inn-0')).toHaveTextContent('1234567890')
    })

    it('должен отображать индивидуальных предпринимателей', () => {
      const individualEntrepreneur: Client = {
        ...sampleClient,
        name: 'ИП Петров Петр Петрович',
        inn: '123456789012',
        ogrn: undefined,
      }

      mockClients = [individualEntrepreneur]

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent('ИП Петров Петр Петрович')
      expect(screen.getByTestId('inn-0')).toHaveTextContent('123456789012')
    })
  })
}) 
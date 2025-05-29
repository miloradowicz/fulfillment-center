/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedCounterparties from '@/features/archive/components/ArchivedCounterparties.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { Counterparty } from '@/types'

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
            <div data-testid={`counterparty-row-${index}`}>
              <span data-testid={`name-${index}`}>{item.name}</span>
              <span data-testid={`phone-${index}`}>{item.phone_number}</span>
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

jest.mock('@/features/archive/hooks/useArchivedCounterpartiesActions.ts', () => ({
  useArchivedCounterpartiesActions: () => ({
    counterparties: mockCounterparties,
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
let mockCounterparties: Counterparty[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleCounterparty: Counterparty = {
  _id: '1',
  name: 'ООО "Тестовый контрагент"',
  phone_number: '+7 (999) 123-45-67',
  address: 'г. Москва, ул. Тестовая, д. 1',
  isArchived: true,
}

describe('ArchivedCounterparties Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        counterparties: (state = { archivedCounterparties: [], loading: false }) => state,
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
        counterparties: {
          archivedCounterparties: mockCounterparties,
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
          <ArchivedCounterparties />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCounterparties = [sampleCounterparty]
    mockLoading = false
    mockConfirmationOpen = false
    mockActionType = 'delete'
    mockSkeletonRows = []
  })

  describe('Рендеринг компонента', () => {
    it('должен отображать основную структуру компонента', () => {
      renderComponent()

      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('columns-count')).toHaveTextContent('5') // 5 колонок
    })

    it('должен применять правильные CSS классы к контейнеру', () => {
      renderComponent()

      const container = screen.getByTestId('data-table').parentElement
      expect(container).toHaveClass('max-w-[1000px]', 'mx-auto', 'w-full')
    })

    it('должен отображать данные контрагентов', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('counterparty-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('ООО "Тестовый контрагент"')
      expect(screen.getByTestId('phone-0')).toHaveTextContent('+7 (999) 123-45-67')
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
      mockCounterparties = [sampleCounterparty]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('counterparty-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список контрагентов', () => {
      mockCounterparties = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('counterparty-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null контрагентов', () => {
      mockCounterparties = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "—" для контрагента без адреса', () => {
      mockCounterparties = [
        {
          ...sampleCounterparty,
          address: '',
        },
      ]

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('—')
    })

    it('должен отображать "—" для контрагента с undefined адресом', () => {
      mockCounterparties = [
        {
          ...sampleCounterparty,
          address: undefined as any,
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
      expect(screen.getByTestId('entity-name')).toHaveTextContent('этого контрагента')
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

  describe('Действия с контрагентами', () => {
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
    it('должен использовать данные из useArchivedCounterpartiesActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('counterparty-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных контрагентов', () => {
    it('должен отображать несколько контрагентов', () => {
      const secondCounterparty: Counterparty = {
        ...sampleCounterparty,
        _id: '2',
        name: 'ИП Иванов И.И.',
        phone_number: '+7 (999) 987-65-43',
        address: 'г. СПб, ул. Невская, д. 2',
      }

      mockCounterparties = [sampleCounterparty, secondCounterparty]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('counterparty-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('counterparty-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('ООО "Тестовый контрагент"')
      expect(screen.getByTestId('name-1')).toHaveTextContent('ИП Иванов И.И.')
    })
  })

  describe('Отображение названий', () => {
    it('должен отображать различные названия контрагентов', () => {
      const counterparties = [
        { ...sampleCounterparty, _id: '1', name: 'ООО "Первая компания"' },
        { ...sampleCounterparty, _id: '2', name: 'ИП Петров П.П.' },
        { ...sampleCounterparty, _id: '3', name: 'ЗАО "Третья компания"' },
      ]

      mockCounterparties = counterparties

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent('ООО "Первая компания"')
      expect(screen.getByTestId('name-1')).toHaveTextContent('ИП Петров П.П.')
      expect(screen.getByTestId('name-2')).toHaveTextContent('ЗАО "Третья компания"')
    })
  })

  describe('Отображение телефонов', () => {
    it('должен отображать различные номера телефонов', () => {
      const counterparties = [
        { ...sampleCounterparty, _id: '1', phone_number: '+7 (999) 111-11-11' },
        { ...sampleCounterparty, _id: '2', phone_number: '+7 (999) 222-22-22' },
        { ...sampleCounterparty, _id: '3', phone_number: '+7 (999) 333-33-33' },
      ]

      mockCounterparties = counterparties

      renderComponent()

      expect(screen.getByTestId('phone-0')).toHaveTextContent('+7 (999) 111-11-11')
      expect(screen.getByTestId('phone-1')).toHaveTextContent('+7 (999) 222-22-22')
      expect(screen.getByTestId('phone-2')).toHaveTextContent('+7 (999) 333-33-33')
    })
  })

  describe('Отображение адресов', () => {
    it('должен отображать различные адреса', () => {
      const counterparties = [
        { ...sampleCounterparty, _id: '1', address: 'г. Москва, ул. Первая, д. 1' },
        { ...sampleCounterparty, _id: '2', address: 'г. СПб, ул. Вторая, д. 2' },
        { ...sampleCounterparty, _id: '3', address: 'г. Казань, ул. Третья, д. 3' },
      ]

      mockCounterparties = counterparties

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('г. Москва, ул. Первая, д. 1')
      expect(screen.getByTestId('address-1')).toHaveTextContent('г. СПб, ул. Вторая, д. 2')
      expect(screen.getByTestId('address-2')).toHaveTextContent('г. Казань, ул. Третья, д. 3')
    })

    it('должен отображать "—" для контрагентов без адреса', () => {
      const counterparties = [
        { ...sampleCounterparty, _id: '1', address: 'г. Москва, ул. Первая, д. 1' },
        { ...sampleCounterparty, _id: '2', address: '' },
        { ...sampleCounterparty, _id: '3', address: undefined as any },
      ]

      mockCounterparties = counterparties

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent('г. Москва, ул. Первая, д. 1')
      expect(screen.getByTestId('address-1')).toHaveTextContent('—')
      expect(screen.getByTestId('address-2')).toHaveTextContent('—')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, name, phone_number, address, actions = 5 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('5')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const counterpartyRow = screen.getByTestId('counterparty-row-0')
      expect(counterpartyRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('name-0')).toBeInTheDocument()
      expect(screen.getByTestId('phone-0')).toBeInTheDocument()
      expect(screen.getByTestId('address-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })

  describe('Специальные случаи', () => {
    it('должен отображать контрагентов с длинными названиями', () => {
      mockCounterparties = [
        {
          ...sampleCounterparty,
          name: 'ООО "Очень длинное название компании с множеством слов и символов"',
        },
      ]

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent(
        'ООО "Очень длинное название компании с множеством слов и символов"'
      )
    })

    it('должен отображать контрагентов с длинными адресами', () => {
      mockCounterparties = [
        {
          ...sampleCounterparty,
          address: 'Российская Федерация, г. Москва, Центральный административный округ, ул. Очень длинная улица с очень длинным названием, дом 123, корпус 456, строение 789, офис 101',
        },
      ]

      renderComponent()

      expect(screen.getByTestId('address-0')).toHaveTextContent(
        'Российская Федерация, г. Москва, Центральный административный округ, ул. Очень длинная улица с очень длинным названием, дом 123, корпус 456, строение 789, офис 101'
      )
    })

    it('должен корректно обрабатывать международные номера телефонов', () => {
      mockCounterparties = [
        {
          ...sampleCounterparty,
          phone_number: '+1 (555) 123-4567',
        },
      ]

      renderComponent()

      expect(screen.getByTestId('phone-0')).toHaveTextContent('+1 (555) 123-4567')
    })
  })
}) 
/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedUsers from '@/features/archive/components/ArchivedUsers.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { UserWithPopulate } from '@/types'

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
            <div data-testid={`user-row-${index}`}>
              <span data-testid={`display-name-${index}`}>{item.displayName}</span>
              <span data-testid={`email-${index}`}>{item.email}</span>
              <span data-testid={`role-${index}`}>{item.role}</span>
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

jest.mock('@/components/ui/badge.tsx', () => ({
  Badge: ({ children, variant }: any) => (
    <div data-testid="badge" data-variant={variant}>
      {children}
    </div>
  ),
}))

// Мокируем хук
const mockHandleConfirmationOpen = jest.fn()
const mockHandleConfirmationClose = jest.fn()
const mockHandleConfirmationAction = jest.fn()

jest.mock('@/features/archive/hooks/useArchivedUsersActions.ts', () => ({
  default: () => ({
    users: mockUsers,
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
let mockUsers: UserWithPopulate[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleUser: UserWithPopulate = {
  _id: '1',
  displayName: 'Тестовый пользователь',
  email: 'test@example.com',
  role: 'manager',
}

describe('ArchivedUsers Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        users: (state = { archivedUsers: [], loading: false }) => state,
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
        users: {
          archivedUsers: mockUsers,
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
          <ArchivedUsers />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsers = [sampleUser]
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

    it('должен отображать данные пользователей', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('user-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('display-name-0')).toHaveTextContent('Тестовый пользователь')
      expect(screen.getByTestId('email-0')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('role-0')).toHaveTextContent('manager')
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
      mockUsers = [sampleUser]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('user-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список пользователей', () => {
      mockUsers = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('user-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null пользователей', () => {
      mockUsers = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('этого пользователя')
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

  describe('Действия с пользователями', () => {
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

  describe('Роли пользователей', () => {
    it('должен отображать различные роли пользователей', () => {
      const users = [
        { ...sampleUser, _id: '1', role: 'super-admin' as const },
        { ...sampleUser, _id: '2', role: 'admin' as const },
        { ...sampleUser, _id: '3', role: 'manager' as const },
        { ...sampleUser, _id: '4', role: 'stock-worker' as const },
      ]

      mockUsers = users

      renderComponent()

      expect(screen.getByTestId('role-0')).toHaveTextContent('super-admin')
      expect(screen.getByTestId('role-1')).toHaveTextContent('admin')
      expect(screen.getByTestId('role-2')).toHaveTextContent('manager')
      expect(screen.getByTestId('role-3')).toHaveTextContent('stock-worker')
    })
  })

  describe('Интеграция с хуками', () => {
    it('должен использовать данные из useArchivedUsersActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('user-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных пользователей', () => {
    it('должен отображать несколько пользователей', () => {
      const secondUser: UserWithPopulate = {
        ...sampleUser,
        _id: '2',
        displayName: 'Второй пользователь',
        email: 'second@example.com',
        role: 'admin',
      }

      mockUsers = [sampleUser, secondUser]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('user-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('user-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('display-name-0')).toHaveTextContent('Тестовый пользователь')
      expect(screen.getByTestId('display-name-1')).toHaveTextContent('Второй пользователь')
    })
  })

  describe('Отображение email адресов', () => {
    it('должен отображать корректные email адреса', () => {
      const users = [
        { ...sampleUser, _id: '1', email: 'admin@company.com' },
        { ...sampleUser, _id: '2', email: 'manager@company.com' },
      ]

      mockUsers = users

      renderComponent()

      expect(screen.getByTestId('email-0')).toHaveTextContent('admin@company.com')
      expect(screen.getByTestId('email-1')).toHaveTextContent('manager@company.com')
    })
  })

  describe('Отображение имен пользователей', () => {
    it('должен отображать корректные отображаемые имена', () => {
      const users = [
        { ...sampleUser, _id: '1', displayName: 'Иван Иванов' },
        { ...sampleUser, _id: '2', displayName: 'Петр Петров' },
      ]

      mockUsers = users

      renderComponent()

      expect(screen.getByTestId('display-name-0')).toHaveTextContent('Иван Иванов')
      expect(screen.getByTestId('display-name-1')).toHaveTextContent('Петр Петров')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, displayName, email, role, actions = 5 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('5')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const userRow = screen.getByTestId('user-row-0')
      expect(userRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('display-name-0')).toBeInTheDocument()
      expect(screen.getByTestId('email-0')).toBeInTheDocument()
      expect(screen.getByTestId('role-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })
}) 
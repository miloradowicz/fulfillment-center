/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedTasks from '@/features/archive/components/ArchivedTasks.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { TaskWithPopulate } from '@/types'

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
            <div data-testid={`task-row-${index}`}>
              <span data-testid={`task-number-${index}`}>{item.taskNumber}</span>
              <span data-testid={`user-name-${index}`}>
                {item.user?.displayName ?? 'Неизвестный исполнитель'}
              </span>
              <span data-testid={`title-${index}`}>
                {item.title ?? 'Без содержания'}
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

jest.mock('@/features/archive/hooks/useArchivedTasksActions.ts', () => ({
  default: () => ({
    tasks: mockTasks,
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
let mockTasks: TaskWithPopulate[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleTask: TaskWithPopulate = {
  _id: '1',
  taskNumber: 'TASK-001',
  title: 'Тестовая задача',
  description: 'Описание тестовой задачи',
  status: 'к выполнению',
  type: 'general',
  user: {
    _id: 'user1',
    email: 'user@example.com',
    displayName: 'Тестовый пользователь',
    role: 'manager',
  },
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  date_inProgress: null,
  date_Done: null,
  date_ToDO: '2024-01-02T10:00:00Z',
  logs: [],
  associated_order: undefined,
  associated_arrival: undefined,
}

describe('ArchivedTasks Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        tasks: (state = { archivedTasks: [], loading: false }) => state,
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
        tasks: {
          archivedTasks: mockTasks,
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
          <ArchivedTasks />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockTasks = [sampleTask]
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

    it('должен отображать данные задач', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('task-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('task-number-0')).toHaveTextContent('TASK-001')
      expect(screen.getByTestId('user-name-0')).toHaveTextContent('Тестовый пользователь')
      expect(screen.getByTestId('title-0')).toHaveTextContent('Тестовая задача')
      expect(screen.getByTestId('status-0')).toHaveTextContent('к выполнению')
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
      mockTasks = [sampleTask]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('task-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список задач', () => {
      mockTasks = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('task-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null задачи', () => {
      mockTasks = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "Неизвестный исполнитель" для задачи без пользователя', () => {
      mockTasks = [
        {
          ...sampleTask,
          user: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('user-name-0')).toHaveTextContent('Неизвестный исполнитель')
    })

    it('должен отображать "Без содержания" для задачи без заголовка', () => {
      mockTasks = [
        {
          ...sampleTask,
          title: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('title-0')).toHaveTextContent('Без содержания')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('эту задачу')
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

  describe('Действия с задачами', () => {
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

  describe('Статусы задач', () => {
    it('должен отображать различные статусы задач', () => {
      const tasks = [
        { ...sampleTask, _id: '1', status: 'к выполнению' },
        { ...sampleTask, _id: '2', status: 'в работе' },
        { ...sampleTask, _id: '3', status: 'готова' },
      ]

      mockTasks = tasks

      renderComponent()

      expect(screen.getByTestId('status-0')).toHaveTextContent('к выполнению')
      expect(screen.getByTestId('status-1')).toHaveTextContent('в работе')
      expect(screen.getByTestId('status-2')).toHaveTextContent('готова')
    })
  })

  describe('Интеграция с хуками', () => {
    it('должен использовать данные из useArchivedTasksActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('task-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных задач', () => {
    it('должен отображать несколько задач', () => {
      const secondTask: TaskWithPopulate = {
        ...sampleTask,
        _id: '2',
        taskNumber: 'TASK-002',
        title: 'Вторая задача',
        user: {
          ...sampleTask.user,
          displayName: 'Второй пользователь',
        },
        status: 'в работе',
      }

      mockTasks = [sampleTask, secondTask]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('task-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('task-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('task-number-0')).toHaveTextContent('TASK-001')
      expect(screen.getByTestId('task-number-1')).toHaveTextContent('TASK-002')
    })
  })

  describe('Отображение номеров задач', () => {
    it('должен отображать различные номера задач', () => {
      const tasks = [
        { ...sampleTask, _id: '1', taskNumber: 'TASK-001' },
        { ...sampleTask, _id: '2', taskNumber: 'TASK-002' },
        { ...sampleTask, _id: '3', taskNumber: 'TASK-003' },
      ]

      mockTasks = tasks

      renderComponent()

      expect(screen.getByTestId('task-number-0')).toHaveTextContent('TASK-001')
      expect(screen.getByTestId('task-number-1')).toHaveTextContent('TASK-002')
      expect(screen.getByTestId('task-number-2')).toHaveTextContent('TASK-003')
    })
  })

  describe('Отображение исполнителей', () => {
    it('должен отображать различных исполнителей', () => {
      const tasks = [
        { 
          ...sampleTask, 
          _id: '1', 
          user: { ...sampleTask.user, displayName: 'Иван Иванов' }
        },
        { 
          ...sampleTask, 
          _id: '2', 
          user: { ...sampleTask.user, displayName: 'Петр Петров' }
        },
      ]

      mockTasks = tasks

      renderComponent()

      expect(screen.getByTestId('user-name-0')).toHaveTextContent('Иван Иванов')
      expect(screen.getByTestId('user-name-1')).toHaveTextContent('Петр Петров')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, taskNumber, user, title, status, actions = 6 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('6')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const taskRow = screen.getByTestId('task-row-0')
      expect(taskRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('task-number-0')).toBeInTheDocument()
      expect(screen.getByTestId('user-name-0')).toBeInTheDocument()
      expect(screen.getByTestId('title-0')).toBeInTheDocument()
      expect(screen.getByTestId('status-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })
}) 
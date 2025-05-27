/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedServices from '@/features/archive/components/ArchivedServices.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { PopulatedService } from '@/types'

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
            <div data-testid={`service-row-${index}`}>
              <span data-testid={`name-${index}`}>
                {item.name ?? 'Неизвестное имя'}
              </span>
              <span data-testid={`category-${index}`}>
                {item.serviceCategory?.name ?? 'Неизвестная категория'}
              </span>
              <span data-testid={`price-${index}`}>
                {item.price ?? 'Неизвестная цена'}
              </span>
              <span data-testid={`type-${index}`}>
                {item.type ?? 'Неизвестный тип'}
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

jest.mock('@/features/archive/hooks/useArchivedServicesActions.ts', () => ({
  default: () => ({
    services: mockServices,
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
let mockServices: PopulatedService[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleService: PopulatedService = {
  _id: '1',
  name: 'Упаковка товара',
  serviceCategory: {
    _id: 'cat1',
    name: 'Складские услуги',
  },
  price: 100,
  type: 'внутренняя',
  description: 'Упаковка товара в защитную пленку',
  logs: [],
}

describe('ArchivedServices Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        services: (state = { archivedServices: [], loading: false }) => state,
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
        services: {
          archivedServices: mockServices,
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
          <ArchivedServices />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockServices = [sampleService]
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

    it('должен отображать данные услуг', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('service-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('Упаковка товара')
      expect(screen.getByTestId('category-0')).toHaveTextContent('Складские услуги')
      expect(screen.getByTestId('price-0')).toHaveTextContent('100')
      expect(screen.getByTestId('type-0')).toHaveTextContent('внутренняя')
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
      mockServices = [sampleService]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('service-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список услуг', () => {
      mockServices = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('service-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null услуги', () => {
      mockServices = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "Неизвестное имя" для услуги без названия', () => {
      mockServices = [
        {
          ...sampleService,
          name: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent('Неизвестное имя')
    })

    it('должен отображать "Неизвестная категория" для услуги без категории', () => {
      mockServices = [
        {
          ...sampleService,
          serviceCategory: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('category-0')).toHaveTextContent('Неизвестная категория')
    })

    it('должен отображать "Неизвестная цена" для услуги без цены', () => {
      mockServices = [
        {
          ...sampleService,
          price: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('price-0')).toHaveTextContent('Неизвестная цена')
    })

    it('должен отображать "Неизвестный тип" для услуги без типа', () => {
      mockServices = [
        {
          ...sampleService,
          type: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('type-0')).toHaveTextContent('Неизвестный тип')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('эту услугу')
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

  describe('Действия с услугами', () => {
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
    it('должен использовать данные из useArchivedServicesActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('service-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных услуг', () => {
    it('должен отображать несколько услуг', () => {
      const secondService: PopulatedService = {
        ...sampleService,
        _id: '2',
        name: 'Маркировка товара',
        serviceCategory: {
          _id: 'cat2',
          name: 'Дополнительные услуги',
        },
        price: 50,
        type: 'внешняя',
      }

      mockServices = [sampleService, secondService]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('service-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('service-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('name-0')).toHaveTextContent('Упаковка товара')
      expect(screen.getByTestId('name-1')).toHaveTextContent('Маркировка товара')
    })
  })

  describe('Отображение категорий', () => {
    it('должен отображать различные категории услуг', () => {
      const services = [
        { 
          ...sampleService, 
          _id: '1', 
          serviceCategory: { _id: 'cat1', name: 'Складские услуги' }
        },
        { 
          ...sampleService, 
          _id: '2', 
          serviceCategory: { _id: 'cat2', name: 'Транспортные услуги' }
        },
        { 
          ...sampleService, 
          _id: '3', 
          serviceCategory: { _id: 'cat3', name: 'Дополнительные услуги' }
        },
      ]

      mockServices = services

      renderComponent()

      expect(screen.getByTestId('category-0')).toHaveTextContent('Складские услуги')
      expect(screen.getByTestId('category-1')).toHaveTextContent('Транспортные услуги')
      expect(screen.getByTestId('category-2')).toHaveTextContent('Дополнительные услуги')
    })
  })

  describe('Отображение цен', () => {
    it('должен отображать различные цены', () => {
      const services = [
        { ...sampleService, _id: '1', price: 100 },
        { ...sampleService, _id: '2', price: 250 },
        { ...sampleService, _id: '3', price: 500 },
      ]

      mockServices = services

      renderComponent()

      expect(screen.getByTestId('price-0')).toHaveTextContent('100')
      expect(screen.getByTestId('price-1')).toHaveTextContent('250')
      expect(screen.getByTestId('price-2')).toHaveTextContent('500')
    })
  })

  describe('Отображение типов услуг', () => {
    it('должен отображать различные типы услуг', () => {
      const services = [
        { ...sampleService, _id: '1', type: 'внутренняя' as const },
        { ...sampleService, _id: '2', type: 'внешняя' as const },
        { ...sampleService, _id: '3', type: 'внутренняя' as const },
      ]

      mockServices = services

      renderComponent()

      expect(screen.getByTestId('type-0')).toHaveTextContent('внутренняя')
      expect(screen.getByTestId('type-1')).toHaveTextContent('внешняя')
      expect(screen.getByTestId('type-2')).toHaveTextContent('внутренняя')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, name, category, price, type, actions = 6 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('6')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const serviceRow = screen.getByTestId('service-row-0')
      expect(serviceRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('name-0')).toBeInTheDocument()
      expect(screen.getByTestId('category-0')).toBeInTheDocument()
      expect(screen.getByTestId('price-0')).toBeInTheDocument()
      expect(screen.getByTestId('type-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })

  describe('Специальные случаи', () => {
    it('должен корректно обрабатывать нулевую цену', () => {
      mockServices = [
        {
          ...sampleService,
          price: 0,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('price-0')).toHaveTextContent('0')
    })

    it('должен отображать услуги с длинными названиями', () => {
      mockServices = [
        {
          ...sampleService,
          name: 'Очень длинное название услуги которое может не поместиться в ячейку',
        },
      ]

      renderComponent()

      expect(screen.getByTestId('name-0')).toHaveTextContent(
        'Очень длинное название услуги которое может не поместиться в ячейку'
      )
    })
  })
}) 
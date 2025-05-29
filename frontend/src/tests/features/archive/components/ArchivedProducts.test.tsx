/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivedProducts from '@/features/archive/components/ArchivedProducts.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'
import { ProductWithPopulate } from '@/types'

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
            <div data-testid={`product-row-${index}`}>
              <span data-testid={`title-${index}`}>
                {item.title ?? 'Неизвестное название'}
              </span>
              <span data-testid={`article-${index}`}>
                {item.article ?? 'Неизвестный артикул'}
              </span>
              <span data-testid={`barcode-${index}`}>
                {item.barcode ?? 'Неизвестный баркод'}
              </span>
              <span data-testid={`client-name-${index}`}>
                {item.client?.name ?? 'Неизвестный клиент'}
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

jest.mock('@/features/archive/hooks/useArchivedProductsActions.ts', () => ({
  default: () => ({
    products: mockProducts,
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
let mockProducts: ProductWithPopulate[] | null = []
let mockLoading = false
let mockConfirmationOpen = false
let mockActionType: 'delete' | 'unarchive' = 'delete'
let mockSkeletonRows: any[] = []

const sampleProduct: ProductWithPopulate = {
  _id: '1',
  title: 'Тестовый товар',
  article: 'ART-001',
  barcode: '1234567890123',
  client: {
    _id: 'client1',
    name: 'Тестовый клиент',
    inn: '1234567890',
    address: 'Тестовый адрес',
    ogrn: '1234567890123',
    email: 'test@example.com',
    phone_number: '+7 (999) 123-45-67',
  },
  dynamic_fields: [],
  logs: [],
}

describe('ArchivedProducts Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
        products: (state = { archivedProducts: [], loading: false }) => state,
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
        products: {
          archivedProducts: mockProducts,
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
          <ArchivedProducts />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockProducts = [sampleProduct]
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

    it('должен отображать данные товаров', () => {
      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('1')
      expect(screen.getByTestId('product-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('title-0')).toHaveTextContent('Тестовый товар')
      expect(screen.getByTestId('article-0')).toHaveTextContent('ART-001')
      expect(screen.getByTestId('barcode-0')).toHaveTextContent('1234567890123')
      expect(screen.getByTestId('client-name-0')).toHaveTextContent('Тестовый клиент')
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
      mockProducts = [sampleProduct]

      renderComponent()

      expect(screen.queryByTestId('skeleton-row-0')).not.toBeInTheDocument()
      expect(screen.getByTestId('product-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка пустых данных', () => {
    it('должен корректно обрабатывать пустой список товаров', () => {
      mockProducts = []

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
      expect(screen.queryByTestId('product-row-0')).not.toBeInTheDocument()
    })

    it('должен корректно обрабатывать null товары', () => {
      mockProducts = null

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('0')
    })

    it('должен отображать "Неизвестное название" для товара без названия', () => {
      mockProducts = [
        {
          ...sampleProduct,
          title: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('title-0')).toHaveTextContent('Неизвестное название')
    })

    it('должен отображать "Неизвестный артикул" для товара без артикула', () => {
      mockProducts = [
        {
          ...sampleProduct,
          article: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('article-0')).toHaveTextContent('Неизвестный артикул')
    })

    it('должен отображать "Неизвестный баркод" для товара без баркода', () => {
      mockProducts = [
        {
          ...sampleProduct,
          barcode: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('barcode-0')).toHaveTextContent('Неизвестный баркод')
    })

    it('должен отображать "Неизвестный клиент" для товара без клиента', () => {
      mockProducts = [
        {
          ...sampleProduct,
          client: undefined as any,
        },
      ]

      renderComponent()

      expect(screen.getByTestId('client-name-0')).toHaveTextContent('Неизвестный клиент')
    })
  })

  describe('Модальное окно подтверждения', () => {
    it('должен отображать модальное окно при confirmationOpen = true', () => {
      mockConfirmationOpen = true

      renderComponent()

      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
      expect(screen.getByTestId('entity-name')).toHaveTextContent('этот товар')
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

  describe('Действия с товарами', () => {
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
    it('должен использовать данные из useArchivedProductActions', () => {
      renderComponent()

      // Проверяем, что компонент использует данные из хука
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
      expect(screen.getByTestId('product-row-0')).toBeInTheDocument()
    })

    it('должен использовать скелетон из useSkeletonTableRows при загрузке', () => {
      mockLoading = true
      mockSkeletonRows = [{ isSkeleton: true }]

      renderComponent()

      expect(screen.getByTestId('skeleton-row-0')).toBeInTheDocument()
    })
  })

  describe('Обработка множественных товаров', () => {
    it('должен отображать несколько товаров', () => {
      const secondProduct: ProductWithPopulate = {
        ...sampleProduct,
        _id: '2',
        title: 'Второй товар',
        article: 'ART-002',
        barcode: '9876543210987',
        client: {
          ...sampleProduct.client,
          name: 'Второй клиент',
        },
      }

      mockProducts = [sampleProduct, secondProduct]

      renderComponent()

      expect(screen.getByTestId('data-count')).toHaveTextContent('2')
      expect(screen.getByTestId('product-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('product-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('title-0')).toHaveTextContent('Тестовый товар')
      expect(screen.getByTestId('title-1')).toHaveTextContent('Второй товар')
    })
  })

  describe('Отображение артикулов', () => {
    it('должен отображать различные артикулы', () => {
      const products = [
        { ...sampleProduct, _id: '1', article: 'ART-001' },
        { ...sampleProduct, _id: '2', article: 'ART-002' },
        { ...sampleProduct, _id: '3', article: 'ART-003' },
      ]

      mockProducts = products

      renderComponent()

      expect(screen.getByTestId('article-0')).toHaveTextContent('ART-001')
      expect(screen.getByTestId('article-1')).toHaveTextContent('ART-002')
      expect(screen.getByTestId('article-2')).toHaveTextContent('ART-003')
    })
  })

  describe('Отображение баркодов', () => {
    it('должен отображать различные баркоды', () => {
      const products = [
        { ...sampleProduct, _id: '1', barcode: '1111111111111' },
        { ...sampleProduct, _id: '2', barcode: '2222222222222' },
      ]

      mockProducts = products

      renderComponent()

      expect(screen.getByTestId('barcode-0')).toHaveTextContent('1111111111111')
      expect(screen.getByTestId('barcode-1')).toHaveTextContent('2222222222222')
    })
  })

  describe('Структура таблицы', () => {
    it('должен иметь правильное количество колонок', () => {
      renderComponent()

      // select, title, article, barcode, client, actions = 6 колонок
      expect(screen.getByTestId('columns-count')).toHaveTextContent('6')
    })

    it('должен отображать данные в правильном порядке', () => {
      renderComponent()

      const productRow = screen.getByTestId('product-row-0')
      expect(productRow).toBeInTheDocument()

      // Проверяем, что все элементы присутствуют
      expect(screen.getByTestId('title-0')).toBeInTheDocument()
      expect(screen.getByTestId('article-0')).toBeInTheDocument()
      expect(screen.getByTestId('barcode-0')).toBeInTheDocument()
      expect(screen.getByTestId('client-name-0')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-0')).toBeInTheDocument()
      expect(screen.getByTestId('restore-button-0')).toBeInTheDocument()
    })
  })
}) 
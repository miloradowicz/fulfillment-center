/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ProductsDataList from '@/features/products/components/ProductsDataList'

// Мокируем useProductActions хук
const mockUseProductActions = {
  products: [
    {
      _id: '1',
      name: 'Тестовый товар',
      article: 'ART001',
      barcode: '1234567890',
      client: {
        _id: 'client1',
        name: 'Тестовый клиент',
      },
    },
    {
      _id: '2',
      name: 'Другой товар',
      article: 'ART002',
      barcode: '0987654321',
      client: {
        _id: 'client2',
        name: 'Другой клиент',
      },
    }
  ],
  selectedProduct: null as any,
  open: false,
  handleOpen: jest.fn(),
  handleClose: jest.fn(),
  confirmationOpen: false,
  handleConfirmationOpen: jest.fn(),
  handleConfirmationClose: jest.fn(),
  handleConfirmationArchive: jest.fn(),
  handleOpenDetailsModal: jest.fn(),
  openDetailsModal: false,
  handleCloseDetailsModal: jest.fn(),
  selectedProductId: null as string | null,
}

jest.mock('@/features/products/hooks/useProductActions', () => ({
  __esModule: true,
  default: jest.fn(() => mockUseProductActions),
}))

// Мокируем компоненты
jest.mock('@/components/DataTable/DataTable', () => ({
  __esModule: true,
  default: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <div>Columns: {columns.length}</div>
      <div>Data: {data.length} items</div>
      {data.map((item: any) => (
        <div key={item._id} data-testid={`product-${item._id}`}>
          {item.name} - {item.article} - {item.barcode} - {item.client.name}
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/Modal/ConfirmationModal', () => ({
  __esModule: true,
  default: ({ open, entityName, actionType, onConfirm, onCancel }: any) => (
    open ? (
      <div data-testid="confirmation-modal">
        <div>Подтвердить {actionType} для {entityName}</div>
        <button onClick={onConfirm}>Подтвердить</button>
        <button onClick={onCancel}>Отмена</button>
      </div>
    ) : null
  ),
}))

jest.mock('@/components/Modal/Modal', () => ({
  __esModule: true,
  default: ({ open, handleClose, children }: any) => (
    open ? (
      <div data-testid="modal">
        <button onClick={handleClose}>Закрыть</button>
        {children}
      </div>
    ) : null
  ),
}))

jest.mock('@/components/RightPanel/RightPanel', () => ({
  __esModule: true,
  default: ({ open, onOpenChange, children }: any) => (
    open ? (
      <div data-testid="right-panel">
        <button onClick={onOpenChange}>Закрыть панель</button>
        {children}
      </div>
    ) : null
  ),
}))

jest.mock('@/features/products/components/ProductForm', () => ({
  __esModule: true,
  default: ({ initialData, onSuccess }: any) => (
    <div data-testid="product-form">
      <div>Форма товара</div>
      {initialData && <div>Редактирование: {initialData._id}</div>}
      <button onClick={onSuccess}>Сохранить</button>
    </div>
  ),
}))

jest.mock('@/features/products/components/ProductDetails', () => ({
  __esModule: true,
  default: ({ id }: any) => (
    <div data-testid="product-details">
      <div>Детали товара: {id || ''}</div>
    </div>
  ),
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    auth: (state = {}) => state,
  },
})

describe('ProductsDataList', () => {
  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ProductsDataList />
        </BrowserRouter>
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders products data table', () => {
    renderComponent()
    
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('Columns: 6')).toBeInTheDocument()
    expect(screen.getByText('Data: 2 items')).toBeInTheDocument()
  })

  it('displays product information', () => {
    renderComponent()
    
    expect(screen.getByTestId('product-1')).toBeInTheDocument()
    expect(screen.getByText('Тестовый товар - ART001 - 1234567890 - Тестовый клиент')).toBeInTheDocument()
    
    expect(screen.getByTestId('product-2')).toBeInTheDocument()
    expect(screen.getByText('Другой товар - ART002 - 0987654321 - Другой клиент')).toBeInTheDocument()
  })

  it('does not show confirmation modal when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument()
  })

  it('shows confirmation modal when open', () => {
    mockUseProductActions.confirmationOpen = true
    
    renderComponent()
    
    expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
    expect(screen.getByText('Подтвердить archive для этот товар')).toBeInTheDocument()
    
    mockUseProductActions.confirmationOpen = false
  })

  it('does not show product modal when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('shows product modal when open', () => {
    mockUseProductActions.open = true
    
    renderComponent()
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
    
    mockUseProductActions.open = false
  })

  it('does not show right panel when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('right-panel')).not.toBeInTheDocument()
  })

  it('shows right panel when open', () => {
    mockUseProductActions.openDetailsModal = true
    mockUseProductActions.selectedProductId = 'product-123'
    
    renderComponent()
    
    expect(screen.getByTestId('right-panel')).toBeInTheDocument()
    expect(screen.getByTestId('product-details')).toBeInTheDocument()
    expect(screen.getByText('Детали товара: product-123')).toBeInTheDocument()
    
    mockUseProductActions.openDetailsModal = false
    mockUseProductActions.selectedProductId = null
  })

  it('shows edit form when selectedProduct is provided', () => {
    mockUseProductActions.open = true
    mockUseProductActions.selectedProduct = { _id: 'product-edit' }
    
    renderComponent()
    
    expect(screen.getByText('Редактирование: product-edit')).toBeInTheDocument()
    
    mockUseProductActions.open = false
    mockUseProductActions.selectedProduct = null
  })
}) 
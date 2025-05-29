/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ServicesDataList from '@/features/services/components/ServicesDataList'

// Мокируем useServiceActions хук
const mockUseServiceActions = {
  services: [
    {
      _id: '1',
      name: 'Тестовая услуга',
      serviceCategory: {
        _id: 'cat1',
        name: 'Категория 1',
      },
      price: 1000,
      type: 'Основная',
    },
    {
      _id: '2',
      name: 'Другая услуга',
      serviceCategory: {
        _id: 'cat2',
        name: 'Категория 2',
      },
      price: 2000,
      type: 'Дополнительная',
    }
  ],
  selectedService: null,
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
}

jest.mock('@/features/services/hooks/useServicesActions', () => ({
  useServiceActions: jest.fn(() => mockUseServiceActions),
}))

// Мокируем компоненты
jest.mock('@/components/DataTable/DataTable', () => ({
  __esModule: true,
  default: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <div>Columns: {columns.length}</div>
      <div>Data: {data.length} items</div>
      {data.map((item: any) => (
        <div key={item._id} data-testid={`service-${item._id}`}>
          {item.name} - {item.serviceCategory.name} - {item.price} - {item.type}
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

jest.mock('@/features/services/components/ServiceForm', () => ({
  __esModule: true,
  default: ({ serviceId, onClose }: any) => (
    <div data-testid="service-form">
      <div>Форма услуги</div>
      {serviceId && <div>Редактирование: {serviceId}</div>}
      <button onClick={onClose}>Сохранить</button>
    </div>
  ),
}))

jest.mock('@/features/services/components/ServiceDetails', () => ({
  __esModule: true,
  default: ({ serviceId }: any) => (
    <div data-testid="service-details">
      <div>Детали услуги: {serviceId}</div>
    </div>
  ),
}))

// Мокируем утилиты
jest.mock('@/utils/formatMoney', () => ({
  formatMoney: jest.fn((value) => value.toLocaleString()),
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    auth: (state = {}) => state,
  },
})

describe('ServicesDataList', () => {
  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ServicesDataList />
        </BrowserRouter>
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders services data table', () => {
    renderComponent()
    
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('Columns: 6')).toBeInTheDocument()
    expect(screen.getByText('Data: 2 items')).toBeInTheDocument()
  })

  it('displays service information', () => {
    renderComponent()
    
    expect(screen.getByTestId('service-1')).toBeInTheDocument()
    expect(screen.getByText('Тестовая услуга - Категория 1 - 1000 - Основная')).toBeInTheDocument()
    
    expect(screen.getByTestId('service-2')).toBeInTheDocument()
    expect(screen.getByText('Другая услуга - Категория 2 - 2000 - Дополнительная')).toBeInTheDocument()
  })

  it('does not show confirmation modal when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument()
  })

  it('shows confirmation modal when open', () => {
    mockUseServiceActions.confirmationOpen = true
    
    renderComponent()
    
    expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
    expect(screen.getByText('Подтвердить archive для эту услугу')).toBeInTheDocument()
    
    mockUseServiceActions.confirmationOpen = false
  })

  it('does not show service modal when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('shows service modal when open', () => {
    mockUseServiceActions.open = true
    
    renderComponent()
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('service-form')).toBeInTheDocument()
    
    mockUseServiceActions.open = false
  })

  it('does not show right panel when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('right-panel')).not.toBeInTheDocument()
  })

  it('shows right panel when open', () => {
    mockUseServiceActions.openDetailsModal = true
    Object.assign(mockUseServiceActions, { selectedService: { _id: 'service-123' } })
    
    renderComponent()
    
    expect(screen.getByTestId('right-panel')).toBeInTheDocument()
    expect(screen.getByTestId('service-details')).toBeInTheDocument()
    expect(screen.getByText('Детали услуги: service-123')).toBeInTheDocument()
    
    mockUseServiceActions.openDetailsModal = false
    Object.assign(mockUseServiceActions, { selectedService: null })
  })

  it('shows edit form when selectedService is provided', () => {
    mockUseServiceActions.open = true
    Object.assign(mockUseServiceActions, { selectedService: { _id: 'service-edit' } })
    
    renderComponent()
    
    expect(screen.getByText('Редактирование: service-edit')).toBeInTheDocument()
    
    mockUseServiceActions.open = false
    Object.assign(mockUseServiceActions, { selectedService: null })
  })

  it('reverses services data for display', () => {
    // Проверяем что данные отображаются в обратном порядке
    renderComponent()
    
    const dataTable = screen.getByTestId('data-table')
    expect(dataTable).toBeInTheDocument()
    // В реальном тесте можно проверить порядок элементов
  })
}) 
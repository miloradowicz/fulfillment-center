/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import StatusOrderCell from '@/features/orders/components/StatusOrderCell'

// Мокируем thunks
const mockUpdateOrder = jest.fn()
const mockFetchOrdersWithClient = jest.fn()

jest.mock('@/store/thunks/orderThunk', () => ({
  updateOrder: jest.fn((payload) => ({
    type: 'orders/updateOrder/fulfilled',
    payload,
    unwrap: () => Promise.resolve(mockUpdateOrder(payload)),
  })),
  fetchOrdersWithClient: jest.fn(() => ({
    type: 'orders/fetchOrdersWithClient/fulfilled',
    unwrap: () => Promise.resolve(mockFetchOrdersWithClient()),
  })),
}))

// Мокируем константы
jest.mock('@/constants', () => ({
  OrderStatus: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
}))

// Мокируем CommonStatusCell
jest.mock('@/components/CommonStatusCell/CommonStatusCell', () => ({
  __esModule: true,
  default: ({ row, statusKey, statusOptions, statusStyles, onChangeStatus }: any) => (
    <div data-testid="common-status-cell">
      <div>Status: {row[statusKey]}</div>
      <div>Options: {statusOptions.join(', ')}</div>
      <button 
        onClick={() => onChangeStatus(row, 'new-status')}
        data-testid="change-status-button"
      >
        Change Status
      </button>
    </div>
  ),
}))

// Мокируем стили
jest.mock('@/utils/commonStyles', () => ({
  orderStatusStyles: {
    pending: 'text-yellow-500',
    processing: 'text-blue-500',
    shipped: 'text-green-500',
    delivered: 'text-green-700',
    cancelled: 'text-red-500',
  },
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    orders: (state = {}) => state,
  },
})

describe('StatusOrderCell', () => {
  const mockRow = {
    _id: 'order-1',
    status: 'pending',
    products: [],
    sent_at: new Date(),
    paymentStatus: 'pending',
    logs: [],
    defects: [],
    client: {
      _id: 'client-1',
      name: 'Test Client',
    },
    stock: {
      _id: 'stock-1',
      name: 'Test Stock',
    },
  } as any

  const renderComponent = (row = mockRow) =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <StatusOrderCell row={row} />
        </BrowserRouter>
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateOrder.mockResolvedValue({ type: 'fulfilled' })
    mockFetchOrdersWithClient.mockResolvedValue({ type: 'fulfilled' })
  })

  it('renders CommonStatusCell with correct props', () => {
    renderComponent()
    
    expect(screen.getByTestId('common-status-cell')).toBeInTheDocument()
    expect(screen.getByText('Status: pending')).toBeInTheDocument()
    expect(screen.getByText('Options: pending, processing, shipped, delivered, cancelled')).toBeInTheDocument()
  })

  it('displays current order status', () => {
    const customRow = { ...mockRow, status: 'processing' }
    renderComponent(customRow)
    
    expect(screen.getByText('Status: processing')).toBeInTheDocument()
  })

  it('handles status change correctly', async () => {
    renderComponent()
    
    const changeButton = screen.getByTestId('change-status-button')
    fireEvent.click(changeButton)
    
    // Ждем выполнения асинхронных операций
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Проверяем что функция была вызвана с правильными параметрами
    expect(mockUpdateOrder).toHaveBeenCalledWith({
      orderId: 'order-1',
      data: {
        _id: 'order-1',
        status: 'new-status',
        products: [],
        sent_at: expect.any(Date),
        paymentStatus: 'pending',
        logs: [],
        defects: [],
        client: 'client-1',
        stock: 'stock-1',
      },
    })
  })

  it('passes correct status options to CommonStatusCell', () => {
    renderComponent()
    
    expect(screen.getByText('Options: pending, processing, shipped, delivered, cancelled')).toBeInTheDocument()
  })

  it('works with different order statuses', () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    
    statuses.forEach(status => {
      const customRow = { ...mockRow, status }
      const { unmount } = renderComponent(customRow)
      
      expect(screen.getByText(`Status: ${status}`)).toBeInTheDocument()
      
      unmount()
    })
  })
}) 
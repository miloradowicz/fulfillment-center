/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import UsersDataList from '@/features/admin/components/UsersDataList'

// Мокируем useUserActions хук
const mockUseUserActions = {
  users: [
    {
      _id: '1',
      displayName: 'Тест Пользователь',
      email: 'test@example.com',
      role: 'admin',
    },
    {
      _id: '2', 
      displayName: 'Менеджер Тест',
      email: 'manager@example.com',
      role: 'manager',
    }
  ],
  confirmationOpen: false,
  handleConfirmationOpen: jest.fn(),
  handleConfirmationClose: jest.fn(),
  handleConfirmationArchive: jest.fn(),
  handleOpen: jest.fn(),
  handleClose: jest.fn(),
  selectedUser: null,
  open: false,
}

jest.mock('@/features/admin/hooks/useUserActions', () => ({
  __esModule: true,
  default: jest.fn(() => mockUseUserActions),
}))

// Мокируем компоненты
jest.mock('@/components/DataTable/DataTable', () => ({
  __esModule: true,
  default: ({ columns, data }: any) => (
    <div data-testid="data-table">
      <div>Columns: {columns.length}</div>
      <div>Data: {data.length} items</div>
      {data.map((item: any) => (
        <div key={item._id} data-testid={`user-${item._id}`}>
          {item.displayName} - {item.email} - {item.role}
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

jest.mock('@/features/users/components/RegistrationForm', () => ({
  __esModule: true,
  default: ({ onSuccess, initialFormData }: any) => (
    <div data-testid="registration-form">
      <div>Форма регистрации</div>
      {initialFormData && <div>Редактирование: {initialFormData.displayName}</div>}
      <button onClick={onSuccess}>Сохранить</button>
    </div>
  ),
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    auth: (state = {}) => state,
  },
})

describe('UsersDataList', () => {
  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <UsersDataList />
        </BrowserRouter>
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders users data table', () => {
    renderComponent()
    
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('Columns: 5')).toBeInTheDocument()
    expect(screen.getByText('Data: 2 items')).toBeInTheDocument()
  })

  it('displays user information', () => {
    renderComponent()
    
    expect(screen.getByTestId('user-1')).toBeInTheDocument()
    expect(screen.getByText('Тест Пользователь - test@example.com - admin')).toBeInTheDocument()
    expect(screen.getByTestId('user-2')).toBeInTheDocument()
    expect(screen.getByText('Менеджер Тест - manager@example.com - manager')).toBeInTheDocument()
  })

  it('does not show confirmation modal when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument()
  })

  it('shows confirmation modal when open', () => {
    mockUseUserActions.confirmationOpen = true
    
    renderComponent()
    
    expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
    expect(screen.getByText('Подтвердить archive для этого пользователя')).toBeInTheDocument()
    
    mockUseUserActions.confirmationOpen = false
  })

  it('does not show user modal when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('shows user modal when open', () => {
    mockUseUserActions.open = true
    
    renderComponent()
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('registration-form')).toBeInTheDocument()
    
    mockUseUserActions.open = false
  })

  it('shows edit form when selectedUser is provided', () => {
    const testUser = {
      _id: '1',
      displayName: 'Редактируемый пользователь',
      email: 'edit@example.com',
      role: 'admin',
    }
    
    mockUseUserActions.open = true
    Object.assign(mockUseUserActions, { selectedUser: testUser })
    
    renderComponent()
    
    expect(screen.getByText('Редактирование: Редактируемый пользователь')).toBeInTheDocument()
    
    mockUseUserActions.open = false
    Object.assign(mockUseUserActions, { selectedUser: null })
  })
}) 
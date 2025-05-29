/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import UserPage from '@/features/admin/containers/UserPage'

// Мокируем useUserActions хук
const mockUseUserActions = {
  open: false,
  handleOpen: jest.fn(),
  handleClose: jest.fn(),
  fetchAllUsers: jest.fn(),
  loading: false,
}

jest.mock('@/features/admin/hooks/useUserActions', () => ({
  __esModule: true,
  default: jest.fn(() => mockUseUserActions),
}))

// Мокируем компоненты
jest.mock('@/features/admin/components/UsersDataList', () => ({
  __esModule: true,
  default: () => <div data-testid="users-data-list">Users Data List</div>,
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
  default: ({ onSuccess }: any) => (
    <div data-testid="registration-form">
      <div>Форма регистрации</div>
      <button onClick={onSuccess}>Сохранить</button>
    </div>
  ),
}))

jest.mock('@/components/CustomButton/CustomButton', () => ({
  __esModule: true,
  default: ({ text, onClick }: any) => (
    <button data-testid="custom-button" onClick={onClick}>
      {text}
    </button>
  ),
}))

jest.mock('@/components/CustomTitle/CustomTitle', () => ({
  __esModule: true,
  default: ({ text, icon }: any) => (
    <div data-testid="custom-title">
      {icon}
      <span>{text}</span>
    </div>
  ),
}))

jest.mock('@/components/Loader/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading...</div>,
}))

jest.mock('@/components/ProtectedElement/ProtectedElement', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="protected-element">{children}</div>,
}))

jest.mock('lucide-react', () => ({
  ContactRound: ({ size }: any) => (
    <div data-testid="contact-round-icon" data-size={size}>
      Contact Icon
    </div>
  ),
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    auth: (state = {}) => state,
  },
})

describe('UserPage', () => {
  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <UserPage />
        </BrowserRouter>
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUserActions.open = false
    mockUseUserActions.loading = false
  })

  it('renders page title with icon', () => {
    renderComponent()
    
    expect(screen.getByTestId('custom-title')).toBeInTheDocument()
    expect(screen.getByText('Сотрудники')).toBeInTheDocument()
    expect(screen.getByTestId('contact-round-icon')).toBeInTheDocument()
  })

  it('renders add employee button in protected element', () => {
    renderComponent()
    
    expect(screen.getByTestId('protected-element')).toBeInTheDocument()
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    expect(screen.getByText('Добавить сотрудника')).toBeInTheDocument()
  })

  it('renders users data list', () => {
    renderComponent()
    
    expect(screen.getByTestId('users-data-list')).toBeInTheDocument()
    expect(screen.getByText('Users Data List')).toBeInTheDocument()
  })

  it('does not show loader when not loading', () => {
    renderComponent()
    
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
  })

  it('shows loader when loading', () => {
    mockUseUserActions.loading = true
    
    renderComponent()
    
    expect(screen.getByTestId('loader')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('does not show modal when closed', () => {
    renderComponent()
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('shows modal when open', () => {
    mockUseUserActions.open = true
    
    renderComponent()
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('registration-form')).toBeInTheDocument()
  })

  it('calls handleOpen when add button is clicked', () => {
    renderComponent()
    
    const addButton = screen.getByTestId('custom-button')
    fireEvent.click(addButton)
    
    expect(mockUseUserActions.handleOpen).toHaveBeenCalledTimes(1)
  })

  it('calls handleClose when modal close button is clicked', () => {
    mockUseUserActions.open = true
    
    renderComponent()
    
    const closeButton = screen.getByText('Закрыть')
    fireEvent.click(closeButton)
    
    expect(mockUseUserActions.handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls fetchAllUsers and handleClose when form is saved', () => {
    mockUseUserActions.open = true
    
    renderComponent()
    
    const saveButton = screen.getByText('Сохранить')
    fireEvent.click(saveButton)
    
    expect(mockUseUserActions.fetchAllUsers).toHaveBeenCalledTimes(1)
    expect(mockUseUserActions.handleClose).toHaveBeenCalledTimes(1)
  })
}) 
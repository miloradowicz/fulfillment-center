/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ClientForm from '@/features/clients/components/ClientForm'

// Мокируем useClientForm хук
const mockUseClientForm = {
  form: {
    name: '',
    phone_number: '',
    email: '',
    inn: '',
    address: '',
    banking_data: '',
    ogrn: '',
  },
  loadingAdd: false,
  loadingUpdate: false,
  inputChangeHandler: jest.fn(),
  onSubmit: jest.fn(),
  getFieldError: jest.fn((field: string) => null as string | null),
  handleBlur: jest.fn(),
}

jest.mock('@/features/clients/hooks/useClientForm', () => ({
  useClientForm: jest.fn(() => mockUseClientForm),
}))

// Мокируем UI компоненты
jest.mock('@/components/ui/input-with-error', () => ({
  InputWithError: ({ name, placeholder, value, onChange, error, onBlur }: any) => (
    <div>
      <input
        data-testid={`input-${name}`}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && <div data-testid={`error-${name}`}>{error}</div>}
    </div>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ name, placeholder, value, onChange }: any) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, type, disabled, className, ...props }: any) => (
    <button
      data-testid="submit-button"
      type={type}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('lucide-react', () => ({
  LoaderCircle: ({ className }: any) => (
    <div data-testid="loader-circle" className={className}>
      Loading...
    </div>
  ),
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    clients: (state = {}) => state,
  },
})

describe('ClientForm', () => {
  const renderComponent = (client?: any, onClose?: () => void) =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <ClientForm client={client} onClose={onClose} />
        </BrowserRouter>
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseClientForm.form = {
      name: '',
      phone_number: '',
      email: '',
      inn: '',
      address: '',
      banking_data: '',
      ogrn: '',
    }
    mockUseClientForm.loadingAdd = false
    mockUseClientForm.loadingUpdate = false
    mockUseClientForm.getFieldError.mockReturnValue(null)
  })

  it('renders form title for new client', () => {
    renderComponent()
    
    expect(screen.getByText('Добавить нового клиента')).toBeInTheDocument()
  })

  it('renders form title for editing client', () => {
    const client = { _id: '1', name: 'Test Client' }
    renderComponent(client)
    
    expect(screen.getByText('Редактировать клиента')).toBeInTheDocument()
  })

  it('renders all required input fields', () => {
    renderComponent()
    
    expect(screen.getByTestId('input-name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ФИО / Название компании')).toBeInTheDocument()
    
    expect(screen.getByTestId('input-phone_number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Номер телефона')).toBeInTheDocument()
    
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Эл. почта')).toBeInTheDocument()
    
    expect(screen.getByTestId('input-inn')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ИНН')).toBeInTheDocument()
  })

  it('renders optional input fields', () => {
    renderComponent()
    
    expect(screen.getByTestId('input-address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Адрес')).toBeInTheDocument()
    
    expect(screen.getByTestId('input-banking_data')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Банковские реквизиты')).toBeInTheDocument()
    
    expect(screen.getByTestId('input-ogrn')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ОГРН')).toBeInTheDocument()
  })

  it('renders submit button with correct text for new client', () => {
    renderComponent()
    
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByText('Создать')).toBeInTheDocument()
  })

  it('renders submit button with correct text for editing client', () => {
    const client = { _id: '1', name: 'Test Client' }
    renderComponent(client)
    
    expect(screen.getByText('Сохранить')).toBeInTheDocument()
  })

  it('displays form values from hook', () => {
    mockUseClientForm.form = {
      name: 'Test Client',
      phone_number: '+1234567890',
      email: 'test@example.com',
      inn: '1234567890',
      address: 'Test Address',
      banking_data: 'Test Banking',
      ogrn: '1234567890123',
    }
    
    renderComponent()
    
    expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Banking')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1234567890123')).toBeInTheDocument()
  })

  it('calls inputChangeHandler when input values change', () => {
    renderComponent()
    
    const nameInput = screen.getByTestId('input-name')
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    
    expect(mockUseClientForm.inputChangeHandler).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when form is submitted', () => {
    renderComponent()
    
    const form = screen.getByTestId('submit-button').closest('form')
    if (form) {
      fireEvent.submit(form)
    }
    
    expect(mockUseClientForm.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables submit button when loading', () => {
    mockUseClientForm.loadingAdd = true
    
    renderComponent()
    
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
  })

  it('shows loading indicator when loading', () => {
    mockUseClientForm.loadingUpdate = true
    
    renderComponent()
    
    expect(screen.getByTestId('loader-circle')).toBeInTheDocument()
  })

  it('displays validation errors', () => {
    mockUseClientForm.getFieldError = jest.fn((field: string) => {
      if (field === 'name') return 'Имя обязательно'
      if (field === 'email') return 'Неверный email'
      return null
    })
    
    renderComponent()
    
    expect(screen.getByTestId('error-name')).toBeInTheDocument()
    expect(screen.getByText('Имя обязательно')).toBeInTheDocument()
    expect(screen.getByTestId('error-email')).toBeInTheDocument()
    expect(screen.getByText('Неверный email')).toBeInTheDocument()
  })

  it('calls handleBlur when input loses focus', () => {
    renderComponent()
    
    const nameInput = screen.getByTestId('input-name')
    fireEvent.blur(nameInput, { target: { value: 'Test Name' } })
    
    expect(mockUseClientForm.handleBlur).toHaveBeenCalledWith('name', 'Test Name')
  })
}) 
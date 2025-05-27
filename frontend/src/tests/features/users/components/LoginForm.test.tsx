/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import LoginForm from '@/features/users/components/LoginForm'

// Мокируем useLoginForm хук
const mockUseLoginForm = {
  form: {
    email: '',
    password: '',
  },
  handleChange: jest.fn(),
  onSubmit: jest.fn(),
  isFormValid: false,
  sending: false,
  loginError: null,
  errors: {},
}

jest.mock('@/features/users/hooks/useLoginForm', () => ({
  useLoginForm: jest.fn(() => mockUseLoginForm),
}))

// Мокируем UI компоненты
jest.mock('@/components/ui/input', () => ({
  Input: ({ id, name, type, value, onChange, disabled, className, ...props }: any) => (
    <input
      data-testid={`input-${name}`}
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, type, className, disabled, ...props }: any) => (
    <button
      data-testid="submit-button"
      type={type}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label data-testid={`label-${htmlFor}`} htmlFor={htmlFor}>
      {children}
    </label>
  ),
}))

// Мокируем утилиты
jest.mock('@/utils/getFieldError', () => ({
  getFieldError: jest.fn(() => null),
}))

jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
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
    auth: (state = {}) => state,
  },
})

describe('LoginForm', () => {
  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLoginForm.form = { email: '', password: '' }
    mockUseLoginForm.isFormValid = false
    mockUseLoginForm.sending = false
    mockUseLoginForm.loginError = null
    mockUseLoginForm.errors = {}
  })

  it('renders login form title and description', () => {
    renderComponent()
    
    expect(screen.getByText('Вход в систему')).toBeInTheDocument()
    expect(screen.getByText('Пожалуйста, войдите, чтобы продолжить')).toBeInTheDocument()
  })

  it('renders email input field', () => {
    renderComponent()
    
    expect(screen.getByTestId('label-email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
  })

  it('renders password input field', () => {
    renderComponent()
    
    expect(screen.getByTestId('label-password')).toBeInTheDocument()
    expect(screen.getByText('Пароль')).toBeInTheDocument()
    expect(screen.getByTestId('input-password')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderComponent()
    
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByText('Войти')).toBeInTheDocument()
  })

  it('displays form values from hook', () => {
    mockUseLoginForm.form = { email: 'test@example.com', password: 'password123' }
    
    renderComponent()
    
    const emailInput = screen.getByTestId('input-email')
    const passwordInput = screen.getByTestId('input-password')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('disables submit button when form is invalid', () => {
    mockUseLoginForm.isFormValid = false
    
    renderComponent()
    
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when form is valid', () => {
    mockUseLoginForm.isFormValid = true
    
    renderComponent()
    
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).not.toBeDisabled()
  })

  it('shows loading state when sending', () => {
    mockUseLoginForm.sending = true
    
    renderComponent()
    
    expect(screen.getByTestId('loader-circle')).toBeInTheDocument()
    expect(screen.queryByText('Войти')).not.toBeInTheDocument()
  })

  it('disables inputs when sending', () => {
    mockUseLoginForm.sending = true
    
    renderComponent()
    
    const emailInput = screen.getByTestId('input-email')
    const passwordInput = screen.getByTestId('input-password')
    
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })

  it('calls handleChange when input values change', () => {
    renderComponent()
    
    const emailInput = screen.getByTestId('input-email')
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
    
    expect(mockUseLoginForm.handleChange).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when form is submitted', () => {
    renderComponent()
    
    const submitButton = screen.getByTestId('submit-button')
    const form = submitButton.closest('form')
    
    if (form) {
      fireEvent.submit(form)
    } else {
      // Если форма не найдена, кликаем по кнопке
      fireEvent.click(submitButton)
    }
    
    expect(mockUseLoginForm.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('displays validation errors', () => {
    mockUseLoginForm.errors = {
      email: 'Email обязателен',
      password: 'Пароль обязателен',
    }
    
    renderComponent()
    
    expect(screen.getByText('Email обязателен')).toBeInTheDocument()
    expect(screen.getByText('Пароль обязателен')).toBeInTheDocument()
  })
}) 
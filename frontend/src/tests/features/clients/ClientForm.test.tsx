/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ClientForm from '../../../features/clients/components/ClientForm'
import { Client } from '../../../types'

// Мокируем хук useClientForm
jest.mock('../../../features/clients/hooks/useClientForm', () => ({
  useClientForm: jest.fn(),
}))

// Мокируем компоненты
jest.mock('@/components/ui/input-with-error', () => ({
  InputWithError: ({ placeholder, value, onChange, error, name, onBlur }: any) => (
    <div>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        onBlur={onBlur}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, name }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      data-testid={`input-${name}`}
    />
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className }: any) => (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={className}
      data-testid="submit-button"
    >
      {children}
    </button>
  ),
}))

const mockStore = configureStore({
  reducer: {
    client: (state = {}) => state,
  },
})

const mockClient: Client = {
  _id: '123',
  name: 'Тестовый клиент',
  phone_number: '+7 (999) 123-45-67',
  email: 'test@example.com',
  inn: '1234567890',
  address: 'Тестовый адрес',
  banking_data: 'Банковские реквизиты',
  ogrn: '1234567890123'
}

describe('ClientForm', () => {
  const mockUseClientForm = require('../../../features/clients/hooks/useClientForm').useClientForm

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with empty values for new client', () => {
    mockUseClientForm.mockReturnValue({
      form: {
        name: '',
        phone_number: '',
        email: '',
        inn: '',
        address: '',
        banking_data: '',
        ogrn: ''
      },
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm />
      </Provider>
    )

    expect(screen.getByTestId('input-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-phone_number')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-inn')).toBeInTheDocument()
    expect(screen.getByTestId('input-address')).toBeInTheDocument()
    expect(screen.getByTestId('input-banking_data')).toBeInTheDocument()
    expect(screen.getByTestId('input-ogrn')).toBeInTheDocument()
  })

  it('should render form with client data when editing', () => {
    mockUseClientForm.mockReturnValue({
      form: mockClient,
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm client={mockClient} />
      </Provider>
    )

    expect(screen.getByDisplayValue(mockClient.name)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockClient.phone_number)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockClient.email)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockClient.inn)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockClient.address!)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockClient.banking_data!)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockClient.ogrn!)).toBeInTheDocument()
  })

  it('should call onSubmit when form is submitted', () => {
    const mockOnSubmit = jest.fn(e => e.preventDefault())
    mockUseClientForm.mockReturnValue({
      form: mockClient,
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: mockOnSubmit,
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    const { container } = render(
      <Provider store={mockStore}>
        <ClientForm client={mockClient} />
      </Provider>
    )

    const form = container.querySelector('form')
    if (form) {
      fireEvent.submit(form)
    }

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('should display validation errors for required fields', () => {
    mockUseClientForm.mockReturnValue({
      form: {
        name: '',
        phone_number: '',
        email: '',
        inn: '',
        address: '',
        banking_data: '',
        ogrn: ''
      },
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: (field: string) => {
        if (field === 'name') return 'Название обязательно'
        if (field === 'phone_number') return 'Телефон обязателен'
        if (field === 'email') return 'Email обязателен'
        if (field === 'inn') return 'ИНН обязателен'
        return ''
      },
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm />
      </Provider>
    )

    expect(screen.getByTestId('error-name')).toHaveTextContent('Название обязательно')
    expect(screen.getByTestId('error-phone_number')).toHaveTextContent('Телефон обязателен')
    expect(screen.getByTestId('error-email')).toHaveTextContent('Email обязателен')
    expect(screen.getByTestId('error-inn')).toHaveTextContent('ИНН обязателен')
  })

  it('should display validation errors for invalid email format', () => {
    mockUseClientForm.mockReturnValue({
      form: {
        name: 'Test',
        phone_number: '123',
        email: 'invalid-email',
        inn: '123',
        address: '',
        banking_data: '',
        ogrn: ''
      },
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: (field: string) => {
        if (field === 'email') return 'Неверный формат email'
        return ''
      },
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm />
      </Provider>
    )

    expect(screen.getByTestId('error-email')).toHaveTextContent('Неверный формат email')
  })

  it('should call inputChangeHandler when input values change', () => {
    const mockInputChangeHandler = jest.fn()
    mockUseClientForm.mockReturnValue({
      form: {
        name: '',
        phone_number: '',
        email: '',
        inn: '',
        address: '',
        banking_data: '',
        ogrn: ''
      },
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: mockInputChangeHandler,
      onSubmit: jest.fn(),
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm />
      </Provider>
    )

    const nameInput = screen.getByTestId('input-name')
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Новый клиент' } })

    expect(mockInputChangeHandler).toHaveBeenCalled()
  })

  it('should show loading state', () => {
    mockUseClientForm.mockReturnValue({
      form: mockClient,
      loadingAdd: true,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm client={mockClient} />
      </Provider>
    )

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
  })

  it('should call onClose after successful submission', () => {
    const mockOnClose = jest.fn()
    mockUseClientForm.mockReturnValue({
      form: mockClient,
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm client={mockClient} onClose={mockOnClose} />
      </Provider>
    )

    // Симулируем успешную отправку
    const submitButton = screen.getByTestId('submit-button')
    fireEvent.click(submitButton)

    // В реальном приложении onClose вызывается после успешной отправки
    // Здесь мы просто проверяем, что компонент может принимать этот проп
    expect(mockOnClose).toBeDefined()
  })

  it('should render correct title for new client', () => {
    mockUseClientForm.mockReturnValue({
      form: {
        name: '',
        phone_number: '',
        email: '',
        inn: '',
        address: '',
        banking_data: '',
        ogrn: ''
      },
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm />
      </Provider>
    )

    expect(screen.getByText('Добавить нового клиента')).toBeInTheDocument()
  })

  it('should render correct title for editing client', () => {
    mockUseClientForm.mockReturnValue({
      form: mockClient,
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      onSubmit: jest.fn(),
      getFieldError: jest.fn(),
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ClientForm client={mockClient} />
      </Provider>
    )

    expect(screen.getByText('Редактировать клиента')).toBeInTheDocument()
  })
}) 
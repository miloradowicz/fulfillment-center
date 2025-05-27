/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ProductForm from '../../../features/products/components/ProductForm'
import { ProductWithPopulate } from '../../../types'

// Мокируем хук useProductForm
jest.mock('../../../features/products/hooks/useProductForm', () => ({
  __esModule: true,
  default: jest.fn(),
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
  Input: ({ placeholder, value, onChange }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid={`input-${placeholder}`}
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
      data-testid="button"
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/CustomSelect/CustomSelect', () => ({
  CustomSelect: ({ placeholder, value, error, onSelect }: any) => (
    <div>
      <select
        data-testid="client-select"
        value={value || ''}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">{placeholder}</option>
        <option value="client-1">Клиент 1</option>
        <option value="client-2">Клиент 2</option>
      </select>
      {error && <span data-testid="error-client">{error}</span>}
    </div>
  ),
}))

const mockStore = configureStore({
  reducer: {
    product: (state = {}) => state,
  },
})

const mockProduct: ProductWithPopulate = {
  _id: '123',
  client: {
    _id: 'client-id',
    name: 'Тестовый клиент',
    phone_number: '+7 (999) 123-45-67',
    email: 'test@example.com',
    inn: '1234567890'
  },
  title: 'Тестовый товар',
  barcode: '1234567890',
  article: 'ART123',
  dynamic_fields: [
    { key: 'color', label: 'Цвет', value: 'Красный' }
  ],
  logs: []
}

describe('ProductForm', () => {
  const mockUseProductForm = require('../../../features/products/hooks/useProductForm').default

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with empty values for new product', () => {
    mockUseProductForm.mockReturnValue({
      form: {
        title: '',
        barcode: '',
        article: '',
        client: '',
        dynamic_fields: []
      },
      dynamicFields: [],
      newField: { key: '', label: '' },
      showNewFieldInputs: false,
      clients: [],
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      addDynamicField: jest.fn(),
      onChangeDynamicFieldValue: jest.fn(),
      onSubmit: jest.fn(),
      setForm: jest.fn(),
      setNewField: jest.fn(),
      setShowNewFieldInputs: jest.fn(),
      errors: {},
      createError: null,
      activePopover: null,
      setActivePopover: jest.fn(),
      errorsBlur: {},
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ProductForm />
      </Provider>
    )

    expect(screen.getByTestId('input-title')).toBeInTheDocument()
    expect(screen.getByTestId('input-barcode')).toBeInTheDocument()
    expect(screen.getByTestId('input-article')).toBeInTheDocument()
    expect(screen.getByTestId('client-select')).toBeInTheDocument()
  })

  it('should render form with product data when editing', () => {
    mockUseProductForm.mockReturnValue({
      form: {
        title: mockProduct.title,
        barcode: mockProduct.barcode,
        article: mockProduct.article,
        client: mockProduct.client._id,
        dynamic_fields: mockProduct.dynamic_fields
      },
      dynamicFields: mockProduct.dynamic_fields,
      newField: { key: '', label: '' },
      showNewFieldInputs: false,
      clients: [mockProduct.client],
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      addDynamicField: jest.fn(),
      onChangeDynamicFieldValue: jest.fn(),
      onSubmit: jest.fn(),
      setForm: jest.fn(),
      setNewField: jest.fn(),
      setShowNewFieldInputs: jest.fn(),
      errors: {},
      createError: null,
      activePopover: null,
      setActivePopover: jest.fn(),
      errorsBlur: {},
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ProductForm initialData={mockProduct} />
      </Provider>
    )

    expect(screen.getByDisplayValue(mockProduct.title)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockProduct.barcode)).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockProduct.article)).toBeInTheDocument()
  })

  it('should call onSubmit when form is submitted', () => {
    const mockOnSubmit = jest.fn(e => e.preventDefault())
    mockUseProductForm.mockReturnValue({
      form: {
        title: '',
        barcode: '',
        article: '',
        client: '',
        dynamic_fields: []
      },
      dynamicFields: [],
      newField: { key: '', label: '' },
      showNewFieldInputs: false,
      clients: [],
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      addDynamicField: jest.fn(),
      onChangeDynamicFieldValue: jest.fn(),
      onSubmit: mockOnSubmit,
      setForm: jest.fn(),
      setNewField: jest.fn(),
      setShowNewFieldInputs: jest.fn(),
      errors: {},
      createError: null,
      activePopover: null,
      setActivePopover: jest.fn(),
      errorsBlur: {},
      handleBlur: jest.fn(),
    })

    const { container } = render(
      <Provider store={mockStore}>
        <ProductForm />
      </Provider>
    )

    const form = container.querySelector('form')
    if (form) {
      fireEvent.submit(form)
    }

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('should display validation errors', () => {
    mockUseProductForm.mockReturnValue({
      form: {
        title: '',
        barcode: '',
        article: '',
        client: '',
        dynamic_fields: []
      },
      dynamicFields: [],
      newField: { key: '', label: '' },
      showNewFieldInputs: false,
      clients: [],
      loadingAdd: false,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      addDynamicField: jest.fn(),
      onChangeDynamicFieldValue: jest.fn(),
      onSubmit: jest.fn(),
      setForm: jest.fn(),
      setNewField: jest.fn(),
      setShowNewFieldInputs: jest.fn(),
      errors: {
        title: 'Название обязательно',
        barcode: 'Баркод обязателен'
      },
      createError: null,
      activePopover: null,
      setActivePopover: jest.fn(),
      errorsBlur: {},
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ProductForm />
      </Provider>
    )

    expect(screen.getByTestId('error-title')).toHaveTextContent('Название обязательно')
    expect(screen.getByTestId('error-barcode')).toHaveTextContent('Баркод обязателен')
  })

  it('should show loading state', () => {
    mockUseProductForm.mockReturnValue({
      form: {
        title: '',
        barcode: '',
        article: '',
        client: '',
        dynamic_fields: []
      },
      dynamicFields: [],
      newField: { key: '', label: '' },
      showNewFieldInputs: false,
      clients: [],
      loadingAdd: true,
      loadingUpdate: false,
      inputChangeHandler: jest.fn(),
      addDynamicField: jest.fn(),
      onChangeDynamicFieldValue: jest.fn(),
      onSubmit: jest.fn(),
      setForm: jest.fn(),
      setNewField: jest.fn(),
      setShowNewFieldInputs: jest.fn(),
      errors: {},
      createError: null,
      activePopover: null,
      setActivePopover: jest.fn(),
      errorsBlur: {},
      handleBlur: jest.fn(),
    })

    render(
      <Provider store={mockStore}>
        <ProductForm />
      </Provider>
    )

    const submitButtons = screen.getAllByTestId('button')
    const submitButton = submitButtons.find(button => 
      button.textContent?.includes('Создать') || button.textContent?.includes('Сохранить')
    )
    
    expect(submitButton).toBeDisabled()
  })
}) 
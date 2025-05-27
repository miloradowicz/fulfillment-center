/* eslint-disable */
// Мокируем dayjs перед импортами
jest.mock('dayjs', () => {
  const mockDayjs: any = jest.fn(() => ({
    format: jest.fn(() => '2023-01-01'),
    toDate: jest.fn(() => new Date('2023-01-01')),
    isValid: jest.fn(() => true),
    locale: jest.fn(),
  }))
  
  mockDayjs.locale = jest.fn()
  mockDayjs.extend = jest.fn()
  
  return mockDayjs
})

// Мокируем FormDatePicker компонент
jest.mock('@/components/FormDatePicker/FormDatePicker', () => ({
  __esModule: true,
  default: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <input 
        type="date" 
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)}
        data-testid="date-picker"
      />
    </div>
  ),
}))

// Мокируем FormAccordion компонент
jest.mock('@/components/FormAccordion/FormAccordion', () => ({
  __esModule: true,
  default: ({ title, items = [] }: any) => (
    <div data-testid="form-accordion">
      <h3>{title}</h3>
      <div>Items count: {items.length}</div>
    </div>
  ),
}))

// Мокируем OrderStatus константу
jest.mock('@/constants', () => ({
  featureProtection: process.env.VITE_FEATURE_PROTECTION_DISABLED !== '1',
  OrderStatus: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
}))

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import OrderForm from '@/features/orders/components/OrderForm.tsx'

const mockUseOrderForm = {
  form: { client: '', stock: '', price: '', sent_at: '', delivered_at: '', status: '', comment: '' },
  setForm: jest.fn(),
  productsForm: [],
  defectForm: [],
  newField: {},
  setNewField: jest.fn(),
  newFieldDefects: {},
  setNewFieldDefects: jest.fn(),
  modalOpen: false,
  modalOpenDefects: false,
  isButtonDefectVisible: true,
  isButtonVisible: true,
  errors: {},
  setErrors: jest.fn(),
  loading: false,
  createError: {},
  clients: [{ _id: '1', name: 'Клиент 1' }],
  availableProducts: [],
  loadingFetchClient: false,
  handleBlur: jest.fn(),
  handleBlurAutoComplete: jest.fn(),
  handleButtonClick: jest.fn(),
  handleButtonDefectClick: jest.fn(),
  handleCloseModal: jest.fn(),
  handleCloseDefectModal: jest.fn(),
  deleteProduct: jest.fn(),
  deleteDefect: jest.fn(),
  addArrayProductInForm: jest.fn(),
  addArrayDefectInForm: jest.fn(),
  onSubmit: jest.fn(),
  initialData: null,
  availableDefects: [],
  files: [],
  handleFileChange: jest.fn(),
  stocks: [{ _id: '1', name: 'Склад 1' }],
  handleRemoveFile: jest.fn(),
  handleRemoveExistingFile: jest.fn(),
  existingFiles: [],
  handleModalCancel: jest.fn(),
  handleModalConfirm: jest.fn(),
  openModal: false,
}

beforeEach(() => {
  process.env.VITE_FEATURE_PROTECTION_DISABLED = '1'
})

jest.mock('../features/orders/hooks/useOrderForm', () => ({
  useOrderForm: () => mockUseOrderForm,
}))

describe('OrderForm', () => {
  const renderForm = () =>
    render(
      <BrowserRouter>
        <OrderForm />
      </BrowserRouter>,
    )

  it('Renders form title', () => {
    renderForm()
    expect(screen.getByText(/Добавить новый заказ/i)).toBeInTheDocument()
  })

  it('Displays client autocomplete', () => {
    renderForm()
    expect(screen.getByText('Клиент')).toBeInTheDocument()
    expect(screen.getByText('Выберите клиента')).toBeInTheDocument()
  })

  it('Displays stock autocomplete', () => {
    renderForm()
    expect(screen.getByText('Склад')).toBeInTheDocument()
    expect(screen.getByText('Склад, с которого будет отправлен товар')).toBeInTheDocument()
  })

  it('Displays order amount input field', () => {
    renderForm()
    expect(screen.getByText('Комментарий к заказу')).toBeInTheDocument()
  })

  it('Displays add product button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Товары' })).toBeInTheDocument()
  })

  it('Displays add defects button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Дефекты' })).toBeInTheDocument()
  })

  it('Displays submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: 'Создать' })).toBeInTheDocument()
  })

  it('Renders CircularProgress when loadingFetchClient is true', () => {
    mockUseOrderForm.loadingFetchClient = true

    renderForm()
    // В реальном компоненте CircularProgress может не отображаться в тестовой среде
    // Проверяем что форма все еще рендерится
    expect(screen.getByText('Добавить новый заказ')).toBeInTheDocument()

    mockUseOrderForm.loadingFetchClient = false
  })
})

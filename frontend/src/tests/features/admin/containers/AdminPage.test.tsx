/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import AdminPage from '@/features/admin/containers/AdminPage'

// Мокируем дочерние компоненты
jest.mock('@/features/admin/containers/UserPage', () => ({
  __esModule: true,
  default: () => <div data-testid="user-page">User Page Content</div>,
}))

jest.mock('@/features/services/containers/ServicesPage', () => ({
  __esModule: true,
  default: () => <div data-testid="services-page">Services Page Content</div>,
}))

jest.mock('@/features/invoices/containers/InvoicesPage', () => ({
  __esModule: true,
  default: () => <div data-testid="invoices-page">Invoices Page Content</div>,
}))

// Мокируем UI компоненты
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange && onValueChange('test')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-testid={`tab-trigger-${value}`} onClick={onClick}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <div data-testid="separator" />,
}))

// Мокируем lucide-react
jest.mock('lucide-react', () => ({
  Settings: ({ size, className }: any) => (
    <div data-testid="settings-icon" data-size={size} className={className}>
      Settings Icon
    </div>
  ),
}))

// Мокируем commonStyles
jest.mock('@/utils/commonStyles', () => ({
  tabTriggerStyles: 'mocked-tab-trigger-styles',
}))

// Создаем мок store
const mockStore = configureStore({
  reducer: {
    auth: (state = {}) => state,
  },
})

describe('AdminPage', () => {
  const renderComponent = (initialEntries = ['/admin']) =>
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <AdminPage />
        </BrowserRouter>
      </Provider>
    )

  it('renders admin page title with icon', () => {
    renderComponent()
    
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByText('Админ-панель')).toBeInTheDocument()
  })

  it('renders tabs component', () => {
    renderComponent()
    
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
  })

  it('renders all tab triggers', () => {
    renderComponent()
    
    expect(screen.getByTestId('tab-trigger-users')).toBeInTheDocument()
    expect(screen.getByText('Сотрудники')).toBeInTheDocument()
    
    expect(screen.getByTestId('tab-trigger-services')).toBeInTheDocument()
    expect(screen.getByText('Услуги')).toBeInTheDocument()
    
    expect(screen.getByTestId('tab-trigger-invoices')).toBeInTheDocument()
    expect(screen.getByText('Счета на оплату')).toBeInTheDocument()
  })

  it('renders all tab content areas', () => {
    renderComponent()
    
    expect(screen.getByTestId('tab-content-users')).toBeInTheDocument()
    expect(screen.getByTestId('tab-content-services')).toBeInTheDocument()
    expect(screen.getByTestId('tab-content-invoices')).toBeInTheDocument()
  })

  it('renders UserPage component in users tab', () => {
    renderComponent()
    
    expect(screen.getByTestId('user-page')).toBeInTheDocument()
    expect(screen.getByText('User Page Content')).toBeInTheDocument()
  })

  it('renders ServicesPage component in services tab', () => {
    renderComponent()
    
    expect(screen.getByTestId('services-page')).toBeInTheDocument()
    expect(screen.getByText('Services Page Content')).toBeInTheDocument()
  })

  it('renders InvoicesPage component in invoices tab', () => {
    renderComponent()
    
    expect(screen.getByTestId('invoices-page')).toBeInTheDocument()
    expect(screen.getByText('Invoices Page Content')).toBeInTheDocument()
  })

  it('renders separator component', () => {
    renderComponent()
    
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('has proper responsive classes', () => {
    renderComponent()
    
    const title = screen.getByText('Админ-панель')
    expect(title).toHaveClass('text-xl', 'sm:text-2xl', 'font-semibold')
  })
}) 
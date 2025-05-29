/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ProductOverview from '@/features/appUsage/components/ProductOverview'

// Мокируем UI компоненты
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h1 data-testid="card-title" className={className}>
      {children}
    </h1>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}))

// Мокируем ProtectedElement
jest.mock('@/components/ProtectedElement/ProtectedElement.tsx', () => ({
  __esModule: true,
  default: ({ children, allowedRoles }: any) => (
    <div data-testid="protected-element" data-allowed-roles={allowedRoles?.join(',')}>
      {children}
    </div>
  ),
}))

// Создаем мок store с разными пользователями
const createMockStore = (userRole: string | null = null) => {
  return configureStore({
    reducer: {
      auth: (state = { user: userRole ? { role: userRole } : null }) => state,
    },
  })
}

describe('ProductOverview', () => {
  const renderComponent = (userRole: string | null = null) => {
    const store = createMockStore(userRole)
    return render(
      <Provider store={store}>
        <ProductOverview />
      </Provider>
    )
  }

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала товаров')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/предоставляет удобный интерфейс для эффективной работы с товарными позициями/)).toBeInTheDocument()
    expect(screen.getByText(/создавать, просматривать, редактировать и архивировать товары/)).toBeInTheDocument()
  })

  it('displays product list section', () => {
    renderComponent()
    
    expect(screen.getByText('Список товаров')).toBeInTheDocument()
    expect(screen.getByText(/На главной странице раздела отображается таблица со всеми активными товарами/)).toBeInTheDocument()
  })

  it('displays action buttons descriptions', () => {
    renderComponent()
    
    expect(screen.getByText(/открывает боковую панель с детальной информацией о товаре/)).toBeInTheDocument()
    expect(screen.getByText(/открывает форму редактирования товара/)).toBeInTheDocument()
    expect(screen.getByText(/перемещает товар в архив/)).toBeInTheDocument()
  })

  it('displays detailed view section', () => {
    renderComponent()
    
    expect(screen.getByText('Детальный просмотр товара')).toBeInTheDocument()
    expect(screen.getByText(/При переходе к конкретному товару/)).toBeInTheDocument()
  })

  it('displays correct image for admin role', () => {
    renderComponent('admin')
    
    const listImage = screen.getByAltText('Список товаров')
    expect(listImage).toHaveAttribute('src', '/app-usage/products/products-list.png')
  })

  it('displays correct image for stock-worker role', () => {
    renderComponent('stock-worker')
    
    const listImage = screen.getByAltText('Список товаров')
    expect(listImage).toHaveAttribute('src', '/app-usage/products/products-list(SW).png')
  })

  it('displays product details image', () => {
    renderComponent()
    
    const detailsImage = screen.getByAltText('Детали товара')
    expect(detailsImage).toHaveAttribute('src', '/app-usage/products/products-details.png')
  })

  it('renders protected content for admin roles', () => {
    renderComponent()
    
    const protectedElement = screen.getByTestId('protected-element')
    expect(protectedElement).toBeInTheDocument()
    expect(protectedElement).toHaveAttribute('data-allowed-roles', 'super-admin,admin,manager')
  })

  it('displays creation and editing section within protected content', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование')).toBeInTheDocument()
    expect(screen.getByText(/Для добавления нового товара используется кнопка/)).toBeInTheDocument()
    expect(screen.getByText(/выбор клиента из выпадающего списка/)).toBeInTheDocument()
  })

  it('displays additional parameters section', () => {
    renderComponent()
    
    expect(screen.getByText('Добавление дополнительных параметров')).toBeInTheDocument()
    expect(screen.getByText(/При создании или редактировании вы можете добавить неограниченное количество дополнительных полей/)).toBeInTheDocument()
  })

  it('displays dynamic fields images', () => {
    renderComponent()
    
    const dynamicFieldImage = screen.getByAltText('Добавление динамического поля')
    expect(dynamicFieldImage).toHaveAttribute('src', '/app-usage/products/dynamic-fields.png')
    
    const dynamicFieldValueImage = screen.getByAltText('Значение динамических полей')
    expect(dynamicFieldValueImage).toHaveAttribute('src', '/app-usage/products/dynamic-fields-value.png')
  })

  it('displays archiving section within protected content', () => {
    renderComponent()
    
    expect(screen.getByText('Архивация')).toBeInTheDocument()
    expect(screen.getByText(/Неактуальные товары можно архивировать/)).toBeInTheDocument()
  })

  it('displays special features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы')).toBeInTheDocument()
    expect(screen.getByText(/Товары, используемые в поставках или заказах, нельзя архивировать/)).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toHaveClass('rounded-2xl', 'shadow-md')
    expect(screen.getByTestId('card-title')).toHaveClass('text-2xl')
    expect(screen.getByTestId('card-content')).toHaveClass('space-y-6', 'text-sm', 'leading-relaxed', 'text-muted-foreground')
  })

  it('displays blue highlighted features section', () => {
    renderComponent()
    
    const featuresSection = screen.getByText('Особенности работы').closest('div')
    expect(featuresSection).toHaveClass('p-4', 'bg-blue-50', 'rounded-lg', 'border', 'border-blue-200')
  })
}) 
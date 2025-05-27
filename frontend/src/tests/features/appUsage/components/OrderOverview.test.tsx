/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import OrderOverview from '@/features/appUsage/components/OrderOverview'

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

describe('OrderOverview', () => {
  const renderComponent = (userRole: string | null = null) => {
    const store = createMockStore(userRole)
    return render(
      <Provider store={store}>
        <OrderOverview />
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
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала заказов')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/обеспечивает полный цикл работы с клиентскими заказами/)).toBeInTheDocument()
    expect(screen.getByText(/от создания до доставки, включая контроль оплат и документооборот/)).toBeInTheDocument()
  })

  it('displays order list section', () => {
    renderComponent()
    
    expect(screen.getByText('Список заказов')).toBeInTheDocument()
    expect(screen.getByText(/В таблице отображаются все активные заказы/)).toBeInTheDocument()
    expect(screen.getByText('Номеру заказа')).toBeInTheDocument()
    expect(screen.getByText('Клиенту')).toBeInTheDocument()
    expect(screen.getByText('Складу отгрузки')).toBeInTheDocument()
  })

  it('displays detailed view section', () => {
    renderComponent()
    
    expect(screen.getByText('Детальный просмотр заказа')).toBeInTheDocument()
    expect(screen.getByText(/В карточке заказа отображается/)).toBeInTheDocument()
    expect(screen.getByText(/номер заказа, статусы доставки и оплаты/)).toBeInTheDocument()
  })

  it('renders protected content for admin roles', () => {
    renderComponent()
    
    const protectedElements = screen.getAllByTestId('protected-element')
    expect(protectedElements.length).toBeGreaterThan(0)
    
    protectedElements.forEach(element => {
      expect(element).toHaveAttribute('data-allowed-roles', 'super-admin,admin,manager')
    })
  })

  it('displays creation and editing section within protected content', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование')).toBeInTheDocument()
    expect(screen.getByText(/Форма включает разделы/)).toBeInTheDocument()
    expect(screen.getByText(/клиент, склад, даты, статус/)).toBeInTheDocument()
  })

  it('displays order lifecycle section', () => {
    renderComponent()
    
    expect(screen.getByText('Жизненный цикл заказа')).toBeInTheDocument()
    expect(screen.getByText('Формирование')).toBeInTheDocument()
    expect(screen.getByText('Обработка')).toBeInTheDocument()
    expect(screen.getByText('Исполнение')).toBeInTheDocument()
  })

  it('displays archiving section within protected content', () => {
    renderComponent()
    
    expect(screen.getByText('Архивация')).toBeInTheDocument()
    expect(screen.getByText(/Неактуальные заказы можно архивировать/)).toBeInTheDocument()
    expect(screen.getByText(/архивировать можно только полностью оплаченные заказы и со статусом «Доставлен»/)).toBeInTheDocument()
  })

  it('displays key features section', () => {
    renderComponent()
    
    expect(screen.getByText('Ключевые особенности')).toBeInTheDocument()
    expect(screen.getByText(/Изменение статуса поставки влияет на доступные действия/)).toBeInTheDocument()
    expect(screen.getByText(/Гибкое управление услугами с возможностью переопределения цен/)).toBeInTheDocument()
  })

  it('displays correct image for admin role', () => {
    renderComponent('admin')
    
    const listImage = screen.getByAltText('Список заказов')
    expect(listImage).toHaveAttribute('src', '/app-usage/orders/orders-list.png')
    
    const detailsImage = screen.getByAltText('Детали заказа')
    expect(detailsImage).toHaveAttribute('src', '/app-usage/orders/orders-details.png')
  })

  it('displays correct image for stock-worker role', () => {
    renderComponent('stock-worker')
    
    const listImage = screen.getByAltText('Список заказов')
    expect(listImage).toHaveAttribute('src', '/app-usage/orders/orders-list(SW).png')
    
    const detailsImage = screen.getByAltText('Детали заказа')
    expect(detailsImage).toHaveAttribute('src', '/app-usage/orders/orders-details(SW).png')
  })

  it('displays form image', () => {
    renderComponent()
    
    const formImage = screen.getByAltText('Форма заказа')
    expect(formImage).toBeInTheDocument()
    expect(formImage).toHaveAttribute('src', '/app-usage/orders/orders-form.png')
  })

  it('applies correct CSS classes', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toHaveClass('rounded-2xl', 'shadow-md')
    expect(screen.getByTestId('card-title')).toHaveClass('text-2xl')
    expect(screen.getByTestId('card-content')).toHaveClass('space-y-6', 'text-sm', 'leading-relaxed', 'text-muted-foreground')
  })

  it('applies correct image classes', () => {
    renderComponent()
    
    const images = screen.getAllByRole('img')
    images.forEach(image => {
      expect(image).toHaveClass('mt-2', 'rounded-lg', 'border', 'shadow-sm', 'w-5/6', 'mx-auto')
    })
  })

  it('displays blue highlighted features section', () => {
    renderComponent()
    
    const featuresSection = screen.getByText('Ключевые особенности').closest('div')
    expect(featuresSection).toHaveClass('p-4', 'bg-blue-50', 'rounded-lg', 'border', 'border-blue-200')
  })
}) 
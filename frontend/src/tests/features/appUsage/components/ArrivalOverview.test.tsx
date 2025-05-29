/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ArrivalOverview from '@/features/appUsage/components/ArrivalOverview'

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

describe('ArrivalOverview', () => {
  const renderComponent = (userRole: string | null = null) => {
    const store = createMockStore(userRole)
    return render(
      <Provider store={store}>
        <ArrivalOverview />
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
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала поставок')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/Система управления поставками/)).toBeInTheDocument()
    expect(screen.getByText(/позволяет контролировать весь процесс движения товаров/)).toBeInTheDocument()
    expect(screen.getByText(/от оформления до прибытия на склад/)).toBeInTheDocument()
  })

  it('displays arrival list section', () => {
    renderComponent()
    
    expect(screen.getByText('Список поставок')).toBeInTheDocument()
    expect(screen.getByText(/В таблице отображаются все активные поставки/)).toBeInTheDocument()
    expect(screen.getByText('Номеру поставки')).toBeInTheDocument()
    expect(screen.getByText('Клиенту')).toBeInTheDocument()
    expect(screen.getByText('Складу назначения')).toBeInTheDocument()
  })

  it('displays detailed view section', () => {
    renderComponent()
    
    expect(screen.getByText('Детальный просмотр поставки')).toBeInTheDocument()
    expect(screen.getByText(/При переходе к конкретной поставке/)).toBeInTheDocument()
    expect(screen.getByText(/Основная информация/)).toBeInTheDocument()
    expect(screen.getByText(/номер поставки, статусы доставки и оплаты/)).toBeInTheDocument()
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
    expect(screen.getByText(/Форма поставки состоит из следующих полей/)).toBeInTheDocument()
    expect(screen.getByText(/выбор клиента, от которого осуществляется поставка/)).toBeInTheDocument()
  })

  it('displays work with products section', () => {
    renderComponent()
    
    expect(screen.getByText('Работа с товарами в поставке')).toBeInTheDocument()
    expect(screen.getByText(/Процесс обработки товаров разделен на этапы/)).toBeInTheDocument()
    expect(screen.getByText('Добавление отправленных товаров')).toBeInTheDocument()
    expect(screen.getByText('Фиксация полученных товаров')).toBeInTheDocument()
    expect(screen.getByText('Регистрация дефектов')).toBeInTheDocument()
  })

  it('displays archiving section within protected content', () => {
    renderComponent()
    
    expect(screen.getByText('Архивация')).toBeInTheDocument()
    expect(screen.getByText(/Неактуальные поставки можно архивировать/)).toBeInTheDocument()
    expect(screen.getByText(/архивировать можно только полностью оплаченные поставки/)).toBeInTheDocument()
  })

  it('displays special features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы')).toBeInTheDocument()
    expect(screen.getByText(/Изменение статуса поставки влияет на доступные действия/)).toBeInTheDocument()
    expect(screen.getByText(/Гибкое управление услугами с возможностью переопределения цен/)).toBeInTheDocument()
  })

  it('displays correct image for admin role', () => {
    renderComponent('admin')
    
    const listImage = screen.getByAltText('Список поставок')
    expect(listImage).toHaveAttribute('src', '/app-usage/arrivals/arrivals-list.png')
    
    const detailsImage = screen.getByAltText('Детали поставки')
    expect(detailsImage).toHaveAttribute('src', '/app-usage/arrivals/arrivals-details.png')
  })

  it('displays correct image for stock-worker role', () => {
    renderComponent('stock-worker')
    
    const listImage = screen.getByAltText('Список поставок')
    expect(listImage).toHaveAttribute('src', '/app-usage/arrivals/arrivals-list(SW).png')
    
    const detailsImage = screen.getByAltText('Детали поставки')
    expect(detailsImage).toHaveAttribute('src', '/app-usage/arrivals/arrivals-details(SW).png')
  })

  it('displays form image', () => {
    renderComponent()
    
    const formImage = screen.getByAltText('Форма поставок')
    expect(formImage).toBeInTheDocument()
    expect(formImage).toHaveAttribute('src', '/app-usage/arrivals/arrivals-form.png')
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
    
    const featuresSection = screen.getByText('Особенности работы').closest('div')
    expect(featuresSection).toHaveClass('p-4', 'bg-blue-50', 'rounded-lg', 'border', 'border-blue-200')
  })
}) 
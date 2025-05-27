/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ArchiveOverview from '@/features/appUsage/components/ArchiveOverview'

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

describe('ArchiveOverview', () => {
  const renderComponent = () => render(<ArchiveOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала архива')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/позволяет работать с неактивными сущностями/)).toBeInTheDocument()
    expect(screen.getByText(/просматривать, восстанавливать или полностью удалять их из системы/)).toBeInTheDocument()
  })

  it('displays all supported entities list', () => {
    renderComponent()
    
    expect(screen.getByText('Клиенты')).toBeInTheDocument()
    expect(screen.getByText('Товары')).toBeInTheDocument()
    expect(screen.getByText('Поставки')).toBeInTheDocument()
    expect(screen.getByText('Заказы')).toBeInTheDocument()
    expect(screen.getByText('Задачи')).toBeInTheDocument()
    expect(screen.getByText('Склады')).toBeInTheDocument()
    expect(screen.getByText('Контрагенты')).toBeInTheDocument()
    expect(screen.getByText('Сотрудники')).toBeInTheDocument()
    expect(screen.getByText('Услуги')).toBeInTheDocument()
    expect(screen.getByText('Счета')).toBeInTheDocument()
  })

  it('displays navigation section', () => {
    renderComponent()
    
    expect(screen.getByText('Навигация по архиву')).toBeInTheDocument()
    expect(screen.getByText(/Архив организован в виде вкладок для разных типов сущностей/)).toBeInTheDocument()
  })

  it('displays archive main image', () => {
    renderComponent()
    
    const mainImage = screen.getByAltText('Главный экран архива')
    expect(mainImage).toBeInTheDocument()
    expect(mainImage).toHaveAttribute('src', '/app-usage/archive/archive-main.png')
  })

  it('displays viewing records section', () => {
    renderComponent()
    
    expect(screen.getByText('Просмотр архивных записей')).toBeInTheDocument()
    expect(screen.getByText(/Каждая вкладка содержит таблицу с соответствующими архивными записями/)).toBeInTheDocument()
    expect(screen.getByText('Сортировка и фильтрация по основным полям')).toBeInTheDocument()
    expect(screen.getByText('Постраничная навигация')).toBeInTheDocument()
  })

  it('displays actions section', () => {
    renderComponent()
    
    expect(screen.getByText('Действия с архивными записями')).toBeInTheDocument()
    expect(screen.getByText(/Для каждой записи в столбце/)).toBeInTheDocument()
    expect(screen.getByText(/возвращает сущность в основной список/)).toBeInTheDocument()
  })

  it('displays confirmation section', () => {
    renderComponent()
    
    expect(screen.getByText('Подтверждение действий')).toBeInTheDocument()
    expect(screen.getByText(/При выборе любого действия система запрашивает подтверждение/)).toBeInTheDocument()
    expect(screen.getByText(/Для восстановления — подтверждение переноса в основной список/)).toBeInTheDocument()
  })

  it('renders protected content for super-admin role', () => {
    renderComponent()
    
    const protectedElements = screen.getAllByTestId('protected-element')
    expect(protectedElements.length).toBeGreaterThan(0)
    
    protectedElements.forEach(element => {
      expect(element).toHaveAttribute('data-allowed-roles', 'super-admin')
    })
  })

  it('displays delete action within protected content', () => {
    renderComponent()
    
    expect(screen.getByText(/полностью удаляет запись из системы/)).toBeInTheDocument()
    expect(screen.getByText(/предупреждение о безвозвратном удалении данных/)).toBeInTheDocument()
  })

  it('displays special features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы')).toBeInTheDocument()
    expect(screen.getByText(/Восстановленные данные появляются в своих основных разделах/)).toBeInTheDocument()
    expect(screen.getByText(/Удаленные данные невозможно восстановить/)).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toHaveClass('rounded-2xl', 'shadow-md')
    expect(screen.getByTestId('card-title')).toHaveClass('text-2xl')
    expect(screen.getByTestId('card-content')).toHaveClass('space-y-6', 'text-sm', 'leading-relaxed', 'text-muted-foreground')
  })

  it('applies correct image classes', () => {
    renderComponent()
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('mt-2', 'rounded-lg', 'border', 'shadow-sm', 'w-5/6', 'mx-auto')
  })

  it('displays blue highlighted features section', () => {
    renderComponent()
    
    const featuresSection = screen.getByText('Особенности работы').closest('div')
    expect(featuresSection).toHaveClass('p-4', 'bg-blue-50', 'rounded-lg', 'border', 'border-blue-200')
  })
}) 
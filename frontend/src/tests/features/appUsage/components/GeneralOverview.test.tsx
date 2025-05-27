/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import GeneralOverview from '@/features/appUsage/components/GeneralOverview'

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

describe('GeneralOverview', () => {
  const renderComponent = () => render(<GeneralOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание системы IZZI LIFE')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/это внутренняя система управления операциями/)).toBeInTheDocument()
    expect(screen.getByText(/созданная специально для поддержки процессов фулфилмента/)).toBeInTheDocument()
  })

  it('displays all section headings', () => {
    renderComponent()
    
    expect(screen.getByText('Основные цели системы')).toBeInTheDocument()
    expect(screen.getByText('Функциональные возможности')).toBeInTheDocument()
    expect(screen.getByText('Преимущества для сотрудников')).toBeInTheDocument()
  })

  it('displays section content about system goals', () => {
    renderComponent()
    
    expect(screen.getByText(/Система направлена на упрощение и ускорение ежедневных операций/)).toBeInTheDocument()
    expect(screen.getByText(/минимизировать человеческие ошибки/)).toBeInTheDocument()
  })

  it('displays section content about functionality', () => {
    renderComponent()
    
    expect(screen.getByText(/Система разделена на модули/)).toBeInTheDocument()
    expect(screen.getByText(/работа с клиентами, управление поставками и заказами/)).toBeInTheDocument()
  })

  it('displays section content about employee benefits', () => {
    renderComponent()
    
    expect(screen.getByText(/Интерфейс системы интуитивно понятен/)).toBeInTheDocument()
    expect(screen.getByText(/Работа возможна с любого устройства/)).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toHaveClass('rounded-2xl', 'shadow-md')
    expect(screen.getByTestId('card-title')).toHaveClass('text-2xl')
    expect(screen.getByTestId('card-content')).toHaveClass('space-y-5', 'text-sm', 'leading-relaxed', 'text-muted-foreground')
  })
}) 
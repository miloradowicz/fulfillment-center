/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClientOverview from '@/features/appUsage/components/ClientOverview'

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

describe('ClientOverview', () => {
  const renderComponent = () => render(<ClientOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала клиентов')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/предоставляет удобный интерфейс для эффективной работы с клиентскими данными/)).toBeInTheDocument()
    expect(screen.getByText(/создавать, просматривать, редактировать и архивировать клиентов/)).toBeInTheDocument()
  })

  it('displays client list section', () => {
    renderComponent()
    
    expect(screen.getByText('Список клиентов')).toBeInTheDocument()
    expect(screen.getByText(/На главной странице раздела отображается таблица со всеми активными клиентами/)).toBeInTheDocument()
    expect(screen.getByText(/доступны следующие кнопки/)).toBeInTheDocument()
  })

  it('displays action buttons descriptions', () => {
    renderComponent()
    
    expect(screen.getByText(/открывает боковую панель с детальной информацией о клиенте/)).toBeInTheDocument()
    expect(screen.getByText(/открывает форму редактирования клиента/)).toBeInTheDocument()
    expect(screen.getByText(/перемещает клиента в архив/)).toBeInTheDocument()
  })

  it('displays client list image', () => {
    renderComponent()
    
    const clientListImage = screen.getByAltText('Список клиентов')
    expect(clientListImage).toBeInTheDocument()
    expect(clientListImage).toHaveAttribute('src', '/app-usage/clients/clients-list.png')
  })

  it('displays detailed view section', () => {
    renderComponent()
    
    expect(screen.getByText('Детальный просмотр клиента')).toBeInTheDocument()
    expect(screen.getByText(/При переходе к конкретному клиенту/)).toBeInTheDocument()
  })

  it('displays client details image', () => {
    renderComponent()
    
    const clientDetailsImage = screen.getByAltText('Детали клиента')
    expect(clientDetailsImage).toBeInTheDocument()
    expect(clientDetailsImage).toHaveAttribute('src', '/app-usage/clients/clients-details.png')
  })

  it('displays creation and editing section', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование клиента')).toBeInTheDocument()
    expect(screen.getByText(/Чтобы добавить нового клиента, нажмите кнопку/)).toBeInTheDocument()
  })

  it('displays all form fields', () => {
    renderComponent()
    
    expect(screen.getByText(/полное имя клиента/)).toBeInTheDocument()
    expect(screen.getByText(/контактный номер/)).toBeInTheDocument()
    expect(screen.getByText(/электронная почта/)).toBeInTheDocument()
    expect(screen.getByText(/идентификационный номер налогоплательщика/)).toBeInTheDocument()
    expect(screen.getByText(/адрес клиента/)).toBeInTheDocument()
    expect(screen.getByText(/расчетный счет/)).toBeInTheDocument()
    expect(screen.getByText(/основной государственный регистрационный номер/)).toBeInTheDocument()
  })

  it('displays client form image', () => {
    renderComponent()
    
    const clientFormImage = screen.getByAltText('Форма клиента')
    expect(clientFormImage).toBeInTheDocument()
    expect(clientFormImage).toHaveAttribute('src', '/app-usage/clients/clients-form.png')
  })

  it('displays archiving section', () => {
    renderComponent()
    
    expect(screen.getByText('Архивация и удаление')).toBeInTheDocument()
    expect(screen.getByText(/Неактуальных клиентов можно архивировать/)).toBeInTheDocument()
  })

  it('displays special features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы')).toBeInTheDocument()
    expect(screen.getByText(/Телефонный номер и email проверяется на корректность формата/)).toBeInTheDocument()
    expect(screen.getByText(/При архивации клиента, все его товары тоже попадают в архив/)).toBeInTheDocument()
    expect(screen.getByText(/Клиент не архивируется, если его товары участвуют в активных поставках или заказах/)).toBeInTheDocument()
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
/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StockOverview from '@/features/appUsage/components/StockOverview'

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

describe('StockOverview', () => {
  const renderComponent = () => render(<StockOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала складов')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/Система складского учета помогает контролировать остатки товаров/)).toBeInTheDocument()
    expect(screen.getByText(/фиксировать брак и вести учет списаний/)).toBeInTheDocument()
  })

  it('displays stock list section', () => {
    renderComponent()
    
    expect(screen.getByText('Список складов')).toBeInTheDocument()
    expect(screen.getByText(/Здесь отображаются все ваши склады/)).toBeInTheDocument()
    expect(screen.getByText('Название и адрес каждого склада')).toBeInTheDocument()
    expect(screen.getByText('Быстрый переход к деталям')).toBeInTheDocument()
    expect(screen.getByText('Добавление новых складов')).toBeInTheDocument()
  })

  it('displays stock list image', () => {
    renderComponent()
    
    const listImage = screen.getByAltText('Список складов')
    expect(listImage).toBeInTheDocument()
    expect(listImage).toHaveAttribute('src', '/app-usage/stocks/stocks-list.png')
  })

  it('displays creation and editing section', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование')).toBeInTheDocument()
    expect(screen.getByText(/Для добавления нового склада используется кнопка/)).toBeInTheDocument()
    expect(screen.getByText('Название склада')).toBeInTheDocument()
    expect(screen.getByText('Фактический адрес склада')).toBeInTheDocument()
  })

  it('displays stock form image', () => {
    renderComponent()
    
    const formImage = screen.getByAltText('Форма склада')
    expect(formImage).toBeInTheDocument()
    expect(formImage).toHaveAttribute('src', '/app-usage/stocks/stocks-form.png')
  })

  it('displays stock details section', () => {
    renderComponent()
    
    expect(screen.getByText('Детали склада')).toBeInTheDocument()
    expect(screen.getByText(/При открытии склада вы увидите/)).toBeInTheDocument()
    expect(screen.getByText('Учет товаров')).toBeInTheDocument()
    expect(screen.getByText(/Во вкладке "Товары" отображается/)).toBeInTheDocument()
  })

  it('displays stock details image', () => {
    renderComponent()
    
    const detailsImage = screen.getByAltText('Детали склада')
    expect(detailsImage).toBeInTheDocument()
    expect(detailsImage).toHaveAttribute('src', '/app-usage/stocks/stocks-details.png')
  })

  it('renders protected content for admin roles', () => {
    renderComponent()
    
    const protectedElement = screen.getByTestId('protected-element')
    expect(protectedElement).toBeInTheDocument()
    expect(protectedElement).toHaveAttribute('data-allowed-roles', 'super-admin,admin')
  })

  it('displays write-off section within protected content', () => {
    renderComponent()
    
    expect(screen.getByText('Списание товаров')).toBeInTheDocument()
    expect(screen.getByText(/Форма списания товаров включает в себя/)).toBeInTheDocument()
    expect(screen.getByText(/владелец товара \(выбирается из списка\)/)).toBeInTheDocument()
    expect(screen.getByText(/поиск по названию\/артикулу среди товаров выбранного клиента/)).toBeInTheDocument()
  })

  it('displays write-off form image', () => {
    renderComponent()
    
    const writeOffImage = screen.getByAltText('Форма списания товаров')
    expect(writeOffImage).toBeInTheDocument()
    expect(writeOffImage).toHaveAttribute('src', '/app-usage/stocks/stocks-write-off-form.png')
  })

  it('displays archiving section', () => {
    renderComponent()
    
    expect(screen.getByText('Архивация')).toBeInTheDocument()
    expect(screen.getByText(/Неактуальные склады можно архивировать/)).toBeInTheDocument()
    expect(screen.getByText(/склад можно архивировать только когда в нем нету хранящихся товаров/)).toBeInTheDocument()
  })

  it('displays special features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы со складом')).toBeInTheDocument()
    expect(screen.getByText(/Остатки обновляются автоматически - при приходе\/расходе\/списании/)).toBeInTheDocument()
    expect(screen.getByText(/Отрицательные остатки выделяются красным/)).toBeInTheDocument()
    expect(screen.getByText(/Все изменения фиксируются в истории/)).toBeInTheDocument()
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
    
    const featuresSection = screen.getByText('Особенности работы со складом').closest('div')
    expect(featuresSection).toHaveClass('p-4', 'bg-blue-50', 'rounded-lg', 'border', 'border-blue-200')
  })
}) 
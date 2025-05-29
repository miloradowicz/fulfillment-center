/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CounterpartyOverview from '@/features/appUsage/components/CounterpartyOverview'

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

describe('CounterpartyOverview', () => {
  const renderComponent = () => render(<CounterpartyOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала контрагентов')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/предоставляет удобный интерфейс для эффективной работы с поставщиками/)).toBeInTheDocument()
    expect(screen.getByText(/поставщиками, подрядчиками и другими внешними организациями/)).toBeInTheDocument()
  })

  it('displays counterparty list section', () => {
    renderComponent()
    
    expect(screen.getByText('Список контрагентов')).toBeInTheDocument()
    expect(screen.getByText(/На главной странице отображается таблица со всеми активными контрагентами/)).toBeInTheDocument()
    expect(screen.getByText(/Доступны сортировка и фильтрация по основным полям/)).toBeInTheDocument()
  })

  it('displays action buttons descriptions', () => {
    renderComponent()
    
    expect(screen.getByText(/открывает форму изменения данных контрагента/)).toBeInTheDocument()
    expect(screen.getByText(/перемещает контрагента в архив/)).toBeInTheDocument()
  })

  it('displays counterparty list image', () => {
    renderComponent()
    
    const listImage = screen.getByAltText('Список контрагентов')
    expect(listImage).toBeInTheDocument()
    expect(listImage).toHaveAttribute('src', '/app-usage/counterparties/counterparties-list.png')
  })

  it('displays creation and editing section', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование')).toBeInTheDocument()
    expect(screen.getByText(/Чтобы добавить нового контрагента нажмите кнопку/)).toBeInTheDocument()
  })

  it('displays all form fields', () => {
    renderComponent()
    
    expect(screen.getByText(/полное наименование организации/)).toBeInTheDocument()
    expect(screen.getByText(/контактный номер для связи \(необязательное поле/)).toBeInTheDocument()
    expect(screen.getByText(/юридический или фактический адрес \(необязательное поле\)/)).toBeInTheDocument()
  })

  it('displays counterparty form image', () => {
    renderComponent()
    
    const formImage = screen.getByAltText('Форма добавления контрагента')
    expect(formImage).toBeInTheDocument()
    expect(formImage).toHaveAttribute('src', '/app-usage/counterparties/counterparties-form.png')
  })

  it('displays archiving section', () => {
    renderComponent()
    
    expect(screen.getByText('Архивация')).toBeInTheDocument()
    expect(screen.getByText(/Неактуальных контрагентов можно архивировать/)).toBeInTheDocument()
  })

  it('displays special features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы')).toBeInTheDocument()
    expect(screen.getByText(/Название контрагента должно быть уникальным в системе/)).toBeInTheDocument()
    expect(screen.getByText(/Телефонный номер проверяется на корректность формата/)).toBeInTheDocument()
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
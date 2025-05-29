/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReportOverview from '@/features/appUsage/components/ReportOverview'

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

describe('ReportOverview', () => {
  const renderComponent = () => render(<ReportOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала отчетов')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/позволяет отслеживать и анализировать ключевые процессы компании/)).toBeInTheDocument()
    expect(screen.getByText(/от задач сотрудников до активности клиентов/)).toBeInTheDocument()
  })

  it('displays main report types section', () => {
    renderComponent()
    
    expect(screen.getByText('Основные типы отчетов')).toBeInTheDocument()
    expect(screen.getByText(/показывает, насколько эффективно работают сотрудники/)).toBeInTheDocument()
    expect(screen.getByText(/показывает финансовую и товарную активность клиентов/)).toBeInTheDocument()
  })

  it('displays data filtering section', () => {
    renderComponent()
    
    expect(screen.getByText('Фильтрация данных')).toBeInTheDocument()
    expect(screen.getByText(/Во всех отчетах можно выбрать нужный диапазон дат/)).toBeInTheDocument()
  })

  it('displays reports board image', () => {
    renderComponent()
    
    const boardImage = screen.getByAltText('Вкладки отчетов')
    expect(boardImage).toBeInTheDocument()
    expect(boardImage).toHaveAttribute('src', '/app-usage/reports/reports-board.png')
  })

  it('displays tasks report section', () => {
    renderComponent()
    
    expect(screen.getByText('Отчет по задачам')).toBeInTheDocument()
    expect(screen.getByText(/Этот отчет помогает оценить работу сотрудников/)).toBeInTheDocument()
    expect(screen.getByText(/распределение задач по статусам/)).toBeInTheDocument()
    expect(screen.getByText(/динамика выполнения задач по дням/)).toBeInTheDocument()
    expect(screen.getByText(/список сотрудников и сколько задач они выполнили/)).toBeInTheDocument()
  })

  it('displays tasks report image', () => {
    renderComponent()
    
    const tasksImage = screen.getByAltText('Отчет по задачам')
    expect(tasksImage).toBeInTheDocument()
    expect(tasksImage).toHaveAttribute('src', '/app-usage/reports/tasks-report.png')
  })

  it('displays clients report section', () => {
    renderComponent()
    
    expect(screen.getByText('Отчет по клиентам')).toBeInTheDocument()
    expect(screen.getByText(/Финансовый и операционный анализ/)).toBeInTheDocument()
    expect(screen.getByText('Диаграмма платежей')).toBeInTheDocument()
    expect(screen.getByText('Детальная таблица')).toBeInTheDocument()
  })

  it('displays clients report image', () => {
    renderComponent()
    
    const clientsImage = screen.getByAltText('Отчет по клиентам')
    expect(clientsImage).toBeInTheDocument()
    expect(clientsImage).toHaveAttribute('src', '/app-usage/reports/clients-report.png')
  })

  it('displays technical features section', () => {
    renderComponent()
    
    expect(screen.getByText('Технические особенности')).toBeInTheDocument()
    expect(screen.getByText(/Оптимизированная загрузка больших объемов данных/)).toBeInTheDocument()
    expect(screen.getByText(/Интерактивные элементы графиков/)).toBeInTheDocument()
  })

  it('displays key advantages section', () => {
    renderComponent()
    
    expect(screen.getByText('Ключевые преимущества')).toBeInTheDocument()
    expect(screen.getByText(/Комплексный анализ в едином интерфейсе/)).toBeInTheDocument()
    expect(screen.getByText(/Детализированное представление данных/)).toBeInTheDocument()
    expect(screen.getByText(/Автоматическое обновление при изменении исходных данных/)).toBeInTheDocument()
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

  it('displays blue highlighted advantages section', () => {
    renderComponent()
    
    const advantagesSection = screen.getByText('Ключевые преимущества').closest('div')
    expect(advantagesSection).toHaveClass('p-4', 'bg-blue-50', 'rounded-lg', 'border', 'border-blue-200')
  })
}) 
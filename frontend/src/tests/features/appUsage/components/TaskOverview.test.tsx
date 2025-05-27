/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TaskOverview from '@/features/appUsage/components/TaskOverview'

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

describe('TaskOverview', () => {
  const renderComponent = () => render(<TaskOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Общее описание функционала задач')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/помогает организовать работу команды/)).toBeInTheDocument()
    expect(screen.getByText(/создавать задания, отслеживать их выполнение и контролировать сроки/)).toBeInTheDocument()
  })

  it('displays task board section', () => {
    renderComponent()
    
    expect(screen.getByText('Доска задач')).toBeInTheDocument()
    expect(screen.getByText('Все задачи разделены по статусам:')).toBeInTheDocument()
    expect(screen.getByText(/новые задачи/)).toBeInTheDocument()
    expect(screen.getByText(/задачи в процессе/)).toBeInTheDocument()
    expect(screen.getByText(/выполненные задачи/)).toBeInTheDocument()
  })

  it('displays task details section', () => {
    renderComponent()
    
    expect(screen.getByText('Детали задачи')).toBeInTheDocument()
    expect(screen.getByText(/При нажатии на номер задачи, боковая панель с полной информацией/)).toBeInTheDocument()
    expect(screen.getByText('Номер задачи')).toBeInTheDocument()
    expect(screen.getByText('Статус задачи')).toBeInTheDocument()
    expect(screen.getByText('Название задачи')).toBeInTheDocument()
    expect(screen.getByText('Полное описание задачи')).toBeInTheDocument()
    expect(screen.getAllByText('Исполнитель')).toHaveLength(2)
  })

  it('displays task board image', () => {
    renderComponent()
    
    const taskBoardImage = screen.getByAltText('Доска задач')
    expect(taskBoardImage).toBeInTheDocument()
    expect(taskBoardImage).toHaveAttribute('src', '/app-usage/tasks/tasks-board.png')
  })

  it('displays task details image', () => {
    renderComponent()
    
    const taskDetailsImage = screen.getByAltText('Детали задачи')
    expect(taskDetailsImage).toBeInTheDocument()
    expect(taskDetailsImage).toHaveAttribute('src', '/app-usage/tasks/tasks-details.png')
  })

  it('renders protected content for creation and editing', () => {
    renderComponent()
    
    const protectedElement = screen.getByTestId('protected-element')
    expect(protectedElement).toBeInTheDocument()
    expect(protectedElement).toHaveAttribute('data-allowed-roles', 'super-admin,admin,manager')
  })

  it('displays creation and editing section within protected element', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование')).toBeInTheDocument()
    expect(screen.getByText(/Для добавления новой задачи используется кнопка/)).toBeInTheDocument()
    expect(screen.getByText(/выбор пользователя из выпадающего списка/)).toBeInTheDocument()
    expect(screen.getByText(/обязательное поле, описывающее суть задачи/)).toBeInTheDocument()
  })

  it('displays task form image within protected content', () => {
    renderComponent()
    
    const taskFormImage = screen.getByAltText('Форма задачи')
    expect(taskFormImage).toBeInTheDocument()
    expect(taskFormImage).toHaveAttribute('src', '/app-usage/tasks/tasks-form.png')
  })

  it('displays archiving section within protected content', () => {
    renderComponent()
    
    expect(screen.getByText('Архивация')).toBeInTheDocument()
    expect(screen.getByText(/Неактуальные задачи можно архивировать/)).toBeInTheDocument()
  })

  it('displays key features section', () => {
    renderComponent()
    
    expect(screen.getByText('Ключевые особенности')).toBeInTheDocument()
    expect(screen.getByText(/Простое управление статусами задач/)).toBeInTheDocument()
    expect(screen.getByText(/Привязка задач к конкретным заказам или поставкам/)).toBeInTheDocument()
    expect(screen.getByText(/Гибкая фильтрация, поиск задач по исполнителю/)).toBeInTheDocument()
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
}) 
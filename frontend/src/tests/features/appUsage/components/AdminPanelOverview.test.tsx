/* eslint-disable */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminPanelOverview from '@/features/appUsage/components/AdminPanelOverview'

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

describe('AdminPanelOverview', () => {
  const renderComponent = () => render(<AdminPanelOverview />)

  it('renders the main card structure', () => {
    renderComponent()
    
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-title')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('displays the correct title', () => {
    renderComponent()
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Обзор панели администратора')
  })

  it('displays the main description', () => {
    renderComponent()
    
    expect(screen.getByText(/Панель администратора/)).toBeInTheDocument()
    expect(screen.getByText(/центральный инструмент управления ключевыми сущностями системы/)).toBeInTheDocument()
    expect(screen.getByText(/сотрудниками, услугами и счетами/)).toBeInTheDocument()
  })

  // Тесты для раздела "Сотрудники"
  it('displays employees section', () => {
    renderComponent()
    
    expect(screen.getByText('Сотрудники')).toBeInTheDocument()
    expect(screen.getByText('Список сотрудников')).toBeInTheDocument()
    expect(screen.getByText(/На главной странице раздела отображается таблица со всеми активными сотрудниками/)).toBeInTheDocument()
  })

  it('displays employees action buttons', () => {
    renderComponent()
    
    expect(screen.getByText(/открывает форму редактирования сотрудника/)).toBeInTheDocument()
    expect(screen.getByText(/перемещает сотрудника в архив/)).toBeInTheDocument()
  })

  it('displays employees list image', () => {
    renderComponent()
    
    const employeesListImage = screen.getByAltText('Список сотрудников')
    expect(employeesListImage).toBeInTheDocument()
    expect(employeesListImage).toHaveAttribute('src', '/app-usage/admin-panel/users-list.png')
  })

  it('displays employee creation section', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование сотрудника')).toBeInTheDocument()
    expect(screen.getByText(/Для добавления нового сотрудника используйте кнопку/)).toBeInTheDocument()
    expect(screen.getByText(/«Добавить сотрудника»/)).toBeInTheDocument()
    expect(screen.getByText(/электронная почта, используется как логин для входа/)).toBeInTheDocument()
    expect(screen.getByText(/определяет уровень доступа: администратор, менеджер либо складской сотрудник/)).toBeInTheDocument()
  })

  it('displays employee form image', () => {
    renderComponent()
    
    const employeeFormImage = screen.getByAltText('Форма создания сотрудника')
    expect(employeeFormImage).toBeInTheDocument()
    expect(employeeFormImage).toHaveAttribute('src', '/app-usage/admin-panel/users-form.png')
  })

  it('displays employee archiving section', () => {
    renderComponent()
    
    expect(screen.getByText(/Неактуальных сотрудников можно архивировать/)).toBeInTheDocument()
    expect(screen.getByText(/при архивации сотрудника с ролью «Складской сотрудник», все связанные с ним задачи тоже попадают в архив/)).toBeInTheDocument()
  })

  it('displays employee features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы с сотрудниками')).toBeInTheDocument()
    expect(screen.getByText(/Email сотрудника должен быть уникальным и валидным/)).toBeInTheDocument()
    expect(screen.getByText(/После архивации сотрудник теряет доступ к системе/)).toBeInTheDocument()
  })

  // Тесты для раздела "Услуги"
  it('displays services section', () => {
    renderComponent()
    
    expect(screen.getByText('Услуги')).toBeInTheDocument()
    expect(screen.getByText('Список услуг')).toBeInTheDocument()
    expect(screen.getByText(/На главной странице отображается таблица с активными услугами/)).toBeInTheDocument()
  })

  it('displays services list image', () => {
    renderComponent()
    
    const servicesListImage = screen.getByAltText('Список услуг')
    expect(servicesListImage).toBeInTheDocument()
    expect(servicesListImage).toHaveAttribute('src', '/app-usage/admin-panel/services-list.png')
  })

  it('displays service details section', () => {
    renderComponent()
    
    expect(screen.getByText('Детальный просмотр услуги')).toBeInTheDocument()
    expect(screen.getByText(/При переходе к конкретной услуге/)).toBeInTheDocument()
  })

  it('displays service details image', () => {
    renderComponent()
    
    const serviceDetailsImage = screen.getByAltText('Детали услуги')
    expect(serviceDetailsImage).toBeInTheDocument()
    expect(serviceDetailsImage).toHaveAttribute('src', '/app-usage/admin-panel/services-details.png')
  })

  it('displays service creation section', () => {
    renderComponent()
    
    expect(screen.getByText('Создание и редактирование услуги')).toBeInTheDocument()
    expect(screen.getByText(/Для добавления новой услуги используйте кнопку/)).toBeInTheDocument()
    expect(screen.getByText(/«Добавить услугу»/)).toBeInTheDocument()
    expect(screen.getByText(/Категория/)).toBeInTheDocument()
    expect(screen.getByText(/определяет категорию услуги/)).toBeInTheDocument()
  })

  it('displays service form image', () => {
    renderComponent()
    
    const serviceFormImage = screen.getByAltText('Форма создания услуги')
    expect(serviceFormImage).toBeInTheDocument()
    expect(serviceFormImage).toHaveAttribute('src', '/app-usage/admin-panel/services-form.png')
  })

  it('displays service features section', () => {
    renderComponent()
    
    expect(screen.getByText('Особенности работы с услугами')).toBeInTheDocument()
    expect(screen.getByText(/Цены на услуги можно изменять при создании поставки\/заказа/)).toBeInTheDocument()
  })

  // Тесты для раздела "Счета на оплату"
  it('displays invoices section', () => {
    renderComponent()
    
    expect(screen.getByText('Счета на оплату')).toBeInTheDocument()
    expect(screen.getByText('Список счетов')).toBeInTheDocument()
    expect(screen.getByText(/Раздел/)).toBeInTheDocument()
    expect(screen.getByText(/«Счета»/)).toBeInTheDocument()
    expect(screen.getByText(/позволяет отслеживать все выставленные счета/)).toBeInTheDocument()
  })

  it('displays invoices list image', () => {
    renderComponent()
    
    const invoicesListImage = screen.getByAltText('Список счетов')
    expect(invoicesListImage).toBeInTheDocument()
    expect(invoicesListImage).toHaveAttribute('src', '/app-usage/admin-panel/invoices-list.png')
  })

  it('displays invoice details section', () => {
    renderComponent()
    
    expect(screen.getByText('Детальный просмотр счета')).toBeInTheDocument()
    expect(screen.getByText(/В карточке счета отображается/)).toBeInTheDocument()
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
      expect(image).toHaveClass('rounded-lg', 'border', 'shadow-sm', 'w-5/6', 'mx-auto')
      // Проверяем, что у изображения есть один из возможных margin-top классов
      expect(image.className).toMatch(/mt-[23]/)
    })
  })

  it('displays all section headings with correct styling', () => {
    renderComponent()
    
    const sectionHeadings = screen.getAllByText(/^(Сотрудники|Услуги|Счета на оплату)$/)
    expect(sectionHeadings).toHaveLength(3)
    
    sectionHeadings.forEach(heading => {
      expect(heading).toHaveClass('text-center', 'font-bold', 'text-xl')
    })
  })

  it('displays blue highlighted features sections', () => {
    renderComponent()
    
    const featuresHeadings = screen.getAllByText(/Особенности работы/)
    expect(featuresHeadings.length).toBeGreaterThan(0)
    
    featuresHeadings.forEach(heading => {
      const featuresSection = heading.closest('div')
      expect(featuresSection).toHaveClass('p-4', 'bg-blue-50', 'rounded-lg', 'border', 'border-blue-200')
    })
  })
}) 
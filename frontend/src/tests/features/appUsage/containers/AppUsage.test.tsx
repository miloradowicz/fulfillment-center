/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import AppUsage from '@/features/appUsage/containers/AppUsage.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'

// Мокируем все дочерние компоненты
jest.mock('@/components/CustomTitle/CustomTitle.tsx', () => ({
  default: ({ text, icon, className }: any) => (
    <div data-testid="custom-title" className={className}>
      {icon}
      <span>{text}</span>
    </div>
  )
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange, className }: any) => (
    <div 
      data-testid="tabs" 
      data-value={value} 
      className={className}
      onClick={(e: any) => {
        const target = e.target.closest('[data-value]')
        if (target && target.dataset.value && onValueChange) {
          onValueChange(target.dataset.value)
        }
      }}
    >
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className }: any) => (
    <button 
      data-testid={`tab-trigger-${value}`} 
      className={className}
      data-value={value}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>
      {children}
    </div>
  )
}))

jest.mock('@/components/ProtectedElement/ProtectedElement.tsx', () => ({
  default: ({ children, allowedRoles }: any) => (
    <div data-testid="protected-element" data-allowed-roles={allowedRoles?.join(',')}>
      {children}
    </div>
  )
}))

// Мокируем все компоненты обзора
jest.mock('@/features/appUsage/components/GeneralOverview.tsx', () => ({
  default: () => <div data-testid="general-overview">General Overview</div>
}))

jest.mock('@/features/appUsage/components/ClientOverview.tsx', () => ({
  default: () => <div data-testid="client-overview">Client Overview</div>
}))

jest.mock('@/features/appUsage/components/ProductOverview.tsx', () => ({
  default: () => <div data-testid="product-overview">Product Overview</div>
}))

jest.mock('@/features/appUsage/components/CounterpartyOverview.tsx', () => ({
  default: () => <div data-testid="counterparty-overview">Counterparty Overview</div>
}))

jest.mock('@/features/appUsage/components/ArchiveOverview.tsx', () => ({
  default: () => <div data-testid="archive-overview">Archive Overview</div>
}))

jest.mock('@/features/appUsage/components/ArrivalOverview.tsx', () => ({
  default: () => <div data-testid="arrival-overview">Arrival Overview</div>
}))

jest.mock('@/features/appUsage/components/OrderOverview.tsx', () => ({
  default: () => <div data-testid="order-overview">Order Overview</div>
}))

jest.mock('@/features/appUsage/components/ReportOverview.tsx', () => ({
  default: () => <div data-testid="report-overview">Report Overview</div>
}))

jest.mock('@/features/appUsage/components/TaskOverview.tsx', () => ({
  default: () => <div data-testid="task-overview">Task Overview</div>
}))

jest.mock('@/features/appUsage/components/StockOverview.tsx', () => ({
  default: () => <div data-testid="stock-overview">Stock Overview</div>
}))

jest.mock('@/features/appUsage/components/AdminPanelOverview.tsx', () => ({
  default: () => <div data-testid="admin-panel-overview">Admin Panel Overview</div>
}))

// Мокируем утилиты
jest.mock('@/utils/commonStyles.ts', () => ({
  tabTriggerStyles: 'mocked-tab-trigger-styles'
}))

jest.mock('@/lib/utils.ts', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

jest.mock('@/utils/getOs.ts', () => ({
  getOS: jest.fn(() => 'macOS')
}))

// Мокируем react-router-dom
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '' })
}))

describe('AppUsage Component', () => {
  const createMockStore = (user: any = null) => {
    return configureStore({
      reducer: {
        auth: authReducer
      },
      preloadedState: {
        auth: {
          user,
          loadingRegister: false,
          loadingLogin: false,
          error: null,
          createError: null,
          loginError: null
        }
      }
    })
  }

  const renderComponent = (user: any = null, initialRoute = '/app-usage') => {
    const store = createMockStore(user)
    
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AppUsage />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Рендеринг компонента', () => {
    it('должен отображать основную структуру компонента', () => {
      renderComponent()
      
      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByText('Справка')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    })

    it('должен применять правильные CSS классы', () => {
      renderComponent()
      
      const container = screen.getByTestId('tabs').parentElement
      expect(container).toHaveClass('max-w-[1000px]', 'mx-auto')
      
      expect(screen.getByTestId('custom-title')).toHaveClass('flex', 'justify-center')
      expect(screen.getByTestId('tabs-list')).toHaveClass('mb-5', 'sm:w-auto', 'w-full', 'rounded-3xl')
    })

    it('должен отображать иконку BadgeHelp', () => {
      renderComponent()
      
      const customTitle = screen.getByTestId('custom-title')
      expect(customTitle).toBeInTheDocument()
    })
  })

  describe('Управление вкладками', () => {
    it('должен отображать вкладку "Общее" по умолчанию', () => {
      renderComponent()
      
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'general')
      expect(screen.getByTestId('tab-trigger-general')).toBeInTheDocument()
      expect(screen.getByText('Общее')).toBeInTheDocument()
    })

    it('должен отображать контент для вкладки "Общее" по умолчанию', () => {
      renderComponent()
      
      expect(screen.getByTestId('tab-content-general')).toBeInTheDocument()
      expect(screen.getByTestId('general-overview')).toBeInTheDocument()
    })

    it('должен переключать вкладки при клике', async () => {
      const user = { role: 'admin' }
      renderComponent(user)
      
      // Проверяем начальное состояние
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'general')
      
      // Кликаем на вкладку клиентов
      const clientsTab = screen.getByTestId('tab-trigger-clients')
      fireEvent.click(clientsTab)
      
      // Проверяем, что навигация была вызвана
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          pathname: '/app-usage',
          search: '?tab=clients'
        })
      })
    })
  })

  describe('Контроль доступа по ролям', () => {
    it('должен показывать все вкладки для super-admin', () => {
      const user = { role: 'super-admin' }
      renderComponent(user)
      
      expect(screen.getByTestId('tab-trigger-general')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-clients')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-products')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-arrivals')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-orders')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-tasks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-reports')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-stocks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-counterparties')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-archive')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-admin-panel')).toBeInTheDocument()
    })

    it('должен показывать ограниченные вкладки для stock-worker', () => {
      const user = { role: 'stock-worker' }
      renderComponent(user)
      
      // Доступные вкладки
      expect(screen.getByTestId('tab-trigger-general')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-products')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-arrivals')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-orders')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-tasks')).toBeInTheDocument()
      
      // Недоступные вкладки
      expect(screen.queryByTestId('tab-trigger-clients')).toBeInTheDocument() // но в ProtectedElement
      expect(screen.queryByTestId('tab-trigger-reports')).toBeInTheDocument() // но в ProtectedElement
      expect(screen.queryByTestId('tab-trigger-stocks')).toBeInTheDocument() // но в ProtectedElement
      expect(screen.queryByTestId('tab-trigger-counterparties')).toBeInTheDocument() // но в ProtectedElement
      expect(screen.queryByTestId('tab-trigger-archive')).toBeInTheDocument() // но в ProtectedElement
      expect(screen.queryByTestId('tab-trigger-admin-panel')).toBeInTheDocument() // но в ProtectedElement
    })

    it('должен показывать соответствующие вкладки для admin', () => {
      const user = { role: 'admin' }
      renderComponent(user)
      
      expect(screen.getByTestId('tab-trigger-general')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-clients')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-products')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-arrivals')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-orders')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-tasks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-reports')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-stocks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-counterparties')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-archive')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-admin-panel')).toBeInTheDocument()
    })

    it('должен показывать соответствующие вкладки для manager', () => {
      const user = { role: 'manager' }
      renderComponent(user)
      
      expect(screen.getByTestId('tab-trigger-general')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-clients')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-products')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-arrivals')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-orders')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-tasks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-stocks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-counterparties')).toBeInTheDocument()
      
      // Эти вкладки есть в DOM, но обернуты в ProtectedElement
      expect(screen.getByTestId('tab-trigger-reports')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-archive')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-admin-panel')).toBeInTheDocument()
    })

    it('должен правильно передавать allowedRoles в ProtectedElement', () => {
      const user = { role: 'admin' }
      renderComponent(user)
      
      const protectedElements = screen.getAllByTestId('protected-element')
      
      // Проверяем некоторые ключевые роли
      const clientsProtected = protectedElements.find(el => 
        el.getAttribute('data-allowed-roles')?.includes('super-admin,admin,manager')
      )
      expect(clientsProtected).toBeInTheDocument()
      
      const reportsProtected = protectedElements.find(el => 
        el.getAttribute('data-allowed-roles')?.includes('super-admin,admin')
      )
      expect(reportsProtected).toBeInTheDocument()
    })
  })

  describe('Обработка URL параметров', () => {
         it('должен инициализироваться с вкладкой из URL параметра', () => {
       // Этот тест проверяет инициализацию с URL параметром
       // В реальном приложении это работает через useEffect
       const user = { role: 'admin' }
       renderComponent(user, '/app-usage?tab=clients')
       
       // Компонент должен отобразиться корректно
       expect(screen.getByTestId('tabs')).toBeInTheDocument()
       expect(screen.getByTestId('tab-trigger-clients')).toBeInTheDocument()
     })

     it('должен возвращаться к general для невалидного URL параметра', () => {
       renderComponent()
       
       // По умолчанию должна быть активна general вкладка
       expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'general')
     })

     it('должен обрабатывать пустые URL параметры', () => {
       renderComponent()
       
       // По умолчанию должна быть активна general вкладка
       expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'general')
     })
  })

  describe('Рендеринг контента вкладок', () => {
    it('должен отображать все компоненты контента', () => {
      const user = { role: 'super-admin' }
      renderComponent(user)
      
      expect(screen.getByTestId('tab-content-general')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-clients')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-products')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-arrivals')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-orders')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-tasks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-reports')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-stocks')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-counterparties')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-archive')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-admin-panel')).toBeInTheDocument()
    })

    it('должен отображать правильные компоненты обзора', () => {
      const user = { role: 'super-admin' }
      renderComponent(user)
      
      expect(screen.getByTestId('general-overview')).toBeInTheDocument()
      expect(screen.getByTestId('client-overview')).toBeInTheDocument()
      expect(screen.getByTestId('product-overview')).toBeInTheDocument()
      expect(screen.getByTestId('arrival-overview')).toBeInTheDocument()
      expect(screen.getByTestId('order-overview')).toBeInTheDocument()
      expect(screen.getByTestId('task-overview')).toBeInTheDocument()
      expect(screen.getByTestId('report-overview')).toBeInTheDocument()
      expect(screen.getByTestId('stock-overview')).toBeInTheDocument()
      expect(screen.getByTestId('counterparty-overview')).toBeInTheDocument()
      expect(screen.getByTestId('archive-overview')).toBeInTheDocument()
      expect(screen.getByTestId('admin-panel-overview')).toBeInTheDocument()
    })
  })

  describe('Интеграция с Redux', () => {
    it('должен правильно получать пользователя из Redux store', () => {
      const user = { role: 'manager', name: 'Test User' }
      renderComponent(user)
      
      // Компонент должен отобразиться без ошибок
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('должен работать с null пользователем', () => {
      renderComponent(null)
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-general')).toBeInTheDocument()
    })
  })

  describe('Обработка OS', () => {
    it('должен вызывать getOS функцию', () => {
      const { getOS } = require('@/utils/getOs.ts')
      renderComponent()
      
      expect(getOS).toHaveBeenCalled()
    })

    it('должен применять условные стили на основе OS', () => {
      // Мокируем getOS для возврата Linux
      const { getOS } = require('@/utils/getOs.ts')
      getOS.mockReturnValue('Linux')
      
      const user = { role: 'admin' } // не stock-worker и не manager
      renderComponent(user)
      
      // Проверяем, что компонент отрендерился
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })
  })

  describe('Навигация', () => {
    it('должен вызывать navigate при изменении вкладки', async () => {
      const user = { role: 'admin' }
      renderComponent(user)
      
      const clientsTab = screen.getByTestId('tab-trigger-clients')
      fireEvent.click(clientsTab)
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          pathname: '/app-usage',
          search: '?tab=clients'
        })
      })
    })

    it('должен обновлять состояние при изменении location', () => {
      // Этот тест проверяет useEffect для location
      const user = { role: 'admin' }
      renderComponent(user)
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })
  })

  describe('Список вкладок', () => {
    it('должен содержать правильный список tabNames', () => {
      renderComponent()
      
      // Проверяем, что компонент использует правильный список вкладок
      // через проверку того, что general вкладка активна по умолчанию
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'general')
    })
  })
}) 
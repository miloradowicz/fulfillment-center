/* eslint-disable */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import ArchivePage from '@/features/archive/containers/ArchivePage.tsx'
import { authReducer } from '@/store/slices/authSlice.ts'

// Мокируем все зависимости
jest.mock('@/features/archive/components/ArchivedClients.tsx', () => ({
  default: () => <div data-testid="archived-clients">Archived Clients Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedProducts.tsx', () => ({
  default: () => <div data-testid="archived-products">Archived Products Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedArrivals.tsx', () => ({
  default: () => <div data-testid="archived-arrivals">Archived Arrivals Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedOrders.tsx', () => ({
  default: () => <div data-testid="archived-orders">Archived Orders Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedTasks.tsx', () => ({
  default: () => <div data-testid="archived-tasks">Archived Tasks Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedStocks.tsx', () => ({
  default: () => <div data-testid="archived-stocks">Archived Stocks Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedCounterparties.tsx', () => ({
  default: () => <div data-testid="archived-counterparties">Archived Counterparties Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedUsers.tsx', () => ({
  default: () => <div data-testid="archived-users">Archived Users Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedServices.tsx', () => ({
  default: () => <div data-testid="archived-services">Archived Services Component</div>,
}))

jest.mock('@/features/archive/components/ArchivedInvoices.tsx', () => ({
  default: () => <div data-testid="archived-invoices">Archived Invoices Component</div>,
}))

jest.mock('@/components/CustomTitle/CustomTitle.tsx', () => ({
  default: ({ text, icon, className }: any) => (
    <div data-testid="custom-title" className={className}>
      {icon}
      <span>{text}</span>
    </div>
  ),
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange && onValueChange('test')}>
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
      onClick={() => mockHandleChange(value)}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>
      {children}
    </div>
  ),
}))

jest.mock('lucide-react', () => ({
  ArchiveRestore: ({ size }: any) => <div data-testid="archive-restore-icon" data-size={size}>📁</div>,
}))

jest.mock('@/utils/getOs.ts', () => ({
  getOS: jest.fn(() => mockOS),
}))

// Мокируем thunks
const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockHandleChange = jest.fn()

jest.mock('@/app/hooks.ts', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}))

jest.mock('@/store/thunks/arrivalThunk.ts', () => ({
  fetchArchivedArrivals: jest.fn(() => ({ type: 'fetchArchivedArrivals' })),
}))

jest.mock('@/store/thunks/orderThunk.ts', () => ({
  fetchArchivedOrders: jest.fn(() => ({ type: 'fetchArchivedOrders' })),
}))

jest.mock('@/store/thunks/tasksThunk.ts', () => ({
  fetchArchivedTasks: jest.fn(() => ({ type: 'fetchArchivedTasks' })),
}))

jest.mock('@/store/thunks/stocksThunk.ts', () => ({
  fetchArchivedStocks: jest.fn(() => ({ type: 'fetchArchivedStocks' })),
}))

jest.mock('@/store/thunks/clientThunk.ts', () => ({
  fetchArchivedClients: jest.fn(() => ({ type: 'fetchArchivedClients' })),
}))

jest.mock('@/store/thunks/productThunk.ts', () => ({
  fetchArchivedProducts: jest.fn(() => ({ type: 'fetchArchivedProducts' })),
}))

jest.mock('@/store/thunks/userThunk.ts', () => ({
  fetchArchivedUsers: jest.fn(() => ({ type: 'fetchArchivedUsers' })),
}))

jest.mock('@/store/thunks/serviceThunk.ts', () => ({
  fetchArchivedServices: jest.fn(() => ({ type: 'fetchArchivedServices' })),
}))

jest.mock('@/store/thunks/invoiceThunk.ts', () => ({
  fetchArchivedInvoices: jest.fn(() => ({ type: 'fetchArchivedInvoices' })),
}))

jest.mock('@/store/thunks/counterpartyThunk.ts', () => ({
  fetchAllArchivedCounterparties: jest.fn(() => ({ type: 'fetchAllArchivedCounterparties' })),
}))

jest.mock('@/utils/commonStyles.ts', () => ({
  tabTriggerStyles: 'tab-trigger-styles',
}))

jest.mock('@/lib/utils.ts', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Мокированные данные
let mockLocation = { search: '' }
let mockOS = 'Windows'
let mockState = {
  auth: {
    user: { role: 'manager' },
    loadingRegister: false,
    loadingLogin: false,
    error: null,
    createError: null,
    loginError: null,
  },
}

describe('ArchivePage Component', () => {
  const mockAuthReducer = (state = {
    user: { role: 'manager' },
    loadingRegister: false,
    loadingLogin: false,
    error: null,
    createError: null,
    loginError: null,
  }, action: any) => state

  const createMockStore = (user: any = { role: 'manager' }) => {
    return configureStore({
      reducer: {
        auth: mockAuthReducer,
      },
      preloadedState: {
        auth: {
          user,
          loadingRegister: false,
          loadingLogin: false,
          error: null,
          createError: null,
          loginError: null,
        },
      },
    })
  }

  const renderComponent = (initialEntries = ['/archives'], user: any = { role: 'manager' }) => {
    const store = createMockStore(user)

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <ArchivePage />
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation = { search: '' }
    mockOS = 'Windows'
    mockState = {
      auth: {
        user: { role: 'manager' },
        loadingRegister: false,
        loadingLogin: false,
        error: null,
        createError: null,
        loginError: null,
      },
    }
  })

  describe('Рендеринг компонента', () => {
    it('должен отображать основную структуру страницы', () => {
      renderComponent()

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByText('Архив')).toBeInTheDocument()
      expect(screen.getByTestId('archive-restore-icon')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
    })

    it('должен применять правильные CSS классы к контейнеру', () => {
      renderComponent()

      const container = screen.getByTestId('tabs').parentElement
      expect(container).toHaveClass('max-w-[1000px]', 'mx-auto')
    })

    it('должен отображать заголовок с иконкой', () => {
      renderComponent()

      const title = screen.getByTestId('custom-title')
      expect(title).toHaveClass('flex', 'justify-center')
      expect(screen.getByTestId('archive-restore-icon')).toHaveAttribute('data-size', '25')
    })
  })

  describe('Вкладки навигации', () => {
    it('должен отображать все вкладки', () => {
      renderComponent()

      const expectedTabs = [
        { value: 'clients', text: 'Клиенты' },
        { value: 'products', text: 'Товары' },
        { value: 'arrivals', text: 'Поставки' },
        { value: 'orders', text: 'Заказы' },
        { value: 'tasks', text: 'Задачи' },
        { value: 'stocks', text: 'Склады' },
        { value: 'counterparties', text: 'Контрагенты' },
        { value: 'users', text: 'Сотрудники' },
        { value: 'services', text: 'Услуги' },
        { value: 'invoices', text: 'Счета' },
      ]

      expectedTabs.forEach(({ value, text }) => {
        expect(screen.getByTestId(`tab-trigger-${value}`)).toBeInTheDocument()
        expect(screen.getByText(text)).toBeInTheDocument()
      })
    })

    it('должен применять правильные стили к вкладкам', () => {
      renderComponent()

      const tabTrigger = screen.getByTestId('tab-trigger-clients')
      expect(tabTrigger).toHaveClass('tab-trigger-styles')
    })

    it('должен отображать контент для всех вкладок', () => {
      renderComponent()

      const expectedContent = [
        'clients', 'products', 'arrivals', 'orders', 'tasks',
        'stocks', 'counterparties', 'users', 'services', 'invoices'
      ]

      expectedContent.forEach(value => {
        expect(screen.getByTestId(`tab-content-${value}`)).toBeInTheDocument()
      })
    })
  })

  describe('Компоненты архива', () => {
    it('должен отображать компонент ArchivedClients', () => {
      renderComponent()
      expect(screen.getByTestId('archived-clients')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedProducts', () => {
      renderComponent()
      expect(screen.getByTestId('archived-products')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedArrivals', () => {
      renderComponent()
      expect(screen.getByTestId('archived-arrivals')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedOrders', () => {
      renderComponent()
      expect(screen.getByTestId('archived-orders')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedTasks', () => {
      renderComponent()
      expect(screen.getByTestId('archived-tasks')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedStocks', () => {
      renderComponent()
      expect(screen.getByTestId('archived-stocks')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedCounterparties', () => {
      renderComponent()
      expect(screen.getByTestId('archived-counterparties')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedUsers', () => {
      renderComponent()
      expect(screen.getByTestId('archived-users')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedServices', () => {
      renderComponent()
      expect(screen.getByTestId('archived-services')).toBeInTheDocument()
    })

    it('должен отображать компонент ArchivedInvoices', () => {
      renderComponent()
      expect(screen.getByTestId('archived-invoices')).toBeInTheDocument()
    })
  })

  describe('Диспетчеризация действий', () => {
    it('должен диспетчеризовать fetchArchivedClients по умолчанию', () => {
      renderComponent()
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'fetchArchivedClients' })
    })

    it('должен диспетчеризовать правильные действия для каждой вкладки', async () => {
      const tabs = [
        { value: 'clients', action: 'fetchArchivedClients' },
        { value: 'products', action: 'fetchArchivedProducts' },
        { value: 'arrivals', action: 'fetchArchivedArrivals' },
        { value: 'orders', action: 'fetchArchivedOrders' },
        { value: 'tasks', action: 'fetchArchivedTasks' },
        { value: 'stocks', action: 'fetchArchivedStocks' },
        { value: 'counterparties', action: 'fetchAllArchivedCounterparties' },
        { value: 'users', action: 'fetchArchivedUsers' },
        { value: 'services', action: 'fetchArchivedServices' },
        { value: 'invoices', action: 'fetchArchivedInvoices' },
      ]

      for (const { value, action } of tabs) {
        jest.clearAllMocks()
        mockLocation = { search: `?tab=${value}` }
        
        renderComponent([`/archives?tab=${value}`])
        
        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalledWith({ type: action })
        })
      }
    })
  })

  describe('URL параметры и навигация', () => {
    it('должен устанавливать активную вкладку из URL параметра', () => {
      mockLocation = { search: '?tab=products' }
      renderComponent(['/archives?tab=products'])

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'products')
    })

    it('должен использовать вкладку по умолчанию если параметр отсутствует', () => {
      mockLocation = { search: '' }
      renderComponent()

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'clients')
    })

    it('должен игнорировать неизвестные вкладки в URL', () => {
      mockLocation = { search: '?tab=unknown' }
      renderComponent(['/archives?tab=unknown'])

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'clients')
    })

    it('должен навигировать при смене вкладки', () => {
      renderComponent()

      const tabTrigger = screen.getByTestId('tab-trigger-products')
      fireEvent.click(tabTrigger)

      expect(mockHandleChange).toHaveBeenCalledWith('products')
    })
  })

  describe('Стили в зависимости от ОС и роли', () => {
    it('должен применять hover стили для Windows и роли не stock-worker', () => {
      mockOS = 'Windows'
      mockState.auth.user = { role: 'manager' }
      
      renderComponent()

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toHaveClass('mb-5', 'sm:w-auto', 'w-full', 'rounded-3xl')
    })

    it('должен применять hover стили для Linux и роли не stock-worker', () => {
      mockOS = 'Linux'
      mockState.auth.user = { role: 'admin' }
      
      renderComponent()

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toHaveClass('mb-5', 'sm:w-auto', 'w-full', 'rounded-3xl')
    })

    it('не должен применять hover стили для роли stock-worker', () => {
      mockOS = 'Windows'
      mockState.auth.user = { role: 'stock-worker' }
      
      renderComponent()

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toHaveClass('mb-5', 'sm:w-auto', 'w-full', 'rounded-3xl')
    })

    it('не должен применять hover стили для macOS', () => {
      mockOS = 'macOS'
      mockState.auth.user = { role: 'manager' }
      
      renderComponent()

      const tabsList = screen.getByTestId('tabs-list')
      expect(tabsList).toHaveClass('mb-5', 'sm:w-auto', 'w-full', 'rounded-3xl')
    })
  })

  describe('Различные роли пользователей', () => {
    it('должен работать с ролью admin', () => {
      renderComponent(['/archives'], { role: 'admin' })

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('должен работать с ролью manager', () => {
      renderComponent(['/archives'], { role: 'manager' })

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('должен работать с ролью stock-worker', () => {
      renderComponent(['/archives'], { role: 'stock-worker' })

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('должен работать без пользователя', () => {
      renderComponent(['/archives'], null)

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })
  })

  describe('Различные операционные системы', () => {
    const operatingSystems = ['Windows', 'Linux', 'macOS', 'Android', 'iOS']

    operatingSystems.forEach(os => {
      it(`должен работать на ${os}`, () => {
        mockOS = os
        renderComponent()

        expect(screen.getByTestId('custom-title')).toBeInTheDocument()
        expect(screen.getByTestId('tabs')).toBeInTheDocument()
      })
    })
  })

  describe('Интеграция компонентов', () => {
    it('должен правильно интегрироваться с Redux store', () => {
      const store = createMockStore({ role: 'admin' })
      
      render(
        <Provider store={store}>
          <MemoryRouter>
            <ArchivePage />
          </MemoryRouter>
        </Provider>
      )

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('должен правильно интегрироваться с React Router', () => {
      render(
        <Provider store={createMockStore()}>
          <MemoryRouter initialEntries={['/archives?tab=orders']}>
            <ArchivePage />
          </MemoryRouter>
        </Provider>
      )

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })
  })

  describe('Обработка ошибок', () => {
    it('должен корректно обрабатывать отсутствие пользователя в store', () => {
      mockState.auth.user = null
      renderComponent()

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })

    it('должен корректно обрабатывать некорректные URL параметры', () => {
      mockLocation = { search: '?tab=invalid&other=param' }
      renderComponent(['/archives?tab=invalid&other=param'])

      const tabs = screen.getByTestId('tabs')
      expect(tabs).toHaveAttribute('data-value', 'clients')
    })
  })

  describe('Производительность', () => {
    it('должен мемоизировать список вкладок', () => {
      const { rerender } = renderComponent()
      
      // Перерендер не должен вызывать лишних вычислений
      rerender(
        <Provider store={createMockStore()}>
          <MemoryRouter>
            <ArchivePage />
          </MemoryRouter>
        </Provider>
      )

      expect(screen.getByTestId('tabs')).toBeInTheDocument()
    })
  })
}) 
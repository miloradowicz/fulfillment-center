import * as React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CustomTitle from '@/components/CustomTitle/CustomTitle.tsx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { tabTriggerStyles } from '@/utils/commonStyles.ts'
import { BadgeHelp } from 'lucide-react'
import GeneralOverview from '@/features/appUsage/components/GeneralOverview.tsx'
import ClientOverview from '@/features/appUsage/components/ClientOverview.tsx'
import ProductOverview from '@/features/appUsage/components/ProductOverview.tsx'
import CounterpartyOverview from '@/features/appUsage/components/CounterpartyOverview.tsx'
import ArchiveOverview from '@/features/appUsage/components/ArchiveOverview.tsx'
import ArrivalOverview from '@/features/appUsage/components/ArrivalOverview.tsx'
import OrderOverview from '@/features/appUsage/components/OrderOverview.tsx'
import ReportOverview from '@/features/appUsage/components/ReportOverview.tsx'
import TaskOverview from '@/features/appUsage/components/TaskOverview.tsx'
import StockOverview from '@/features/appUsage/components/StockOverview.tsx'
import AdminPanelOverview from '@/features/appUsage/components/AdminPanelOverview.tsx'
import ProtectedElement from '@/components/ProtectedElement/ProtectedElement.tsx'
import { cn } from '@/lib/utils.ts'
import { getOS } from '@/utils/getOs.ts'
import { useAppSelector } from '@/app/hooks.ts'
import { selectUser } from '@/store/slices/authSlice.ts'

const AppUsage = () =>  {
  const [value, setValue] = useState('general')
  const location = useLocation()
  const navigate = useNavigate()
  const [os] = useState<string>(getOS())
  const user = useAppSelector(selectUser)

  const tabNames = React.useMemo(() => ['general', 'clients', 'products','arrivals', 'orders', 'tasks', 'stocks', 'counterparties', 'users', 'services', 'invoices'], [])

  const handleChange = (newTab: string) => {
    navigate({
      pathname: '/app-usage',
      search: `?tab=${ newTab }`,
    })
    setValue(newTab)
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const tab = queryParams.get('tab')
    if (tab && tabNames.includes(tab)) {
      setValue(tab)
    }
  }, [location, tabNames])

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="my-7">
        <CustomTitle className="flex justify-center" text="Справка" icon={<BadgeHelp size={25} />} />
      </div>

      <Tabs value={value} onValueChange={handleChange} className="w-full">
        <TabsList className="mb-5 sm:w-auto w-full rounded-3xl">
          <div
            className={cn(
              'inline-flex flex-nowrap px-2 space-x-2 sm:space-x-4 overflow-x-auto hide-scrollbar',
              (os === 'Linux' || os === 'Windows') && (user?.role !== 'stock-worker' && user?.role !== 'manager') ? 'hover:pt-[11px]' : '',
            )}
          >
            <TabsTrigger className={tabTriggerStyles} value="general">Общее</TabsTrigger>

            <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']}>
              <TabsTrigger className={tabTriggerStyles} value="clients">Клиенты</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
              <TabsTrigger className={tabTriggerStyles} value="products">Товары</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
              <TabsTrigger className={tabTriggerStyles} value="arrivals">Поставки</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
              <TabsTrigger className={tabTriggerStyles} value="orders">Заказы</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
              <TabsTrigger className={tabTriggerStyles} value="tasks">Задачи</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin']}>
              <TabsTrigger className={tabTriggerStyles} value="reports">Отчеты</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']}>
              <TabsTrigger className={tabTriggerStyles} value="stocks">Склады</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']}>
              <TabsTrigger className={tabTriggerStyles} value="counterparties">Контрагенты</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin']}>
              <TabsTrigger className={tabTriggerStyles} value="archive">Архив</TabsTrigger>
            </ProtectedElement>

            <ProtectedElement allowedRoles={['super-admin', 'admin']}>
              <TabsTrigger className={tabTriggerStyles} value="admin-panel">Админ панель</TabsTrigger>
            </ProtectedElement>
          </div>
        </TabsList>

        <TabsContent value="general">
          <GeneralOverview />
        </TabsContent>

        <TabsContent value="clients">
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']}>
            <ClientOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="products">
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
            <ProductOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="arrivals">
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
            <ArrivalOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="orders">
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
            <OrderOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="tasks">
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager', 'stock-worker']}>
            <TaskOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="reports">
          <ProtectedElement allowedRoles={['super-admin', 'admin']}>
            <ReportOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="stocks">
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']}>
            <StockOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="counterparties">
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']}>
            <CounterpartyOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="archive">
          <ProtectedElement allowedRoles={['super-admin', 'admin']}>
            <ArchiveOverview />
          </ProtectedElement>
        </TabsContent>

        <TabsContent value="admin-panel">
          <ProtectedElement allowedRoles={['super-admin', 'admin']}>
            <AdminPanelOverview />
          </ProtectedElement>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AppUsage

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

const AppUsage = () =>  {
  const [value, setValue] = useState('general')
  const location = useLocation()
  const navigate = useNavigate()

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
        <TabsList className="mb-5 w-full h-auto">
          <div className="inline-flex flex-nowrap px-2 space-x-2 sm:space-x-4 overflow-x-auto">
            <TabsTrigger className={tabTriggerStyles} value="general">Общее</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="clients">Клиенты</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="products">Товары</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles}  value="arrivals">Поставки</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="orders">Заказы</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="tasks">Задачи</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="reports">Отчеты</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="stocks">Склады</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="counterparties">Контрагенты</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="archive">Архив</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="admin-panel">Админ панель</TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="general">
          <GeneralOverview />
        </TabsContent>

        <TabsContent value="clients">
          <ClientOverview />
        </TabsContent>

        <TabsContent value="products">
          <ProductOverview />
        </TabsContent>

        <TabsContent value="arrivals">
          <ArrivalOverview />
        </TabsContent>

        <TabsContent value="orders">
          <OrderOverview />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskOverview />
        </TabsContent>

        <TabsContent value="reports">
          <ReportOverview />
        </TabsContent>

        <TabsContent value="stocks">
          <StockOverview />
        </TabsContent>

        <TabsContent value="counterparties">
          <CounterpartyOverview />
        </TabsContent>

        <TabsContent value="archive">
          <ArchiveOverview />
        </TabsContent>

        <TabsContent value="admin-panel">
          <AdminPanelOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AppUsage

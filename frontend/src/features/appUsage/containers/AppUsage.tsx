import * as React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CustomTitle from '@/components/CustomTitle/CustomTitle.tsx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { tabTriggerStyles } from '@/utils/commonStyles.ts'
import { BadgeHelp } from 'lucide-react'

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
            <TabsTrigger className={tabTriggerStyles} value="stocks">Склады</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="counterparties">Контрагенты</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="users">Сотрудники</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="services">Услуги</TabsTrigger>
            <TabsTrigger className={tabTriggerStyles} value="invoices">Счета</TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="general">
          Общее описание проекта
        </TabsContent>

        <TabsContent value="clients">
          Клиенты
        </TabsContent>

        <TabsContent value="products">
          Товары
        </TabsContent>

        <TabsContent value="arrivals">
          Поставки
        </TabsContent>

        <TabsContent value="orders">
          Заказы
        </TabsContent>

        <TabsContent value="tasks">
          Задачи
        </TabsContent>

        <TabsContent value="stocks">
          Склады
        </TabsContent>

        <TabsContent value="counterparties">
          Контрагенты
        </TabsContent>

        <TabsContent value="users">
          Пользователи
        </TabsContent>

        <TabsContent value="services">
          Услуги
        </TabsContent>

        <TabsContent value="invoices">
          Счета
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AppUsage

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProtectedElement from '@/components/ProtectedElement/ProtectedElement.tsx'

const images = [
  '/app-usage/archive/archive-main.png',
]

const ArchiveOverview = () => {

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Общее описание функционала архива</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-1">
          <strong>Система архивации</strong> позволяет работать с неактивными сущностями: просматривать,
          восстанавливать или полностью удалять их из системы. Система поддерживает работу с архивными версиями
          следующих сущностей:
        </p>
        <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
          <li>Клиенты</li>
          <li>Товары</li>
          <li>Поставки</li>
          <li>Заказы</li>
          <li>Задачи</li>
          <li>Склады</li>
          <li>Контрагенты</li>
          <li>Сотрудники</li>
          <li>Услуги</li>
          <li>Счета</li>
        </ul>

        <div>
          <h3 className="font-semibold">Навигация по архиву</h3>
          <p>
            Архив организован в виде вкладок для разных типов сущностей. Для переключения между разделами
            используйте горизонтальное меню в верхней части страницы.
          </p>
          <img
            src={images[0]}
            alt="Главный экран архива"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Просмотр архивных записей</h3>
          <p>
            Каждая вкладка содержит таблицу с соответствующими архивными записями. Для всех сущностей
            доступны:
          </p>
          <ul className="list-disc pl-5">
            <li>Сортировка и фильтрация по основным полям</li>
            <li>Постраничная навигация</li>
            <li>Поиск по всем данным таблицы</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Действия с архивными записями</h3>
          <p>
            Для каждой записи в столбце <strong>Действия</strong> доступны:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>«Восстановить»</strong> — возвращает сущность в основной список</li>
            <ProtectedElement allowedRoles={['super-admin']}>
              <li><strong>«Удалить»</strong> — полностью удаляет запись из системы</li>
            </ProtectedElement>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Подтверждение действий</h3>
          <p>
            При выборе любого действия система запрашивает подтверждение:
          </p>
          <ul className="list-disc pl-5">
            <li>Для восстановления — подтверждение переноса в основной список</li>
            <ProtectedElement allowedRoles={['super-admin']}>
              <li>Для удаления — предупреждение о безвозвратном удалении данных</li>
            </ProtectedElement>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Особенности работы</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Восстановленные данные появляются в своих основных разделах</li>
            <ProtectedElement allowedRoles={['super-admin']}>
              <li>Удаленные данные невозможно восстановить</li>
            </ProtectedElement>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ArchiveOverview

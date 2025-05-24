import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSelector } from '@/app/hooks.ts'
import { selectUser } from '@/store/slices/authSlice.ts'
import ProtectedElement from '@/components/ProtectedElement/ProtectedElement.tsx'

const images = [
  '/app-usage/orders/orders-list.png',
  '/app-usage/orders/orders-form.png',
  '/app-usage/orders/orders-details.png',
  '/app-usage/orders/orders-list(SW).png',
  '/app-usage/orders/orders-details(SW).png',
]

const OrderOverview = () => {
  const user = useAppSelector(selectUser)

  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Общее описание функционала заказов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Система управления заказами</strong> обеспечивает полный цикл работы с клиентскими заказами:
          от создания до доставки, включая контроль оплат и документооборот.
        </p>

        <div>
          <h3 className="font-semibold">Список заказов</h3>
          <p>
            В таблице отображаются все активные заказы с возможностью сортировки и фильтрации по:
          </p>
          <ul className="list-disc pl-5">
            <li>Номеру заказа</li>
            <li>Клиенту</li>
            <li>Складу отгрузки</li>
            <li>Дате отправки/доставки</li>
            <li>Статусу доставки</li>
            <li>Статусу оплаты</li>
          </ul>
          <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']} >
            <p className="mt-2">
              Доступные действия:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>«Подробнее»</strong> — детальная информация о заказе</li>
              <li><strong>«Редактировать»</strong> — изменение данных заказа</li>
              <li><strong>«Архивировать»</strong> — перемещение в архив</li>
              <li><strong>«Отменить»</strong> — при ошибочном создании поставки, удаляет ее из системы</li>
            </ul>
            <p className="mt-2">
              Для удобства на главной странице была добавлена кнопка вызова формы:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>«Выставить счет»</strong> — формирование платежного документа</li>
            </ul>
          </ProtectedElement>
          <img
            src={user?.role === 'stock-worker' ? images[3] : images[0]}
            alt="Список заказов"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Детальный просмотр заказа</h3>
          <p>
            В карточке заказа отображается:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>Основные данные</strong> — номер заказа, статусы доставки и оплаты, даты отправки и прибытия,
              клиент и его контакты, склад с которого был отправлен заказ
            </li>
            <li><strong>Вкладки</strong> с детализацией по отправленным, полученным и дефектным товарам, оказанным
              услугам и истории изменений
            </li>
          </ul>
          <img
            src={user?.role === 'stock-worker' ? images[4] : images[2]}
            alt="Детали заказа"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>
        <ProtectedElement allowedRoles={['super-admin', 'admin', 'manager']} >
          <div>
            <h3 className="font-semibold">Создание и редактирование</h3>
            <p>
              Форма включает разделы:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Обязательные поля</strong> — клиент, склад, даты, статус</li>
              <li><strong>Отправленные товары</strong> — выбор из каталога клиента с указанием количества</li>
              <li><strong>Дефекты</strong> — товары, которые были получены с дефектами</li>
              <li><strong>Услуги</strong> — услуги, оказанные при поставке. По умолчанию данные
                подставляются автоматически, но при желании можно их корректировать
              </li>
              <li><strong>Документы</strong> — прикреплённые файлы (PDF, Word, Excel), не более 10 МБ каждый</li>
              <li><strong>Комментарии</strong> — внутренние заметки</li>
            </ul>
            <img
              src={images[1]}
              alt="Форма заказа"
              className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold">Жизненный цикл заказа</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Формирование</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Выбор товаров из каталога клиента</li>
                  <li>Указание точных количеств</li>
                  <li>Назначение склада отгрузки</li>
                </ul>
              </li>
              <li>
                <strong>Обработка</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Формирование сопроводительных документов</li>
                  <li>Контроль оплаты (полной/частичной)</li>
                </ul>
              </li>
              <li>
                <strong>Исполнение</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Отметка о фактической отгрузке</li>
                  <li>Фиксация дефектов при приемке</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold">Архивация</h3>
            <p>
              Неактуальные заказы можно архивировать (кнопка <strong>«Архивировать»</strong>). Такие заказы
              перемещаются в архив и исключаются из основного списка. Важно отметить, что архивировать можно только полностью
              оплаченные заказы и со статусом «Доставлен».
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800">Ключевые особенности</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>Изменение статуса поставки влияет на доступные действия</li>
              <li>Гибкое управление услугами с возможностью переопределения цен</li>
              <li>Все изменения фиксируются в истории</li>
            </ul>
          </div>
        </ProtectedElement>
      </CardContent>
    </Card>
  )
}

export default OrderOverview

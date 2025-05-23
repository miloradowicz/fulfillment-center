import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const images = [
  '/app-usage/clients/clients-list.png',
  '/app-usage/clients/clients-form.png',
  '/app-usage/clients/clients-details.png',
]

const ClientOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Общее описание функционала клиентов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Система управления клиентами</strong> предоставляет удобный интерфейс для эффективной работы с клиентскими
          данными: создавать, просматривать, редактировать и архивировать клиентов.
        </p>

        <div>
          <h3 className="font-semibold">Список клиентов</h3>
          <p>
            На главной странице раздела отображается таблица со всеми активными клиентами. Здесь вы можете сортировать и
            фильтровать список, быстро находить нужного клиента и выполнять действия через
            столбец <strong>Действия</strong>.
          </p>
          <p className="mt-2">
            В столбце <strong>Действия</strong> доступны следующие кнопки:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>«Подробнее»</strong> — открывает боковую панель с детальной информацией о клиенте.</li>
            <li><strong>«Редактировать»</strong> — открывает форму редактирования клиента.</li>
            <li><strong>«Архивировать»</strong> — перемещает клиента в архив, скрывая его из основного списка.</li>
          </ul>
          <img
            src={images[0]}
            alt="Список клиентов"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Детальный просмотр клиента</h3>
          <p>
            При переходе к конкретному клиенту (кнопка <strong>«Подробнее»</strong>) открывается боковая панель
            с полной информацией клиента.
          </p>
          <img
            src={images[2]}
            alt="Детали клиента"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Создание и редактирование клиента</h3>
          <p>
            Чтобы добавить нового клиента, нажмите кнопку <strong>«Добавить клиента»</strong>. Форма включает
            следующие поля:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>Имя</strong> — полное имя клиента</li>
            <li><strong>Телефон</strong> — контактный номер</li>
            <li><strong>Email</strong> — электронная почта</li>
            <li><strong>ИНН</strong> — идентификационный номер налогоплательщика</li>
            <li><strong>Адрес</strong> — адрес клиента</li>
            <li><strong>Банковские реквизиты</strong> — расчетный счет</li>
            <li><strong>ОГРН</strong> — основной государственный регистрационный номер</li>
          </ul>
          <p className="mt-2">
            Аналогичная форма используются при редактировании клиента (кнопка <strong>«Редактировать»</strong>).
          </p>
          <img
            src={images[1]}
            alt="Форма клиента"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Архивация и удаление</h3>
          <p>
            Неактуальных клиентов можно архивировать (кнопка <strong>«Архивировать»</strong>).
            Такие клиенты перемещаются в архив и исключаются из основного списка.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Особенности работы</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Телефонный номер и email проверяется на корректность формата</li>
            <li>При архивации клиента, все его товары тоже попадают в архив</li>
            <li>Клиент не архивируется, если его товары участвуют в активных поставках или заказах</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientOverview

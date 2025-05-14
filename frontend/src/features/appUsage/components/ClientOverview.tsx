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
          <strong>Система управления клиентами</strong> предоставляет удобный интерфейс для работы с клиентскими
          данными: вы можете просматривать, создавать, редактировать и архивировать клиентов.
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
            с полной информацией клиента: банковские, контактные данные и история взаимодействий.
          </p>
          <img
            src={images[2]}
            alt="Детали клиента"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Создание и редактирование</h3>
          <p>
            Для добавления нового клиента используется кнопка <strong>«Добавить клиента»</strong>. Форма включает поля:
            имя, номер телефона, электронная почта, ИНН, адрес, банковские реквизиты и ОГРН. Аналогичная форма используется
            при редактировании клиента (кнопка <strong>«Редактировать»</strong>).
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
            Такие клиенты перемещаются в раздел «Архив» и исключаются из основного списка.
            Стоит отметить, что все товары, относящиеся к архивируемому клиенту, тоже попадают в архив.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Автоматическое сохранение и стабильность</h3>
          <p>
            Все изменения сохраняются автоматически, что исключает потерю данных. Система стабильна и доступна
            с любого устройства с подключением к интернету.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientOverview

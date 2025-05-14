import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const images = [
  '/app-usage/counterparties/counterparties-list.png',
  '/app-usage/counterparties/counterparties-form.png',
]

const CounterpartyOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Общее описание функционала контрагентов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Система управления контрагентами</strong> предоставляет инструменты для работы с поставщиками,
          подрядчиками и другими внешними организациями. Функционал позволяет создавать, редактировать
          и архивировать записи контрагентов.
        </p>

        <div>
          <h3 className="font-semibold">Список контрагентов</h3>
          <p>
            На главной странице отображается таблица со всеми активными контрагентами. Доступны сортировка
            и фильтрация по основным полям: название, телефон и адрес.
          </p>
          <p className="mt-2">
            В столбце <strong>Действия</strong> доступны:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>«Редактировать»</strong> — открывает форму изменения данных контрагента</li>
            <li><strong>«Архивировать»</strong> — перемещает контрагента в архив</li>
          </ul>
          <img
            src={images[0]}
            alt="Список контрагентов"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Добавление нового контрагента</h3>
          <p>
            Для создания новой записи используйте кнопку <strong>«Добавить контрагента»</strong>.
            Форма включает следующие поля:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>Название</strong> — полное наименование организации</li>
            <li><strong>Телефон</strong> — контактный номер для связи (необязательное поле</li>
            <li><strong>Адрес</strong> — юридический или фактический адрес (необязательное поле)</li>
          </ul>
          <p>
            Аналогичная форма используется при редактировании контрагента (кнопка «Редактировать»).
          </p>
          <img
            src={images[1]}
            alt="Форма добавления контрагента"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Архивация</h3>
          <p>
            Неактуальных контрагентов можно архивировать (кнопка <strong>«Архивировать»</strong>). Такие контрагенты
            перемещаются в архив и исключаются из основного списка.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Особенности работы</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Название контрагента должно быть уникальным в системе</li>
            <li>Телефонный номер проверяется на корректность формата</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default CounterpartyOverview

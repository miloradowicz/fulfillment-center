import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const taskImages = [
  '/app-usage/arrivals/arrivals-list.png',
  '/app-usage/arrivals/arrivals-form.png',
  '/app-usage/arrivals/arrivals-details.png',
]

const TaskOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-2xl">Общее описание функционала задач</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Система задач</strong> помогает организовать работу команды. Здесь можно создавать задания,
          отслеживать их выполнение и контролировать сроки.
        </p>

        <div>
          <h3 className="font-semibold">Доска задач</h3>
          <p>Все задачи разделены по статусам:</p>
          <ul className="list-disc pl-5">
            <li><span className="font-medium">К выполнению</span> — новые задачи</li>
            <li><span className="font-medium">В работе</span> — задачи в процессе</li>
            <li><span className="font-medium">Готово</span> — выполненные задачи</li>
          </ul>
          <p className="mt-2">Меняйте статусы перетаскиванием или через меню задачи.</p>
          <img
            src={taskImages[0]}
            alt="Доска задач"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Создание и редактирование</h3>
          <p>
            Для добавления новой задачи используется кнопка <strong>«Добавить задачу»</strong>. Форма включает:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Исполнитель</strong> — выбор пользователя из выпадающего списка</li>
            <li><strong>Название</strong> — обязательное поле, описывающее суть задачи</li>
            <li><strong>Описание</strong> — дополнительная информация по задаче (необязательно)</li>
            <li><strong>Тип задачи</strong> — один из доступных типов (например, «заказ», «поставка»)</li>
            <li><strong>Привязка к заказу или поставке</strong> — если выбран соответствующий тип задачи, появляется
              возможность выбрать заказ или поставку
            </li>
          </ul>
          <p className="mt-2">
            Аналогичная форма используется при редактировании задачи (кнопка <strong>«Редактировать»</strong>).
          </p>
          <img
            src={taskImages[1]}
            alt="Форма задачи"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Детали задачи</h3>
          <p>При нажатии на номер задачи, открывается подробная информация:</p>
          <ul className="list-disc pl-5">
            <li>Полное описание</li>
            <li>Связанные заказы или поставки</li>
            <li>История изменений</li>
            <li>Даты создания и обновления</li>
          </ul>
          <img
            src={taskImages[2]}
            alt="Детали задачи"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Фильтрация</h3>
          <p>Чтобы быстро найти нужные задачи:</p>
          <ul className="list-disc pl-5">
            <li>Используйте поиск по названию</li>
            <li>Фильтруйте по конкретному сотруднику</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Архивация</h3>
          <p>
            Неактуальные задачи можно архивировать (кнопка <strong>«Архивировать»</strong>). Такие задачи
            перемещаются в архив и исключаются из основного списка.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Ключевые особенности</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Простое управление статусами - перетаскивайте задачи между колонками или выбирайте статус вручную</li>
            <li>Привязка к заказам и поставкам - связывайте задачи с конкретными документами</li>
            <li>Полная история изменений - система сохраняет все действия с задачами</li>
            <li>Гибкая фильтрация - ищите задачи по исполнителю, статусу или тексту</li>
            <li>Автоматическое обновление при изменении исходных данных</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskOverview

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const images = [
  '/app-usage/reports/reports-board.png',
  '/app-usage/reports/tasks-report.png',
  '/app-usage/reports/clients-report.png',
]

const ReportOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Общее описание функционала отчетов</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Система отчетности</strong>  позволяет отслеживать и анализировать ключевые процессы компании —
          от задач сотрудников до активности клиентов. Все данные собираются из разных модулей и отображаются в
          удобной форме. Отчеты можно строить за любой выбранный период.
        </p>

        <div>
          <h3 className="font-semibold">Основные типы отчетов</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>По задачам</strong> — показывает, насколько эффективно работают сотрудники.
            </li>
            <li>
              <strong>По клиентам</strong> — показывает финансовую и товарную активность клиентов
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Фильтрация данных</h3>
          <p>
            Во всех отчетах можно выбрать нужный диапазон дат. Данные обновляются автоматически.
            Если за выбранный период нет информации, это будет показано.
          </p>
          <img
            src={images[0]}
            alt="Вкладки отчетов"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Отчет по задачам</h3>
          <p>
            Этот отчет помогает оценить работу сотрудников:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Круговая диаграмма</strong> — распределение задач по статусам
            </li>
            <li>
              <strong>График выполнения</strong> — динамика выполнения задач по дням
            </li>
            <li>
              <strong>Таблица исполнителей</strong> — список сотрудников и сколько задач они выполнили.
            </li>
          </ul>
          <img
            src={images[1]}
            alt="Отчет по задачам"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Отчет по клиентам</h3>
          <p>
            Финансовый и операционный анализ:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Диаграмма платежей</strong>
              <ul className="list-disc pl-5">
                <li>Общая сумма выставленных счетов</li>
                <li>Оплаченная сумма</li>
                <li>Остаток по задолжности</li>
              </ul>
            </li>
            <li>
              <strong>Детальная таблица</strong>
              <ul className="list-disc pl-5">
                <li>Количество заказов/поставок/счетов</li>
                <li>Раскрывающиеся списки по каждому типу</li>
                <li>Фильтрация по статусам в выпадающих меню</li>
              </ul>
            </li>
          </ul>
          <img
            src={images[2]}
            alt="Отчет по клиентам"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Технические особенности</h3>
          <ul className="list-disc pl-5">
            <li>Оптимизированная загрузка больших объемов данных</li>
            <li>Интерактивные элементы графиков (можно наводить курсором - показывают подробности)</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Ключевые преимущества</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Комплексный анализ в едином интерфейсе</li>
            <li>Детализированное представление данных</li>
            <li>Автоматическое обновление при изменении исходных данных</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReportOverview

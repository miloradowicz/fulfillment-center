import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const images = [
  '/app-usage/arrivals/arrivals-list.png',
  '/app-usage/arrivals/arrivals-form.png',
  '/app-usage/arrivals/arrivals-details.png',
]

const ArrivalOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Общее описание функционала поставок</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Система управления поставками</strong> позволяет контролировать весь процесс движения товаров:
          от оформления до прибытия на склад, включая обработку дефектов и документооборот.
        </p>

        <div>
          <h3 className="font-semibold">Список поставок</h3>
          <p>
            В таблице отображаются все активные поставки с возможностью сортировки и фильтрации по:
          </p>
          <ul className="list-disc pl-5">
            <li>Номеру поставки</li>
            <li>Клиенту</li>
            <li>Складу назначения</li>
            <li>Дате прибытия</li>
            <li>Статусу</li>
          </ul>
          <p className="mt-2">
            Доступные действия для каждой поставки:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>«Подробнее»</strong> — открывает полную информацию о поставке</li>
            <li><strong>«Редактировать»</strong> — позволяет изменить данные поставки</li>
            <li><strong>«Архивировать»</strong> — перемещает поставку в архив</li>
          </ul>
          <p className="mt-2">
            Для удобства на главной странице были добавлены кнопки вызова форм:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>«Добавить товар»</strong> — создания новых товаров</li>
            <li><strong>«Выставить счет»</strong> — формирования счета</li>
          </ul>
          <img
            src={images[0]}
            alt="Список поставок"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Детальный просмотр поставки</h3>
          <p>
            При переходе к конкретной поставке (кнопка <strong>«Подробнее»</strong>), отображаются следующие данные:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>Основная информация</strong> — номер, статус, даты, клиент, склад</li>
            <li><strong>Контакты</strong> — телефоны клиента и перевозчика (с возможностью копирования)</li>
            <li><strong>Вкладки</strong> с детализацией по отправленным, полученным и дефектным товарам, оказанным
              услугам и истории изменений
            </li>
          </ul>
          <img
            src={images[2]}
            alt="Детали поставки"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Создание и редактирование</h3>
          <p>
            Форма включает следующие разделы:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Основные данные</strong> — клиент, склад, перевозчик, даты</li>
            <li><strong>Отправленные товары</strong> — список товаров с количеством</li>
            <li><strong>Полученные товары</strong> — фактически принятые позиции</li>
            <li><strong>Дефекты</strong> — бракованные товары с описанием проблем</li>
            <li><strong>Услуги</strong> — оказанные услуги по поставке</li>
            <li><strong>Документы</strong> — прикрепленные файлы (PDF, Word, Excel до 10МБ)</li>
          </ul>
          <img
            src={images[1]}
            alt="Форма поставки"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Работа с товарами в поставке</h3>
          <p>
            Процесс обработки товаров разделен на этапы:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Добавление отправленных товаров</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Выбираются из каталога товаров клиента</li>
                <li>Указывается точное количество</li>
                <li>Можно добавить описание</li>
              </ul>
            </li>
            <li>
              <strong>Фиксация полученных товаров</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Доступно после изменения статуса на "Получена"</li>
              </ul>
            </li>
            <li>
              <strong>Регистрация дефектов</strong>
              <ul className="list-disc pl-5 mt-1">
                <li>Добавляются при статусе "Отсортирована"</li>
                <li>Требуется описание проблемы</li>
                <li>Влияют на итоговое количество</li>
              </ul>
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-semibold">Архивация</h3>
          <p>
            Поставки можно архивировать, они будут скрыты из основного списка, но останутся в системе для отчетности.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Особенности работы</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Изменение статуса поставки влияет на доступные действия</li>
            <li>Все изменения фиксируются в истории</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ArrivalOverview

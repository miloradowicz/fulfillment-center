import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stockImages = [
  '/app-usage/arrivals/arrivals-list.png',
  '/app-usage/arrivals/arrivals-form.png',
  '/app-usage/arrivals/arrivals-details.png',
]

const StockOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-2xl">Общее описание функционала складов</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Система складского учета помогает контролировать остатки товаров, фиксировать брак и вести учет списаний.
        </p>

        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Список складов
          </h3>
          <p>Здесь отображаются все ваши склады:</p>
          <ul className="list-disc pl-5">
            <li>Название и адрес каждого склада</li>
            <li>Быстрый переход к деталям</li>
            <li>Добавление новых складов</li>
          </ul>
          <img
            src={stockImages[0]}
            alt="Список складов"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Создание и редактирование</h3>
          <p>
            Для добавления нового склада используется кнопка <strong>«Добавить склад»</strong>. Форма включает:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Название склада</li>
            <li>Фактический адрес склада</li>
          </ul>
          <p className="mt-2">
            Аналогичная форма используется при редактировании склада (кнопка <strong>«Редактировать»</strong>).
          </p>
          <img
            src={stockImages[1]}
            alt="Форма склада"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>


        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Детали склада
          </h3>
          <p>При открытии склада вы увидите:</p>
          <ul className="list-disc pl-5">
            <li>Основную информацию о складе</li>
            <li>Вкладки с товарами, браком и списаниями</li>
            <li>Историю изменений</li>
          </ul>
          <img
            src={stockImages[2]}
            alt="Детали склада"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Учет товаров
          </h3>
          <p>Во вкладке "Товары" отображается:</p>
          <ul className="list-disc pl-5">
            <li>Принадлежность клиенту</li>
            <li>Наименование</li>
            <li>Количество на складе</li>
            <li>Артикул товара</li>
            <li>Штрих-код товара</li>
          </ul>
          <img
            src={stockImages[2]}
            alt="Учет товаров"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Списание товаров</h3>
          <p>
            Форма списания товаров включает в себя:
          </p>
          <ul className="list-disc pl-5 space-y-2">

            <li>
              <strong>Клиент</strong> - владелец товара (выбирается из списка)
            </li>
            <li>
              <strong>Товар</strong> - поиск по названию/артикулу среди товаров выбранного клиента
            </li>
            <li>
              <strong>Количество</strong> списываемого товара
            </li>
            <li>
              <strong>Причина списания</strong>
            </li>
          </ul>
          <img
            src={stockImages[3]}
            alt="Форма списания товаров"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Архивация</h3>
          <p>
            Неактуальные склады можно архивировать (кнопка <strong>«Архивировать»</strong>). Такие склады
            перемещаются в архив и исключаются из основного списка.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            Особенности работы со складом
          </h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-2">
            <li>Остатки обновляются автоматически - при приходе/расходе/списании</li>
            <li>Отрицательные остатки выделяются красным и требуют проверки корректности заполненных данных
              в поставках/заказах/списаниях
            </li>
            <li>История изменений - сохраняются все операции с товарами</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default StockOverview

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const images = [
  '/app-usage/products/products-list.png',
  '/app-usage/products/products-details.png',
  '/app-usage/products/products-form.png',
  '/app-usage/products/dynamic-fields.png',
  '/app-usage/products/dynamic-fields-value.png',
]

const ProductOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Общее описание функционала товаров</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Система управления товарами</strong> предоставляет удобный интерфейс для эффективной работы с
          товарными
          позициями: создавать, просматривать, редактировать и архивировать товары.
        </p>

        <div>
          <h3 className="font-semibold">Список товаров</h3>
          <p>
            На главной странице раздела отображается таблица со всеми активными товарами. Здесь вы можете сортировать и
            фильтровать список, быстро находить нужного клиента и выполнять действия через
            столбец <strong>Действия</strong>.
          </p>
          <p className="mt-2">
            В столбце <strong>Действия</strong> доступны следующие кнопки:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>«Подробнее»</strong> — открывает боковую панель с детальной информацией о товаре.</li>
            <li><strong>«Редактировать»</strong> — открывает форму редактирования товара.</li>
            <li><strong>«Архивировать»</strong> — перемещает товар в архив, скрывая его из основного списка.</li>
          </ul>
          <img
            src={images[0]}
            alt="Список товаров"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Детальный просмотр товара</h3>
          <p>
            При переходе к конкретному товару (кнопка <strong>«Подробнее»</strong>) открывается боковая панель
            с полной информацией: название, артикул, баркод, клиент, которому принадлежит этот товар, и дополнительные
            характеристики.
          </p>
          <img
            src={images[1]}
            alt="Детали товара"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <h3 className="font-semibold">Создание и редактирование</h3>
          <p>
            Для добавления нового товара используется кнопка <strong>«Добавить товар»</strong>. Форма включает:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Клиент</strong> — выбор клиента из выпадающего списка</li>
            <li><strong>Название</strong> — наименование товара</li>
            <li><strong>Артикул</strong> — уникальный артикул товара</li>
            <li><strong>Баркод</strong> — штрихкод товара</li>
            <li><strong>Дополнительные характеристики</strong> — произвольные параметры, задаваемые вручную (необязательное поле)</li>
          </ul>
          <p className="mt-2">
            Аналогичная форма используется при редактировании товара (кнопка <strong>«Редактировать»</strong>).
          </p>
          <img
            src={images[2]}
            alt="Форма товара"
            className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
          />
        </div>

        <div>
          <div>
            <h3 className="font-semibold">Добавление дополнительных параметров</h3>
            <p>
              При создании или редактировании вы можете добавить неограниченное количество дополнительных полей:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Нажмите кнопку <strong>«Добавить параметр»</strong>.
              </li>
              <li>
                В появившейся форме укажите:
                <ul className="list-disc pl-5 mt-1">
                  <li><strong>Ключ</strong> — техническое название поля (латинскими строчными буквами, без пробелов).
                  </li>
                  <li><strong>Название</strong> — отображаемое имя характеристики.</li>
                </ul>
              </li>
              <li>Нажмите кнопку <strong>«Добавить»</strong> для сохранения параметра.</li>
              <img
                src={images[3]}
                alt="Добавление динамического поля"
                className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
              />
              <li>После добавления появится новое поле, в которое нужно вписать <strong>значение</strong> параметра.
              </li>
              <img
                src={images[4]}
                alt="Значение динамических полей"
                className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
              />
            </ol>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Архивация</h3>
          <p>
            Неактуальные товары можно архивировать (кнопка <strong>«Архивировать»</strong>). Такие товары
            перемещаются в архив и исключаются из основного списка.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Особенности работы</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Товары, используемые в поставках или заказах, нельзя архивировать.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductOverview

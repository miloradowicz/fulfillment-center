import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const images = [
  '/app-usage/arrivals/arrivals-list.png',
  '/app-usage/arrivals/arrivals-form.png',
  '/app-usage/arrivals/arrivals-details.png',
]

const AdminPanelOverview = () => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Обзор панели администратора</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong>Панель администратора</strong> — это центральный инструмент управления ключевыми сущностями системы:
          сотрудниками, услугами и счетами.
        </p>
        <div>
          <h2 className="text-center font-bold text-xl">Сотрудники</h2>
          <div>
            <h3 className="font-semibold">Список сотрудников</h3>
            <p>
              На главной странице раздела отображается таблица со всеми активными сотрудниками. Здесь вы можете
              сортировать и фильтровать список, быстро находить нужного сотрудника и выполнять действия через
              столбец <strong>Действия</strong>.
            </p>
            <p className="mt-2">
              В столбце <strong>Действия</strong> доступны следующие кнопки:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>«Редактировать»</strong> — открывает форму редактирования сотрудника.</li>
              <li><strong>«Архивировать»</strong> — перемещает сотрудника в архив, скрывая его из основного списка.</li>
            </ul>
            <img
              src={images[0]}
              alt="Список сотрудников"
              className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold mt-6">Создание и редактирование сотрудника</h3>
            <p>
              Для добавления нового сотрудника используйте кнопку <strong>«Добавить сотрудника»</strong>. Форма включает
              следующие поля:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Email</strong> — электронная почта, используется как логин для входа.</li>
              <li><strong>Имя</strong> — полное имя сотрудника, отображается в системе.</li>
              <li><strong>Пароль</strong> — пароль для входа в систему.</li>
              <li><strong>Подтверждение пароля</strong> — необходимо для исключения ошибок при вводе пароля.</li>
              <li><strong>Роль</strong> — определяет уровень доступа: администратор, менеджер либо складской сотрудник.
              </li>
            </ul>
            <p className="mt-2">
              Аналогичная форма используются при редактировании сотрудника (кнопка <strong>«Редактировать»</strong>).
            </p>
            <img
              src={images[1]}
              alt="Форма создания сотрудника"
              className="mt-3 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold mt-6">Архивация</h3>
            <p>
              Неактуальных сотрудников можно архивировать (кнопка <strong>«Архивировать»</strong>).
              Такие сотрудники перемещаются в архив и исключаются из основного списка. Важно отметить, что при
              архивации сотрудника с ролью «Складской сотрудник», все связанные с ним задачи тоже попадают в архив.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
            <h3 className="font-semibold text-blue-800">Особенности работы с сотрудниками</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>Email сотрудника должен быть уникальным и валидным — он используется для входа в систему</li>
              <li>После архивации сотрудник теряет доступ к системе, но его действия сохраняются в истории</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-center font-bold text-xl mt-8">Услуги</h2>
          <div>
            <h3 className="font-semibold mt-4">Список услуг</h3>
            <p>
              На главной странице отображается таблица с активными услугами. Вы можете сортировать и
              фильтровать список, искать конкретную услугу и быстро выполнять действия через
              столбец <strong>Действия</strong>.
            </p>
            <p className="mt-2">
              Доступные действия:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>«Подробнее»</strong> — открывает модальное окно с детальной информацией об услуге.</li>
              <li><strong>«Редактировать»</strong> — позволяет изменить параметры услуги.</li>
              <li><strong>«Архивировать»</strong> — перемещает услугу в архив, исключая её из активного списка.</li>
            </ul>
            <img
              src={images[3]}
              alt="Список услуг"
              className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold mt-6">Детальный просмотр услуги</h3>
            <p>
              При переходе к конкретной услуге (кнопка <strong>«Подробнее»</strong>) открывается боковая панель
              с полной информацией: название, категория, цена, описание, тип и история изменений.
            </p>
            <img
              src={images[1]}
              alt="Детали услуги"
              className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold mt-6">Создание и редактирование услуги</h3>
            <p>
              Для добавления новой услуги используйте кнопку <strong>«Добавить услугу»</strong>. Форма включает
              следующие поля:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Категория</strong> — определяет категорию услуги. При необходимости новую категорию
                можно создать прямо в этой форме.
              </li>
              <li><strong>Тип</strong> — выбор типа из выпадающего списка.</li>
              <li><strong>Название</strong> — наименование услуги.</li>
              <li><strong>Цена</strong> — стоимость услуги.</li>
              <li><strong>Описание</strong> — дополнительная информация о предоставляемой услуге.</li>
            </ul>
            <p className="mt-2">
              Аналогичная форма используются при редактировании услуги (кнопка <strong>«Редактировать»</strong>).
            </p>
            <img
              src={images[1]}
              alt="Форма создания услуги"
              className="mt-3 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold mt-6">Архивация услуг</h3>
            <p>
              Если услуга больше не предоставляется, вы можете архивировать её. Такие сотрудники перемещаются в
              архив и исключаются из основного списка.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
            <h3 className="font-semibold text-blue-800">Особенности работы с услугами</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>Цены на услуги можно изменять при создании поставки/заказа — изменения будут
                применяться только к создаваемой поставке/заказу.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-center font-bold text-xl mt-8">Счета на оплату</h2>

          <div>
            <h3 className="font-semibold mt-4">Список счетов</h3>
            <p>
              Раздел <strong>«Счета»</strong> позволяет отслеживать все выставленные счета. Здесь представлена таблица с
              информацией о
              каждом счете, включая дату создания, общую сумму, статус оплаты и действия. Таблица поддерживает
              сортировку и фильтрацию.
            </p>
            <p className="mt-2">
              Через столбец <strong>Действия</strong> можно:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>«Подробнее»</strong> — открывает полную информацию о выбранном счете.</li>
              <li><strong>«Редактировать»</strong> — открыть форму для изменения данных счета.</li>
              <li><strong>«Архивировать»</strong> — переместить счет в архив (например, если он аннулирован).</li>
            </ul>
            <img
              src={images[3]}
              alt="Список счетов"
              className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold mt-6">Детальный просмотр счета</h3>
            <p>
              В карточке счета отображается:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Основные данные</strong> — номер счета, клиент и его контакты, дата создания и указание
                за какой заказ/поставку выставлен данный счет.
              </li>
              <li><strong>Вкладки</strong> с детализацией по оказанным услугам в заказах/поставках и истории изменений
              </li>
            </ul>
            <img
              src={images[2]}
              alt="Детали счета"
              className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>

          <div>
            <h3 className="font-semibold mt-6">Создание и редактирование счета</h3>
            <p>
              Для создания нового счета используйте кнопку <strong>«Добавить счет»</strong>. Форма включает
              следующие поля:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Клиент</strong> — выбор клиента из выпадающего списка.</li>
              <li><strong>Поставка</strong> — выбор поставки, связанной с выбранным клиентом.</li>
              <li><strong>Заказ</strong> — выбор заказа, связанного с выбранным клиентом.</li>
              <li>
                <strong>Дополнительные услуги</strong> — список услуг, которые можно добавить к счёту. Каждая услуга
                указывается с количеством и ценой.
                Также можно указать индивидуальную стоимость, которая перезапишет стандартную цену услуги.
              </li>
              <li>
                <strong>К оплате</strong> — автоматически рассчитывается сумма счёта с учетом добавленных услуг и
                скидки.
              </li>
              <li>
                <strong>Статус</strong> — отображает текущий статус счёта («в ожидании», «оплачен» или
                «частично оплачен»).
              </li>
              <li>
                <strong>Оплачено</strong> — сумма, которая уже была оплачена по данному счёту.
              </li>
              <li>
                <strong>Скидка (%)</strong> — процент скидки, применяемый только к внутренним услугам компании.
              </li>
            </ul>
            <p className="mt-2">
              При редактировании счета отображается аналогичная форма с предварительно заполненными данными.
            </p>
            <img
              src={images[2]}
              alt="Форма счетов"
              className="mt-2 rounded-lg border shadow-sm w-5/6 mx-auto"
            />
          </div>


          <div>
            <h3 className="font-semibold mt-6">Архивация счетов</h3>
            <p>
              Если счет больше не актуален, его можно архивировать. Архивированные счета исключаются из активного
              списка, но сохраняются в системе для истории и отчётности.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-6">
            <h3 className="font-semibold text-blue-800">Особенности работы со счетами</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>Возможность экспортировать счет в exel таблицу.</li>
              <li>Статус оплаты автоматически обновляется в зависимости от разницы между итоговой и оплаченной суммами.
              </li>
              <li>В одном счете можно указать как поставку и заказ вместе, так и отдельно — только поставку или
                только заказ.
              </li>
            </ul>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

export default AdminPanelOverview

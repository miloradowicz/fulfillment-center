import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsPositive, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class ProductDto {
  @IsNotEmpty({ message: 'Заполните поле товара.' })
  product: string

  @IsOptional({ message: 'Заполните описание товара.' })
  description: string

  @IsNotEmpty({ message: 'Заполните количество товара.' })
  @IsPositive({ message: 'Количество товара быть больше 0.' })
  amount: number
}

class LogDto {
  @IsNotEmpty({ message: 'Заполните поле пользователя.' })
  user: string

  @IsNotEmpty({ message: 'Заполните описание изменения.' })
  change: string

  @IsNotEmpty({ message: 'Заполните дату изменения.' })
  date: Date
}

class DefectDto {
  @IsNotEmpty({ message: 'Заполните поле товара.' })
  product: string

  @IsNotEmpty({ message: 'Заполните описание дефекта.' })
  defect_description: string

  @IsNotEmpty({ message: 'Заполните количество дефектных товаров.' })
  @IsPositive({ message: 'Количество дефектных товаров быть больше 0.' })
  amount: number
}

class ReceivedProductDto {
  @IsNotEmpty({ message: 'Заполните поле товара.' })
  product: string

  @IsOptional({ message: 'Заполните описание товара.' })
  description: string

  @IsNotEmpty({ message: 'Заполните количество товара.' })
  @IsPositive({ message: 'Количество товара быть больше 0.' })
  amount: number
}

export class CreateArrivalDto {
  @IsNotEmpty({ message: 'Заполните поле клиента.' })
  client: string

  @ArrayNotEmpty({ message: 'Заполните список товаров' })
  @IsArray({ message: 'Заполните список товаров.' })
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[]

  @IsNotEmpty({ message: 'Заполните цену доставки.' })
  @IsPositive({ message: 'Цена доставки должна быть больше 0.' })
  arrival_price: number

  @IsNotEmpty({ message: 'Заполните дату прибытия.' })
  arrival_date: Date

  @IsNotEmpty({ message: 'Заполните количество отправленного товара.' })
  sent_amount: string

  @IsOptional()
  @IsEnum(['Ожидается доставка', 'Получен', 'Отсортирован'], {
    message: 'Статус должен быть одним из: "ожидается доставка", "получен", "отсортирован"',
  })
  arrival_status: 'Ожидается доставка' | 'Получен' | 'Отсортирован'

  @IsOptional()
  @IsArray({ message: 'Заполните список логов.' })
  @ValidateNested({ each: true })
  @Type(() => LogDto)
  logs?: LogDto[]

  @IsOptional()
  @IsArray({ message: 'Заполните список дефектов.' })
  @ValidateNested({ each: true })
  @Type(() => DefectDto)
  defects?: DefectDto[]

  @IsOptional()
  @IsArray({ message: 'Заполните список полученных товаров.' })
  @ValidateNested({ each: true })
  @Type(() => ReceivedProductDto)
  received_amount?: ReceivedProductDto[]
}

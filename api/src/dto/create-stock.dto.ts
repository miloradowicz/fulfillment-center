import { IsArray, IsNotEmpty, IsOptional, IsPositive, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import mongoose from 'mongoose'

class ProductDto {
  @IsNotEmpty({ message: 'Заполните поле товара.' })
  product: mongoose.Schema.Types.ObjectId

  @IsOptional()
  description: string

  @IsNotEmpty({ message: 'Заполните количество товара.' })
  @IsPositive({ message: 'Количество товара должно быть больше 0.' })
  amount: number
}

class LogDto {
  @IsNotEmpty({ message: 'Заполните поле пользователя.' })
  user: mongoose.Schema.Types.ObjectId

  @IsNotEmpty({ message: 'Заполните описание изменения.' })
  change: string

  @IsNotEmpty({ message: 'Заполните дату изменения.' })
  date: Date
}

export class CreateStockDto {
  @IsNotEmpty({ message: 'Заполните название склада.' })
  name: string

  @IsNotEmpty({ message: 'Заполните адрес склада.' })
  address: string

  @IsOptional()
  @IsArray({ message: 'Заполните список товаров.' })
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[]

  @IsOptional()
  @IsArray({ message: 'Заполните список логов.' })
  @ValidateNested({ each: true })
  @Type(() => LogDto)
  logs?: LogDto[]
}

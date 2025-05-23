import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import mongoose from 'mongoose'

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Поле исполнитель обязательно для заполнения' })
  @IsMongoId({ message: 'Некорректный формат ID' })
  user: mongoose.Types.ObjectId

  @IsNotEmpty({ message: 'Поле заголовок задачи обязательно для заполнения' }) title: string

  @IsOptional()
  description?: string

  @IsOptional()
  date_ToDO?: string

  @IsOptional()
  date_inProgress?: string

  @IsOptional()
  date_Done?: string

  @IsOptional()
  @IsEnum(['к выполнению', 'в работе', 'готово'], {
    message: 'Статус должен быть одним из: "к выполнению", "в работе", "готово"',
  })
  status: 'к выполнению' | 'в работе' | 'готово'

  @IsOptional()
  @IsEnum(['поставка', 'заказ', 'другое'], {
    message: 'Тип задачи должен быть один из: "поставка", "заказ", "другое"',
  })
  type: 'поставка' | 'заказ' | 'другое'

  @IsOptional()
  @IsMongoId({ message: 'Некорректный формат ID' })
  associated_order?: mongoose.Types.ObjectId | null

  @IsOptional()
  @IsMongoId({ message: 'Некорректный формат ID' })
  associated_arrival?: mongoose.Types.ObjectId | null
}

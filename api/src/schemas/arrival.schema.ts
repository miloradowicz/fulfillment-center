import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'

export type ArrivalDocument = Arrival & Document

@Schema({ timestamps: true })
export class Arrival {
  @Prop({
    type: Boolean,
    default: false,
  })
  isArchived: boolean

  @Prop({
    type: String,
    unique: true,
  })
  arrivalNumber: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  })
  client: mongoose.Types.ObjectId

  @Prop({
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        description: { type: String, default: null },
        amount: { type: Number, required: true },
      },
    ],
    required: true,
  })
  products: {
    product: mongoose.Types.ObjectId
    description: string
    amount: number
  }[]

  @Prop({ required: true })
  arrival_price: number

  @Prop({
    type: String,
    enum: ['ожидается доставка', 'получена', 'отсортирована'],
    default: 'ожидается доставка',
  })
  arrival_status: 'ожидается доставка' | 'получена' | 'отсортирована'

  @Prop({ required: true })
  arrival_date: Date

  @Prop({ default: null })
  sent_amount: string

  @Prop({ default: null })
  pickup_location: string

  @Prop({ default: null })
  documents: [{ document: string }]

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counterparty',
    required: false,
  })
  shipping_agent?: mongoose.Types.ObjectId | null

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true,
  })
  stock: mongoose.Types.ObjectId

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        change: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now },
      },
    ],
    default: [],
  })
  logs: {
    user: mongoose.Types.ObjectId
    change: string
    date: Date
  }[]

  @Prop({
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        defect_description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  defects: {
    product: mongoose.Types.ObjectId
    defect_description: string
    amount: number
  }[]

  @Prop({
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        description: { type: String, default: null },
        amount: { type: Number, required: true },
      },
    ],
    default: [],
  })
  received_amount: {
    product: mongoose.Types.ObjectId
    description: string
    amount: number
  }[]

  @Prop({
    type: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
        service_amount: { type: Number, required: true, default: 1 },
        service_price: { type: Number, required: false },
      },
    ],
    default: [],
  })
  services: {
    service: mongoose.Schema.Types.ObjectId
    service_amount: number
    service_price: number
  }[]
}

export const ArrivalSchema = SchemaFactory.createForClass(Arrival)

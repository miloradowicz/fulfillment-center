export interface Client {
  _id: string
  name: string
  phone_number: string
  email: string
  inn: string
  address?: string
  banking_data?: string
  ogrn?: string
}

export type ClientMutation = Omit<Client, '_id'>

export interface GlobalError {
  message: string
}

export interface ValidationError {
  type: string
  errors: {
    [key: string]: {
      name: string
      messages: string[]
    }
  }
  message: string
  name: string
  _message: string
}

export interface DynamicField {
  key: string
  label: string
  value: string
}

export interface Log {
  user: string
  change: string
  date: string
}

export interface Product {
  _id: string
  client: string
  title: string
  amount: number
  barcode: string
  article: string
  documents?: { document: string }[]
  dynamic_fields?: DynamicField[]
  logs?: Log[]
}

export interface ProductWithPopulate {
  _id: string
  client: Client
  title: string
  amount: number
  barcode: string
  article: string
  documents?: { document: string }[]
  dynamic_fields?: DynamicField[]
  logs?: Log[]
}

export type ProductMutation = Omit<Product, '_id'>

export interface Defect {
  product: string
  defect_description: string
  amount: number
}

export interface ProductOrder {
  product: string
  description: string
  amount: number
}

export interface ProductArrival {
  product: string
  description: string
  amount: number
}

export interface Arrival {
  _id: string
  client: string
  products: ProductArrival[]
  arrival_price: number
  arrival_date: string
  sent_amount: string
  defects: Defect[]
  arrival_status?: string
  received_amount?: ProductArrival[]
  logs?: Log[]
}

export type ArrivalMutation = Omit<Arrival, '_id'>

export interface Order {
  _id: string
  client: string
  products: ProductOrder[]
  price: number
  sent_at: string
  delivered_at: string
  comment?: string
  status?: 'в сборке' | 'в пути' | 'доставлен'
  logs?: Log[]
  defects?: Defect[]
}

export interface User {
  _id: string
  username: string
  token: string
  role: string
}

export type OrderMutation = Omit<Order, '_id'>

export interface User {
  _id: string
  email: string
  displayName: string
  role: 'super-admin' | 'admin' | 'manager' | 'stock-worker'
  token: string
}

export type UserMutation = Omit<User, '_id' | 'token'> & {
  password: string
}

export interface LoginMutation {
  email: string
  password: string
}

export type UserRegistrationMutation = {
  email: string
  password: string
  displayName: string
  role: 'super-admin' | 'admin' | 'manager' | 'stock-worker'
}

export interface ArrivalError {
  client: string
  product: string
  arrival_price: number
  arrival_date: string
  sent_amount: string
  amount: number
  defect_description: string
=======
export interface ErrorForOrder {
  client: string
  product: string
  price: number
  amount: number
  defect_description: string
  sent_at: string
  delivered_at: string
}

export interface DefectForOrderForm {
  product: Product
  description: string
  amount: number
}

export interface ProductForOrderForm {
  product: Product
  defect_description: string
  amount: number
}

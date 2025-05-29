import { Options } from 'check-password-strength'

const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'

// Функция для безопасного получения import.meta.env
const getImportMetaEnv = (key: string, defaultValue: string) => {
  if (isTestEnvironment) {
    return defaultValue
  }
  try {
    return import.meta.env[key] ?? defaultValue
  } catch {
    return defaultValue
  }
}

export const apiHost = getImportMetaEnv('VITE_API_HOST', 'http://localhost:8000')
export const featureProtection = isTestEnvironment ? true : (getImportMetaEnv('VITE_FEATURE_PROTECTION_DISABLED', '0') !== '1')

export const emailRegex = /^(\w+[-.]?\w+)@(\w+)([.-]?\w+)?(\.[a-zA-Z]{2,3})$/
export const phoneNumberRegex = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?(\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4})$/
export const positiveDecimalNumber = /^(0|[1-9]\d*)(\.\d+)?$/
export const pathRegex = /^(\/?[^/><|:&]+)+\.(pdf|doc|docx|xlsx)$/

export const roles = [
  { name: 'super-admin', title: 'Супер-пользователь' },
  { name: 'admin', title: 'Администратор' },
  { name: 'manager', title: 'Менеджер' },
  { name: 'stock-worker', title: 'Складской работник' },
]

export const initialClientState = {
  name: '',
  phone_number: '',
  email: '',
  inn: '',
  address: '',
  banking_data: '',
  ogrn: '',
}

export const passwordStrengthOptions: Options<string> = [
  {
    id: 0,
    value: 'Too weak',
    minDiversity: 0,
    minLength: 0,
  },
  {
    id: 1,
    value: 'Alright',
    minDiversity: 2,
    minLength: 8,
  },
]

export const OrderStatus = ['в сборке', 'в пути', 'доставлен']

export const ArrivalStatus = ['ожидается доставка', 'получена', 'отсортирована']

export enum ItemType {
  PRODUCTS = 'products',
  RECEIVED_AMOUNT = 'received_amount',
  DEFECTS = 'defects',
  SERVICES = 'services',
  WRITEOFFS = 'write_offs'
}

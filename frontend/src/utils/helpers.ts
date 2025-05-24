import { ServiceCategory, ValidationError } from '@/types'
import { isAxiosError } from 'axios'

export const isValidationError = (obj: unknown): obj is ValidationError =>
  typeof obj === 'object' && obj !== null &&
  'type' in obj && typeof obj.type === 'string' && obj.type === 'ValidationError' &&
  'errors' in obj && typeof obj.errors === 'object' && obj.errors !== null && Object.values(obj.errors).every(
    (x: unknown) =>
      typeof x === 'object' && x !== null &&
      'name' in x && typeof x.name === 'string' &&
      'messages' in x && Array.isArray(x.messages) && x.messages.every(
        (y: unknown) => typeof y === 'string',
      ),
  )

export const hasMessage = (obj: unknown): obj is { message: string } =>
  typeof obj === 'object' && obj !== null &&
  'message' in obj && typeof obj.message === 'string'

export const isGlobalError = hasMessage

export const isServiceCategory = (obj: unknown): obj is ServiceCategory =>
  typeof obj === 'object' && obj !== null &&
  '_id' in obj && typeof obj._id === 'string' &&
  'name' in obj && typeof obj.name === 'string'

export const isAxios401Error = (obj: unknown) =>
  (isAxiosError(obj) && obj.response?.status === 401) ||
  (typeof obj === 'object' && obj !== null &&
  'error' in obj && typeof obj.error === 'string' && obj.error === 'Unauthorized' &&
  'statusCode' in obj && typeof obj.statusCode === 'number' && obj.statusCode === 401) ||
  (typeof obj === 'object' && obj !== null &&
  'name' in obj && typeof obj.name === 'string' && obj.name === 'AxiosError' &&
  'message' in obj && typeof obj.message === 'string' && obj.message === 'Request failed with status code 401')

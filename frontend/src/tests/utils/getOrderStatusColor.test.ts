/* eslint-disable */
import { getOrderStatusColor, getArrivalStatusColor } from '../../utils/getOrderStatusColor'

describe('getOrderStatusColor utility', () => {
  describe('getOrderStatusColor', () => {
    it('should return "warning" for "в сборке" status', () => {
      const result = getOrderStatusColor('в сборке')
      expect(result).toBe('warning')
    })

    it('should return "info" for "в пути" status', () => {
      const result = getOrderStatusColor('в пути')
      expect(result).toBe('info')
    })

    it('should return "success" for "доставлен" status', () => {
      const result = getOrderStatusColor('доставлен')
      expect(result).toBe('success')
    })

    it('should return "warning" for unknown status', () => {
      const result = getOrderStatusColor('неизвестный статус')
      expect(result).toBe('warning')
    })

    it('should return "warning" for empty string', () => {
      const result = getOrderStatusColor('')
      expect(result).toBe('warning')
    })

    it('should return "warning" for null status', () => {
      const result = getOrderStatusColor(null as any)
      expect(result).toBe('warning')
    })

    it('should return "warning" for undefined status', () => {
      const result = getOrderStatusColor(undefined as any)
      expect(result).toBe('warning')
    })

    it('should be case sensitive', () => {
      const result1 = getOrderStatusColor('В СБОРКЕ')
      const result2 = getOrderStatusColor('В Сборке')
      const result3 = getOrderStatusColor('в Сборке')
      
      expect(result1).toBe('warning') // default case
      expect(result2).toBe('warning') // default case
      expect(result3).toBe('warning') // default case
    })
  })

  describe('getArrivalStatusColor', () => {
    it('should return "warning" for "ожидается доставка" status', () => {
      const result = getArrivalStatusColor('ожидается доставка')
      expect(result).toBe('warning')
    })

    it('should return "info" for "отсортирована" status', () => {
      const result = getArrivalStatusColor('отсортирована')
      expect(result).toBe('info')
    })

    it('should return "success" for "получена" status', () => {
      const result = getArrivalStatusColor('получена')
      expect(result).toBe('success')
    })

    it('should return "warning" for unknown status', () => {
      const result = getArrivalStatusColor('неизвестный статус')
      expect(result).toBe('warning')
    })

    it('should return "warning" for empty string', () => {
      const result = getArrivalStatusColor('')
      expect(result).toBe('warning')
    })

    it('should return "warning" for null status', () => {
      const result = getArrivalStatusColor(null as any)
      expect(result).toBe('warning')
    })

    it('should return "warning" for undefined status', () => {
      const result = getArrivalStatusColor(undefined as any)
      expect(result).toBe('warning')
    })

    it('should be case sensitive', () => {
      const result1 = getArrivalStatusColor('ПОЛУЧЕНА')
      const result2 = getArrivalStatusColor('Получена')
      const result3 = getArrivalStatusColor('ОЖИДАЕТСЯ ДОСТАВКА')
      
      expect(result1).toBe('warning') // default case
      expect(result2).toBe('warning') // default case
      expect(result3).toBe('warning') // default case
    })

    it('should handle partial matches', () => {
      const result1 = getArrivalStatusColor('ожидается')
      const result2 = getArrivalStatusColor('доставка')
      const result3 = getArrivalStatusColor('получен')
      
      expect(result1).toBe('warning') // default case
      expect(result2).toBe('warning') // default case
      expect(result3).toBe('warning') // default case
    })
  })

  describe('edge cases', () => {
    it('should handle status with extra whitespace', () => {
      const orderResult = getOrderStatusColor('  в сборке  ')
      const arrivalResult = getArrivalStatusColor('  получена  ')
      
      expect(orderResult).toBe('warning') // default case due to whitespace
      expect(arrivalResult).toBe('warning') // default case due to whitespace
    })

    it('should handle status with special characters', () => {
      const orderResult = getOrderStatusColor('в-сборке')
      const arrivalResult = getArrivalStatusColor('получена!')
      
      expect(orderResult).toBe('warning') // default case
      expect(arrivalResult).toBe('warning') // default case
    })

    it('should handle numeric status', () => {
      const orderResult = getOrderStatusColor('123')
      const arrivalResult = getArrivalStatusColor('456')
      
      expect(orderResult).toBe('warning') // default case
      expect(arrivalResult).toBe('warning') // default case
    })
  })
}) 
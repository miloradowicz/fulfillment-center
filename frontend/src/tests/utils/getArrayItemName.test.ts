/* eslint-disable */
import { getArrayItemNameById } from '../../utils/getArrayItemName'

describe('getArrayItemNameById utility', () => {
  const mockProducts = [
    { _id: '1', title: 'Product 1', name: 'Product Name 1' },
    { _id: '2', title: 'Product 2', name: 'Product Name 2' },
    { _id: '3', title: 'Product 3' }
  ]

  const mockServices = [
    { _id: 'service-1', name: 'Service 1', title: 'Service Title 1' },
    { _id: 'service-2', name: 'Service 2', title: 'Service Title 2' },
    { _id: 'service-3', title: 'Service Title 3' }
  ]

  describe('for products (isService = false)', () => {
    it('should return product title when found', () => {
      const result = getArrayItemNameById(mockProducts, '1', false)
      expect(result).toBe('Product 1')
    })

    it('should return product title when found and name is also present', () => {
      const result = getArrayItemNameById(mockProducts, '2', false)
      expect(result).toBe('Product 2')
    })

    it('should return "Неизвестный товар" when product not found', () => {
      const result = getArrayItemNameById(mockProducts, 'non-existent', false)
      expect(result).toBe('Неизвестный товар')
    })

    it('should return "Неизвестный товар" when items is null', () => {
      const result = getArrayItemNameById(null, '1', false)
      expect(result).toBe('Неизвестный товар')
    })

    it('should return "Неизвестный товар" when items is undefined', () => {
      const result = getArrayItemNameById(undefined, '1', false)
      expect(result).toBe('Неизвестный товар')
    })

    it('should return "Неизвестный товар" when title is missing', () => {
      const itemsWithoutTitle = [{ _id: '1', name: 'Product Name' }]
      const result = getArrayItemNameById(itemsWithoutTitle, '1', false)
      expect(result).toBe('Неизвестный товар')
    })

    it('should return "Неизвестный товар" when isService is not specified (defaults to false)', () => {
      const result = getArrayItemNameById(null, '1')
      expect(result).toBe('Неизвестный товар')
    })
  })

  describe('for services (isService = true)', () => {
    it('should return service name when found', () => {
      const result = getArrayItemNameById(mockServices, 'service-1', true)
      expect(result).toBe('Service 1')
    })

    it('should return service name when found and title is also present', () => {
      const result = getArrayItemNameById(mockServices, 'service-2', true)
      expect(result).toBe('Service 2')
    })

    it('should return "Неизвестная услуга" when service not found', () => {
      const result = getArrayItemNameById(mockServices, 'non-existent', true)
      expect(result).toBe('Неизвестная услуга')
    })

    it('should return "Неизвестная услуга" when items is null', () => {
      const result = getArrayItemNameById(null, 'service-1', true)
      expect(result).toBe('Неизвестная услуга')
    })

    it('should return "Неизвестная услуга" when items is undefined', () => {
      const result = getArrayItemNameById(undefined, 'service-1', true)
      expect(result).toBe('Неизвестная услуга')
    })

    it('should return "Неизвестная услуга" when name is missing', () => {
      const itemsWithoutName = [{ _id: 'service-1', title: 'Service Title' }]
      const result = getArrayItemNameById(itemsWithoutName, 'service-1', true)
      expect(result).toBe('Неизвестная услуга')
    })
  })

  describe('edge cases', () => {
    it('should work with empty array', () => {
      const result = getArrayItemNameById([], '1', false)
      expect(result).toBe('Неизвестный товар')
    })

    it('should work with empty array for services', () => {
      const result = getArrayItemNameById([], 'service-1', true)
      expect(result).toBe('Неизвестная услуга')
    })

    it('should handle items with empty strings', () => {
      const itemsWithEmptyStrings = [
        { _id: '1', title: '', name: 'Valid Name' },
        { _id: '2', title: 'Valid Title', name: '' }
      ]
      
      const result1 = getArrayItemNameById(itemsWithEmptyStrings, '1', false)
      expect(result1).toBe('Неизвестный товар')
      
      const result2 = getArrayItemNameById(itemsWithEmptyStrings, '1', true)
      expect(result2).toBe('Valid Name')
      
      const result3 = getArrayItemNameById(itemsWithEmptyStrings, '2', false)
      expect(result3).toBe('Valid Title')
      
      const result4 = getArrayItemNameById(itemsWithEmptyStrings, '2', true)
      expect(result4).toBe('Неизвестная услуга')
    })
  })
}) 
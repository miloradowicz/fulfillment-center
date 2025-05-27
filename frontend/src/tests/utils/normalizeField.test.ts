/* eslint-disable */
import { normalizeField } from '../../utils/normalizeField'

describe('normalizeField utility', () => {
  it('should return empty array when items is undefined', () => {
    const result = normalizeField(undefined)
    expect(result).toEqual([])
  })

  it('should return empty array when items is null', () => {
    const result = normalizeField(undefined)
    expect(result).toEqual([])
  })

  it('should return empty array when items is empty array', () => {
    const result = normalizeField([])
    expect(result).toEqual([])
  })

  it('should normalize product field when product is object', () => {
    const items = [
      {
        id: '1',
        product: { _id: 'product-123', name: 'Test Product' },
        amount: 10
      }
    ]

    const result = normalizeField(items)
    
    expect(result).toEqual([
      {
        id: '1',
        product: 'product-123',
        amount: 10
      }
    ])
  })

  it('should keep product field when product is already string', () => {
    const items = [
      {
        id: '1',
        product: 'product-123',
        amount: 10
      }
    ]

    const result = normalizeField(items)
    
    expect(result).toEqual([
      {
        id: '1',
        product: 'product-123',
        amount: 10
      }
    ])
  })

  it('should normalize service field when service is object', () => {
    const items = [
      {
        id: '1',
        service: { _id: 'service-456', name: 'Test Service' },
        amount: 5
      }
    ]

    const result = normalizeField(items)
    
    expect(result).toEqual([
      {
        id: '1',
        service: 'service-456',
        amount: 5
      }
    ])
  })

  it('should keep service field when service is already string', () => {
    const items = [
      {
        id: '1',
        service: 'service-456',
        amount: 5
      }
    ]

    const result = normalizeField(items)
    
    expect(result).toEqual([
      {
        id: '1',
        service: 'service-456',
        amount: 5
      }
    ])
  })

  it('should normalize both product and service fields', () => {
    const items = [
      {
        id: '1',
        product: { _id: 'product-123', name: 'Test Product' },
        service: { _id: 'service-456', name: 'Test Service' },
        amount: 10
      }
    ]

    const result = normalizeField(items)
    
    expect(result).toEqual([
      {
        id: '1',
        product: 'product-123',
        service: 'service-456',
        amount: 10
      }
    ])
  })

  it('should handle mixed items with different field types', () => {
    const items = [
      {
        id: '1',
        product: { _id: 'product-123', name: 'Test Product' },
        amount: 10
      },
      {
        id: '2',
        service: 'service-456',
        amount: 5
      }
    ]

    const result = normalizeField(items)
    
    expect(result).toEqual([
      {
        id: '1',
        product: 'product-123',
        amount: 10
      },
      {
        id: '2',
        service: 'service-456',
        amount: 5
      }
    ])
  })
}) 
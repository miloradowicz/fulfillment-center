/* eslint-disable */
import { createArrivalAndOrderFormData } from '../../utils/createArrivalAndOrderFormData'
import { ArrivalMutation } from '../../types'

describe('createArrivalAndOrderFormData utility', () => {
  it('should create FormData with arrival data', () => {
    const data: ArrivalMutation = {
      client: 'client-id',
      stock: 'stock-id',
      arrival_date: '2023-12-25',
      sent_amount: '100',
      arrival_status: 'ожидается доставка',
      paymentStatus: 'в ожидании',
      products: [],
      defects: []
    }

    const formData = createArrivalAndOrderFormData(data)

    expect(formData.get('client')).toBe('client-id')
    expect(formData.get('stock')).toBe('stock-id')
    expect(formData.get('arrival_date')).toBe('2023-12-25')
    expect(formData.get('sent_amount')).toBe('100')
  })

  it('should skip null and undefined values', () => {
    const data: ArrivalMutation = {
      client: 'client-id',
      stock: 'stock-id',
      arrival_date: '2023-12-25',
      sent_amount: '100',
      arrival_status: 'ожидается доставка',
      paymentStatus: 'в ожидании',
      products: [],
      defects: [],
      pickup_location: undefined,
      shipping_agent: null
    }

    const formData = createArrivalAndOrderFormData(data)

    expect(formData.get('client')).toBe('client-id')
    expect(formData.get('pickup_location')).toBeNull()
    expect(formData.get('shipping_agent')).toBeNull()
  })

  it('should handle Date objects', () => {
    const testDate = new Date('2023-12-25T10:30:00.000Z')
    const data = {
      client: 'client-id',
      stock: 'stock-id',
      arrival_date: testDate,
      sent_amount: '100',
      arrival_status: 'ожидается доставка',
      paymentStatus: 'в ожидании',
      products: [],
      defects: []
    } as any

    const formData = createArrivalAndOrderFormData(data)

    expect(formData.get('arrival_date')).toBe(testDate.toISOString())
    expect(formData.get('client')).toBe('client-id')
  })

  it('should handle array values with nested objects', () => {
    const data: ArrivalMutation = {
      client: 'client-id',
      stock: 'stock-id',
      arrival_date: '2023-12-25',
      sent_amount: '100',
      arrival_status: 'ожидается доставка',
      paymentStatus: 'в ожидании',
      products: [
        {
          product: 'product-1',
          description: 'Product 1',
          amount: 10
        },
        {
          product: 'product-2',
          description: 'Product 2',
          amount: 5
        }
      ],
      defects: []
    }

    const formData = createArrivalAndOrderFormData(data)

    expect(formData.get('products[0][product]')).toBe('product-1')
    expect(formData.get('products[0][description]')).toBe('Product 1')
    expect(formData.get('products[0][amount]')).toBe('10')
    expect(formData.get('products[1][product]')).toBe('product-2')
    expect(formData.get('products[1][description]')).toBe('Product 2')
    expect(formData.get('products[1][amount]')).toBe('5')
  })

  it('should add files to FormData', () => {
    const data: ArrivalMutation = {
      client: 'client-id',
      stock: 'stock-id',
      arrival_date: '2023-12-25',
      sent_amount: '100',
      arrival_status: 'ожидается доставка',
      paymentStatus: 'в ожидании',
      products: [],
      defects: []
    }
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' })
    const files = [file1, file2]

    const formData = createArrivalAndOrderFormData(data, files)

    expect(formData.get('client')).toBe('client-id')
    expect(formData.getAll('documents')).toHaveLength(2)
    expect(formData.getAll('documents')[0]).toBe(file1)
    expect(formData.getAll('documents')[1]).toBe(file2)
  })

  it('should work without files parameter', () => {
    const data: ArrivalMutation = {
      client: 'client-id',
      stock: 'stock-id',
      arrival_date: '2023-12-25',
      sent_amount: '100',
      arrival_status: 'ожидается доставка',
      paymentStatus: 'в ожидании',
      products: [],
      defects: []
    }

    const formData = createArrivalAndOrderFormData(data)

    expect(formData.get('client')).toBe('client-id')
    expect(formData.getAll('documents')).toHaveLength(0)
  })

  it('should work with empty files array', () => {
    const data: ArrivalMutation = {
      client: 'client-id',
      stock: 'stock-id',
      arrival_date: '2023-12-25',
      sent_amount: '100',
      arrival_status: 'ожидается доставка',
      paymentStatus: 'в ожидании',
      products: [],
      defects: []
    }

    const formData = createArrivalAndOrderFormData(data, [])

    expect(formData.get('client')).toBe('client-id')
    expect(formData.getAll('documents')).toHaveLength(0)
  })
}) 
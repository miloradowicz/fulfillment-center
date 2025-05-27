/* eslint-disable */
import { getAvailableItems } from '../../utils/getAvailableItems'

describe('getAvailableItems utility', () => {
  const mockAllItems = [
    { _id: '1', name: 'Item 1' },
    { _id: '2', name: 'Item 2' },
    { _id: '3', name: 'Item 3' },
    { _id: '4', name: 'Item 4' }
  ]

  const mockSentItems = [
    { product: { _id: '1', name: 'Item 1' } },
    { product: { _id: '2', name: 'Item 2' } }
  ]

  let mockSetAvailableItems: jest.Mock
  let mockAvailableItems: typeof mockAllItems

  beforeEach(() => {
    mockSetAvailableItems = jest.fn()
    mockAvailableItems = []
  })

  it('should add new items to available items when they exist in sent items but not in available items', () => {
    getAvailableItems(
      mockAllItems,
      mockSentItems,
      mockAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).toHaveBeenCalledWith(expect.any(Function))
    
    // Проверяем что функция обновления была вызвана правильно
    const updateFunction = mockSetAvailableItems.mock.calls[0][0]
    const result = updateFunction([])
    
    expect(result).toEqual([
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' }
    ])
  })

  it('should not add items that are already in available items', () => {
    const existingAvailableItems = [
      { _id: '1', name: 'Item 1' }
    ]

    getAvailableItems(
      mockAllItems,
      mockSentItems,
      existingAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).toHaveBeenCalledWith(expect.any(Function))
    
    const updateFunction = mockSetAvailableItems.mock.calls[0][0]
    const result = updateFunction(existingAvailableItems)
    
    // Должен добавить только Item 2, так как Item 1 уже есть
    expect(result).toEqual([
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' }
    ])
  })

  it('should not call setAvailableItems when no new items to add', () => {
    const existingAvailableItems = [
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' }
    ]

    getAvailableItems(
      mockAllItems,
      mockSentItems,
      existingAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).not.toHaveBeenCalled()
  })

  it('should not call setAvailableItems when allItems is null', () => {
    getAvailableItems(
      null as any,
      mockSentItems,
      mockAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).not.toHaveBeenCalled()
  })

  it('should not call setAvailableItems when allItems is undefined', () => {
    getAvailableItems(
      undefined as any,
      mockSentItems,
      mockAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).not.toHaveBeenCalled()
  })

  it('should work with custom idField', () => {
    const customItems = [
      { _id: 'a', customId: 'a', name: 'Item A' },
      { _id: 'b', customId: 'b', name: 'Item B' }
    ]

    const customSentItems = [
      { product: { _id: 'a', customId: 'a', name: 'Item A' } }
    ]

    getAvailableItems(
      customItems as any,
      customSentItems as any,
      [],
      mockSetAvailableItems,
      'customId' as any
    )

    expect(mockSetAvailableItems).toHaveBeenCalledWith(expect.any(Function))
    
    const updateFunction = mockSetAvailableItems.mock.calls[0][0]
    const result = updateFunction([])
    
    expect(result).toEqual([
      { _id: 'a', customId: 'a', name: 'Item A' }
    ])
  })

  it('should handle empty sentItems array', () => {
    getAvailableItems(
      mockAllItems,
      [],
      mockAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).not.toHaveBeenCalled()
  })

  it('should handle empty allItems array', () => {
    getAvailableItems(
      [],
      mockSentItems,
      mockAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).not.toHaveBeenCalled()
  })

  it('should handle sentItems with items not in allItems', () => {
    const sentItemsWithMissingItems = [
      { product: { _id: '1', name: 'Item 1' } },
      { product: { _id: '999', name: 'Missing Item' } }
    ]

    getAvailableItems(
      mockAllItems,
      sentItemsWithMissingItems,
      mockAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).toHaveBeenCalledWith(expect.any(Function))
    
    const updateFunction = mockSetAvailableItems.mock.calls[0][0]
    const result = updateFunction([])
    
    // Должен добавить только Item 1, так как Item 999 не существует в allItems
    expect(result).toEqual([
      { _id: '1', name: 'Item 1' }
    ])
  })

  it('should preserve existing available items when adding new ones', () => {
    const existingAvailableItems = [
      { _id: '3', name: 'Item 3' }
    ]

    getAvailableItems(
      mockAllItems,
      mockSentItems,
      existingAvailableItems,
      mockSetAvailableItems
    )

    expect(mockSetAvailableItems).toHaveBeenCalledWith(expect.any(Function))
    
    const updateFunction = mockSetAvailableItems.mock.calls[0][0]
    const result = updateFunction(existingAvailableItems)
    
    expect(result).toEqual([
      { _id: '3', name: 'Item 3' },
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' }
    ])
  })
}) 
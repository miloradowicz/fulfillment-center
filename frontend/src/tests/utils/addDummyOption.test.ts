/* eslint-disable */
import { addDummyOption } from '../../utils/addDummuOption'

describe('addDummyOption utility', () => {
  it('should add dummy option to empty array', () => {
    const list: string[] = []
    const dummy = 'dummy-option'
    
    const result = addDummyOption(list, dummy)
    
    expect(result).toEqual(['dummy-option'])
  })

  it('should add dummy option to array with existing items', () => {
    const list = ['item1', 'item2', 'item3']
    const dummy = 'dummy-option'
    
    const result = addDummyOption(list, dummy)
    
    expect(result).toEqual(['item1', 'item2', 'item3', 'dummy-option'])
  })

  it('should add object dummy option to array of objects', () => {
    const list = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]
    const dummy = { id: 0, name: 'Select option' }
    
    const result = addDummyOption(list, dummy)
    
    expect(result).toEqual([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 0, name: 'Select option' }
    ])
  })

  it('should add number dummy option to array of numbers', () => {
    const list = [1, 2, 3]
    const dummy = 0
    
    const result = addDummyOption(list, dummy)
    
    expect(result).toEqual([1, 2, 3, 0])
  })

  it('should not modify original array', () => {
    const list = ['item1', 'item2']
    const dummy = 'dummy'
    
    const result = addDummyOption(list, dummy)
    
    expect(list).toEqual(['item1', 'item2'])
    expect(result).toEqual(['item1', 'item2', 'dummy'])
    expect(result).not.toBe(list)
  })

  it('should handle different types for list and dummy', () => {
    const list = [1, 2, 3]
    const dummy = 'zero'
    
    const result = addDummyOption(list, dummy)
    
    expect(result).toEqual([1, 2, 3, 'zero'])
  })
}) 
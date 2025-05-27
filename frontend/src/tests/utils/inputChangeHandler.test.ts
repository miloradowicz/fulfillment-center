/* eslint-disable */
import { inputChangeHandler } from '../../utils/inputChangeHandler'

describe('inputChangeHandler utility', () => {
  it('should handle text input change', () => {
    const setState = jest.fn()
    const event = {
      target: {
        name: 'username',
        value: 'john_doe'
      }
    } as React.ChangeEvent<HTMLInputElement>

    inputChangeHandler(event, setState)

    expect(setState).toHaveBeenCalledWith(expect.any(Function))
    
    // Проверяем результат функции setState
    const setStateCall = setState.mock.calls[0][0]
    const result = setStateCall({ existingField: 'value' })
    expect(result).toEqual({
      existingField: 'value',
      username: 'john_doe'
    })
  })

  it('should handle number input change', () => {
    const setState = jest.fn()
    const event = {
      target: {
        name: 'age',
        value: '25'
      }
    } as React.ChangeEvent<HTMLInputElement>

    inputChangeHandler(event, setState)

    expect(setState).toHaveBeenCalledWith(expect.any(Function))
    
    const setStateCall = setState.mock.calls[0][0]
    const result = setStateCall({})
    expect(result).toEqual({
      age: '25'
    })
  })

  it('should handle empty value', () => {
    const setState = jest.fn()
    const event = {
      target: {
        name: 'description',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>

    inputChangeHandler(event, setState)

    expect(setState).toHaveBeenCalledWith(expect.any(Function))
    
    const setStateCall = setState.mock.calls[0][0]
    const result = setStateCall({})
    expect(result).toEqual({
      description: ''
    })
  })

  it('should handle special characters', () => {
    const setState = jest.fn()
    const event = {
      target: {
        name: 'comment',
        value: 'Test with special chars: !@#$%^&*()'
      }
    } as React.ChangeEvent<HTMLInputElement>

    inputChangeHandler(event, setState)

    expect(setState).toHaveBeenCalledWith(expect.any(Function))
    
    const setStateCall = setState.mock.calls[0][0]
    const result = setStateCall({})
    expect(result).toEqual({
      comment: 'Test with special chars: !@#$%^&*()'
    })
  })

  it('should handle textarea change', () => {
    const setState = jest.fn()
    const event = {
      target: {
        name: 'message',
        value: 'This is a long message\nwith multiple lines'
      }
    } as React.ChangeEvent<HTMLTextAreaElement>

    inputChangeHandler(event, setState)

    expect(setState).toHaveBeenCalledWith(expect.any(Function))
    
    const setStateCall = setState.mock.calls[0][0]
    const result = setStateCall({})
    expect(result).toEqual({
      message: 'This is a long message\nwith multiple lines'
    })
  })

  it('should preserve existing state when updating', () => {
    const setState = jest.fn()
    const event = {
      target: {
        name: 'newField',
        value: 'newValue'
      }
    } as React.ChangeEvent<HTMLInputElement>

    inputChangeHandler(event, setState)

    const setStateCall = setState.mock.calls[0][0]
    const result = setStateCall({
      existingField1: 'value1',
      existingField2: 'value2'
    })
    
    expect(result).toEqual({
      existingField1: 'value1',
      existingField2: 'value2',
      newField: 'newValue'
    })
  })
}) 
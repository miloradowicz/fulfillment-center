/* eslint-disable */

import { Public, PUBLIC_KEY } from '../../src/decorators/public.decorator'
describe('Public Decorator', () => {
  it('should be defined', () => {
    expect(Public).toBeDefined()
    expect(PUBLIC_KEY).toBeDefined()
  })
  it('should have correct PUBLIC_KEY value', () => {
    expect(PUBLIC_KEY).toBe('isPublic')
  })
  it('should return a decorator function', () => {
    const decorator = Public()
    expect(typeof decorator).toBe('function')
  })
  it('should create a decorator that can be applied to a class', () => {
    const decorator = Public()
    @decorator
    class TestClass {}
    expect(TestClass).toBeDefined()
  })
  it('should create a decorator that can be applied to a method', () => {
    const decorator = Public()
    class TestClass {
      @decorator
      testMethod() {
        return 'test'
      }
    }
    const instance = new TestClass()
    expect(instance.testMethod()).toBe('test')
  })
}) 
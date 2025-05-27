/* eslint-disable */

import { Roles, ROLES_KEY } from '../../src/decorators/roles.decorator'
import { RolesType } from '../../src/enums'
describe('Roles Decorator', () => {
  it('should be defined', () => {
    expect(Roles).toBeDefined()
    expect(ROLES_KEY).toBeDefined()
  })
  it('should have correct ROLES_KEY value', () => {
    expect(ROLES_KEY).toBe('roles')
  })
  it('should return a decorator function', () => {
    const decorator = Roles('admin' as RolesType)
    expect(typeof decorator).toBe('function')
  })
  it('should create a decorator that can be applied to a class', () => {
    const decorator = Roles('admin' as RolesType, 'manager' as RolesType)
    @decorator
    class TestClass {}
    expect(TestClass).toBeDefined()
  })
  it('should create a decorator that can be applied to a method', () => {
    const decorator = Roles('admin' as RolesType)
    class TestClass {
      @decorator
      testMethod() {
        return 'test'
      }
    }
    const instance = new TestClass()
    expect(instance.testMethod()).toBe('test')
  })
  it('should accept multiple roles', () => {
    const decorator = Roles('admin' as RolesType, 'manager' as RolesType, 'stock-worker' as RolesType)
    class TestClass {
      @decorator
      multiRoleMethod() {
        return 'multi-role'
      }
    }
    const instance = new TestClass()
    expect(instance.multiRoleMethod()).toBe('multi-role')
  })
  it('should accept single role', () => {
    const decorator = Roles('admin' as RolesType)
    class TestClass {
      @decorator
      singleRoleMethod() {
        return 'single-role'
      }
    }
    const instance = new TestClass()
    expect(instance.singleRoleMethod()).toBe('single-role')
  })
  it('should work with no roles', () => {
    const decorator = Roles()
    class TestClass {
      @decorator
      noRoleMethod() {
        return 'no-role'
      }
    }
    const instance = new TestClass()
    expect(instance.noRoleMethod()).toBe('no-role')
  })
}) 
/* eslint-disable */

import { User } from '../../src/decorators/user.param-decorator'
describe('User Param Decorator', () => {
  it('should be defined', () => {
    expect(User).toBeDefined()
  })
  it('should be a function', () => {
    expect(typeof User).toBe('function')
  })
}) 
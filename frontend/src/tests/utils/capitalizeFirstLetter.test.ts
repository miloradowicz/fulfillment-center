/* eslint-disable */
import { capitalize } from '../../utils/capitalizeFirstLetter'

describe('capitalize utility', () => {
  it('should capitalize first letter of lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should keep first letter capitalized and lowercase the rest', () => {
    expect(capitalize('HELLO')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('should handle string with spaces', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })

  it('should handle string starting with number', () => {
    expect(capitalize('123abc')).toBe('123abc')
  })

  it('should handle string with special characters', () => {
    expect(capitalize('!hello')).toBe('!hello')
  })

  it('should handle mixed case string', () => {
    expect(capitalize('hELLO')).toBe('Hello')
  })

  it('should handle single uppercase character', () => {
    expect(capitalize('A')).toBe('A')
  })
}) 
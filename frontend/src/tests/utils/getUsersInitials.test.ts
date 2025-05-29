/* eslint-disable */
import { getUsersInitials } from '../../utils/getUsersInitials'

describe('getUsersInitials utility', () => {
  it('should return empty string for empty name', () => {
    expect(getUsersInitials('')).toBe('')
  })

  it('should return empty string for whitespace only name', () => {
    expect(getUsersInitials('   ')).toBe('')
  })

  it('should return single initial for single word name', () => {
    expect(getUsersInitials('John')).toBe('J')
  })

  it('should return single initial for single word name with extra spaces', () => {
    expect(getUsersInitials('  John  ')).toBe('J')
  })

  it('should return two initials for two word name', () => {
    expect(getUsersInitials('John Doe')).toBe('JD')
  })

  it('should return two initials for name with multiple spaces', () => {
    expect(getUsersInitials('John   Doe')).toBe('JD')
  })

  it('should return two initials for name with leading/trailing spaces', () => {
    expect(getUsersInitials('  John Doe  ')).toBe('JD')
  })

  it('should return two initials for three word name (first and second)', () => {
    expect(getUsersInitials('John Michael Doe')).toBe('JM')
  })

  it('should return two initials for multiple word name', () => {
    expect(getUsersInitials('John Michael Robert Doe')).toBe('JM')
  })

  it('should handle lowercase names', () => {
    expect(getUsersInitials('john doe')).toBe('JD')
  })

  it('should handle mixed case names', () => {
    expect(getUsersInitials('jOhN dOe')).toBe('JD')
  })

  it('should handle names with special characters', () => {
    expect(getUsersInitials('Jean-Pierre Dupont')).toBe('JD')
  })

  it('should handle single character names', () => {
    expect(getUsersInitials('A B')).toBe('AB')
  })

  it('should handle single character single name', () => {
    expect(getUsersInitials('A')).toBe('A')
  })

  it('should return first character for name with only special characters', () => {
    expect(getUsersInitials('---')).toBe('-')
  })

  it('should handle Cyrillic names', () => {
    expect(getUsersInitials('Иван Петров')).toBe('ИП')
  })

  it('should handle single Cyrillic name', () => {
    expect(getUsersInitials('Иван')).toBe('И')
  })
}) 
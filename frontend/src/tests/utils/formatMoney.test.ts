/* eslint-disable */
import { formatMoney } from '../../utils/formatMoney'

describe('formatMoney utility', () => {
  it('should format number correctly', () => {
    expect(formatMoney(1000)).toBe('1,000.00')
  })

  it('should format zero', () => {
    expect(formatMoney(0)).toBe('0.00')
  })

  it('should format negative numbers', () => {
    expect(formatMoney(-1000)).toBe('-1,000.00')
  })

  it('should format decimal numbers', () => {
    expect(formatMoney(1000.50)).toBe('1,000.50')
  })

  it('should format large numbers', () => {
    expect(formatMoney(1000000)).toBe('1,000,000.00')
  })

  it('should handle undefined input', () => {
    expect(formatMoney(undefined)).toBe('—')
  })

  it('should handle non-number input', () => {
    expect(formatMoney('invalid' as any)).toBe('—')
  })

  it('should format small decimal numbers', () => {
    expect(formatMoney(0.99)).toBe('0.99')
  })

  it('should format numbers with many decimal places', () => {
    expect(formatMoney(123.456789)).toBe('123.46')
  })
}) 
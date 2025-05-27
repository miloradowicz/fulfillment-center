/* eslint-disable */
import { 
  tabTriggerStyles, 
  arrivalStatusStyles, 
  orderStatusStyles, 
  invoiceStatusStyles 
} from '../../utils/commonStyles'

describe('commonStyles utilities', () => {
  describe('tabTriggerStyles', () => {
    it('should contain correct CSS classes', () => {
      expect(tabTriggerStyles).toContain('data-[state=active]:bg-primary')
      expect(tabTriggerStyles).toContain('data-[state=active]:text-white')
      expect(tabTriggerStyles).toContain('hover:bg-primary/5')
      expect(tabTriggerStyles).toContain('hover:text-primary')
      expect(tabTriggerStyles).toContain('px-3 py-1 my-1')
      expect(tabTriggerStyles).toContain('text-sm sm:text-base')
      expect(tabTriggerStyles).toContain('rounded-3xl')
      expect(tabTriggerStyles).toContain('transition-all')
      expect(tabTriggerStyles).toContain('cursor-pointer')
    })
  })

  describe('arrivalStatusStyles', () => {
    it('should have correct styles for "ожидается доставка" status', () => {
      const style = arrivalStatusStyles['ожидается доставка']
      expect(style).toContain('bg-yellow-100')
      expect(style).toContain('text-yellow-600')
      expect(style).toContain('hover:bg-yellow-200')
      expect(style).toContain('hover:text-yellow-800')
      expect(style).toContain('transition-colors')
      expect(style).toContain('font-bold')
    })

    it('should have correct styles for "получена" status', () => {
      const style = arrivalStatusStyles['получена']
      expect(style).toContain('bg-emerald-100')
      expect(style).toContain('text-emerald-700')
      expect(style).toContain('hover:bg-emerald-200')
      expect(style).toContain('hover:text-emerald-900')
      expect(style).toContain('transition-colors')
      expect(style).toContain('font-bold')
    })

    it('should have correct styles for "отсортирована" status', () => {
      const style = arrivalStatusStyles['отсортирована']
      expect(style).toContain('bg-indigo-100')
      expect(style).toContain('text-indigo-700')
      expect(style).toContain('hover:bg-indigo-200')
      expect(style).toContain('hover:text-indigo-900')
      expect(style).toContain('transition-colors')
      expect(style).toContain('font-bold')
    })

    it('should have default style', () => {
      const style = arrivalStatusStyles['default']
      expect(style).toContain('bg-primary/10')
      expect(style).toContain('text-primary/80')
      expect(style).toContain('border')
      expect(style).toContain('hover:bg-primary/20')
      expect(style).toContain('hover:text-primary')
      expect(style).toContain('transition-colors')
    })
  })

  describe('orderStatusStyles', () => {
    it('should have correct styles for "в сборке" status', () => {
      const style = orderStatusStyles['в сборке']
      expect(style).toContain('bg-yellow-100')
      expect(style).toContain('text-yellow-600')
      expect(style).toContain('hover:bg-yellow-200')
      expect(style).toContain('hover:text-yellow-800')
      expect(style).toContain('transition-colors')
      expect(style).toContain('rounded-lg')
      expect(style).toContain('font-bold')
    })

    it('should have correct styles for "в пути" status', () => {
      const style = orderStatusStyles['в пути']
      expect(style).toContain('bg-indigo-100')
      expect(style).toContain('text-indigo-700')
      expect(style).toContain('hover:bg-indigo-200')
      expect(style).toContain('hover:text-indigo-900')
      expect(style).toContain('transition-colors')
      expect(style).toContain('rounded-lg')
      expect(style).toContain('font-bold')
    })

    it('should have correct styles for "доставлен" status', () => {
      const style = orderStatusStyles['доставлен']
      expect(style).toContain('bg-emerald-100')
      expect(style).toContain('text-emerald-700')
      expect(style).toContain('hover:bg-emerald-200')
      expect(style).toContain('hover:text-emerald-900')
      expect(style).toContain('transition-colors')
      expect(style).toContain('rounded-lg')
      expect(style).toContain('font-bold')
    })

    it('should have default style', () => {
      const style = orderStatusStyles['default']
      expect(style).toContain('bg-primary/10')
      expect(style).toContain('text-primary/80')
      expect(style).toContain('border')
      expect(style).toContain('font-bold')
      expect(style).toContain('hover:bg-primary/20')
      expect(style).toContain('hover:text-primary')
      expect(style).toContain('transition-colors')
    })
  })

  describe('invoiceStatusStyles', () => {
    it('should have correct styles for "в ожидании" status', () => {
      const style = invoiceStatusStyles['в ожидании']
      expect(style).toContain('bg-yellow-100')
      expect(style).toContain('text-yellow-600')
      expect(style).toContain('rounded-lg')
      expect(style).toContain('font-bold')
      expect(style).toContain('px-4 py-2')
    })

    it('should have correct styles for "оплачено" status', () => {
      const style = invoiceStatusStyles['оплачено']
      expect(style).toContain('bg-emerald-100')
      expect(style).toContain('text-emerald-700')
      expect(style).toContain('transition-colors')
      expect(style).toContain('rounded-lg')
      expect(style).toContain('font-bold')
      expect(style).toContain('px-4 py-2')
    })

    it('should have correct styles for "частично оплачено" status', () => {
      const style = invoiceStatusStyles['частично оплачено']
      expect(style).toContain('bg-indigo-100')
      expect(style).toContain('text-indigo-700')
      expect(style).toContain('rounded-lg')
      expect(style).toContain('font-bold')
      expect(style).toContain('px-4 py-2')
    })

    it('should have default style', () => {
      const style = invoiceStatusStyles['default']
      expect(style).toContain('bg-primary/10')
      expect(style).toContain('text-primary/80')
      expect(style).toContain('border')
      expect(style).toContain('font-bold')
    })
  })
}) 
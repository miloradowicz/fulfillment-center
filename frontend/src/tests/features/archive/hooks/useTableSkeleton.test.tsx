/* eslint-disable */
import { renderHook } from '@testing-library/react'
import { useSkeletonTableRows } from '@/features/archive/hooks/useTableSkeleton.ts'

describe('useSkeletonTableRows Hook', () => {
  interface TestItem {
    _id?: string
    id: string
    name: string
    value: number
  }

  const mockTemplate: Partial<TestItem> = {
    name: 'Test Name',
    value: 100,
  }

  describe('Базовая функциональность', () => {
    it('должен возвращать массив скелетонов с правильным количеством элементов по умолчанию', () => {
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate))

      expect(result.current).toHaveLength(3)
      expect(Array.isArray(result.current)).toBe(true)
    })

    it('должен возвращать массив скелетонов с заданным количеством элементов', () => {
      const count = 5
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate, count))

      expect(result.current).toHaveLength(count)
    })

    it('должен возвращать пустой массив при count = 0', () => {
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate, 0))

      expect(result.current).toHaveLength(0)
      expect(Array.isArray(result.current)).toBe(true)
    })

    it('должен работать с большим количеством элементов', () => {
      const count = 100
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate, count))

      expect(result.current).toHaveLength(count)
    })
  })

  describe('Структура скелетонов', () => {
    it('должен добавлять свойство isSkeleton: true к каждому элементу', () => {
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate))

      result.current.forEach(item => {
        expect(item.isSkeleton).toBe(true)
      })
    })

    it('должен добавлять уникальный _id к каждому элементу', () => {
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate, 5))

      const ids = result.current.map(item => item._id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(5)
      expect(ids).toEqual(['skeleton-0', 'skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'])
    })

    it('должен сохранять свойства из шаблона', () => {
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate))

      result.current.forEach(item => {
        expect(item.name).toBe('Test Name')
        expect(item.value).toBe(100)
      })
    })

    it('должен работать с пустым шаблоном', () => {
      const { result } = renderHook(() => useSkeletonTableRows({}))

      expect(result.current).toHaveLength(3)
      result.current.forEach((item, index) => {
        expect((item as any)._id).toBe(`skeleton-${index}`)
        expect(item.isSkeleton).toBe(true)
      })
    })
  })

  describe('Мемоизация', () => {
    it('должен возвращать тот же массив при одинаковых параметрах', () => {
      const { result, rerender } = renderHook(
        ({ template, count }) => useSkeletonTableRows(template, count),
        {
          initialProps: { template: mockTemplate, count: 3 }
        }
      )

      const firstResult = result.current

      rerender({ template: mockTemplate, count: 3 })

      expect(result.current).toBe(firstResult)
    })

    it('должен пересчитывать при изменении шаблона', () => {
      const { result, rerender } = renderHook(
        ({ template, count }) => useSkeletonTableRows(template, count),
        {
          initialProps: { template: mockTemplate, count: 3 }
        }
      )

      const firstResult = result.current

      const newTemplate = { name: 'New Name', value: 200 }
      rerender({ template: newTemplate, count: 3 })

      expect(result.current).not.toBe(firstResult)
      expect(result.current[0].name).toBe('New Name')
      expect(result.current[0].value).toBe(200)
    })

    it('должен пересчитывать при изменении количества', () => {
      const { result, rerender } = renderHook(
        ({ template, count }) => useSkeletonTableRows(template, count),
        {
          initialProps: { template: mockTemplate, count: 3 }
        }
      )

      const firstResult = result.current

      rerender({ template: mockTemplate, count: 5 })

      expect(result.current).not.toBe(firstResult)
      expect(result.current).toHaveLength(5)
    })
  })

  describe('Различные типы данных', () => {
    it('должен работать с числовыми значениями', () => {
      const template = { id: 1, count: 0 }
      const { result } = renderHook(() => useSkeletonTableRows(template))

      result.current.forEach(item => {
        expect(item.id).toBe(1)
        expect(item.count).toBe(0)
      })
    })

    it('должен работать с булевыми значениями', () => {
      const template = { isActive: true, isVisible: false }
      const { result } = renderHook(() => useSkeletonTableRows(template))

      result.current.forEach(item => {
        expect(item.isActive).toBe(true)
        expect(item.isVisible).toBe(false)
      })
    })

    it('должен работать с null и undefined', () => {
      const template = { nullValue: null, undefinedValue: undefined }
      const { result } = renderHook(() => useSkeletonTableRows(template))

      result.current.forEach(item => {
        expect(item.nullValue).toBeNull()
        expect(item.undefinedValue).toBeUndefined()
      })
    })

    it('должен работать с массивами и объектами', () => {
      const template = { 
        array: [1, 2, 3], 
        object: { nested: 'value' } 
      }
      const { result } = renderHook(() => useSkeletonTableRows(template))

      result.current.forEach(item => {
        expect(item.array).toEqual([1, 2, 3])
        expect(item.object).toEqual({ nested: 'value' })
      })
    })
  })

  describe('Граничные случаи', () => {
    it('должен работать с отрицательным count (обрабатывается как 0)', () => {
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate, -1))

      expect(result.current).toHaveLength(0)
    })

    it('должен работать с дробным count (округляется вниз)', () => {
      const { result } = renderHook(() => useSkeletonTableRows(mockTemplate, 3.7))

      expect(result.current).toHaveLength(3)
    })

    it('должен работать с очень большим шаблоном', () => {
      const largeTemplate = Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [`prop${i}`, `value${i}`])
      )
      
      const { result } = renderHook(() => useSkeletonTableRows(largeTemplate, 2))

      expect(result.current).toHaveLength(2)
      expect(result.current[0].prop0).toBe('value0')
      expect(result.current[0].prop99).toBe('value99')
    })
  })

  describe('TypeScript типизация', () => {
    it('должен правильно типизировать возвращаемый массив', () => {
      const { result } = renderHook(() => useSkeletonTableRows<TestItem>(mockTemplate))

      // TypeScript должен понимать, что это TestItem & { isSkeleton: boolean }
      const firstItem = result.current[0]
      
      expect(typeof firstItem.isSkeleton).toBe('boolean')
      expect(typeof firstItem._id).toBe('string')
      expect(typeof firstItem.name).toBe('string')
      expect(typeof firstItem.value).toBe('number')
    })
  })
}) 
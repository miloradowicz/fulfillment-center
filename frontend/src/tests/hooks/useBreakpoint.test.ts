/* eslint-disable */
import { renderHook, act } from '@testing-library/react'
import useBreakpoint from '../../hooks/useBreakpoint'

// Мокируем window
const mockWindow = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

describe('useBreakpoint hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Мокируем addEventListener и removeEventListener
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()
  })

  it('should return correct breakpoint for mobile width', () => {
    mockWindow(500)
    
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('base')
    expect(result.current.isMobileSm).toBe(true)
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
  })

  it('should return correct breakpoint for small mobile width', () => {
    mockWindow(700)
    
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('sm')
    expect(result.current.isMobileSm).toBe(false)
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
  })

  it('should return correct breakpoint for tablet width', () => {
    mockWindow(800)
    
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('md')
    expect(result.current.isMobileSm).toBe(false)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isDesktop).toBe(false)
  })

  it('should return correct breakpoint for desktop width', () => {
    mockWindow(1200)
    
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('lg')
    expect(result.current.isMobileSm).toBe(false)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(true)
  })

  it('should return correct breakpoint for extra large width', () => {
    mockWindow(1400)
    
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('xl')
    expect(result.current.isDesktop).toBe(true)
  })

  it('should return correct breakpoint for 2xl width', () => {
    mockWindow(1600)
    
    const { result } = renderHook(() => useBreakpoint())
    
    expect(result.current.breakpoint).toBe('2xl')
    expect(result.current.isDesktop).toBe(true)
  })

  it('should add and remove event listeners', () => {
    const { unmount } = renderHook(() => useBreakpoint())
    
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    
    unmount()
    
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })
}) 
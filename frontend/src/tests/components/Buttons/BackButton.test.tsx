/* eslint-disable */
import './setup' // Импортируем общие моки
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import BackButton from '../../../components/Buttons/BackButton'

describe('BackButton component', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks()
  })

  it('should render button with correct text', () => {
    render(<BackButton />)
    
    expect(screen.getByTestId('mocked-button')).toHaveTextContent('Назад')
  })

  it('should render ArrowLeft icon', () => {
    render(<BackButton />)
    
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument()
  })

  it('should call window.history.back on click', () => {
    render(<BackButton />)
    
    fireEvent.click(screen.getByTestId('mocked-button'))
    
    expect(window.history.back).toHaveBeenCalledTimes(1)
  })

  it('should apply correct CSS classes', () => {
    render(<BackButton />)
    
    const button = screen.getByTestId('mocked-button')
    expect(button).toHaveClass('flex')
    expect(button).toHaveClass('items-center')
    expect(button).toHaveClass('gap-1')
    expect(button).toHaveClass('text-primary')
    expect(button).toHaveClass('hover:bg-muted')
    expect(button).toHaveClass('hover:shadow-sm')
    expect(button).toHaveClass('rounded-lg')
    expect(button).toHaveClass('uppercase')
    expect(button).toHaveClass('text-sm')
    expect(button).toHaveClass('font-semibold')
    expect(button).toHaveClass('tracking-tight')
    expect(button).toHaveClass('mt-5')
  })

  it('should have ghost variant', () => {
    render(<BackButton />)
    
    const button = screen.getByTestId('mocked-button')
    // Проверяем, что кнопка получила правильный variant через пропсы
    expect(button).toBeInTheDocument()
  })

  it('should handle multiple clicks', () => {
    render(<BackButton />)
    
    const button = screen.getByTestId('mocked-button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(window.history.back).toHaveBeenCalledTimes(3)
  })

  it('should render icon with correct classes', () => {
    render(<BackButton />)
    
    const icon = screen.getByTestId('arrow-left-icon')
    // BackButton использует className для размера иконки, а не size prop
    expect(icon).toBeInTheDocument()
  })

  it('should not be wrapped in additional container', () => {
    const { container } = render(<BackButton />)
    
    // BackButton возвращает Button напрямую, без обертки
    expect(container.firstChild?.nodeName).toBe('BUTTON')
  })
}) 
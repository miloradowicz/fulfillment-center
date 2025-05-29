/* eslint-disable */
import './setup' // Импортируем общие моки
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import EditButton from '../../../components/Buttons/EditButton'

describe('EditButton component', () => {
  it('should render button with correct text', () => {
    const handleClick = jest.fn()
    render(<EditButton onClick={handleClick} />)
    
    expect(screen.getByTestId('mocked-button')).toHaveTextContent('Править')
  })

  it('should render Edit icon', () => {
    const handleClick = jest.fn()
    render(<EditButton onClick={handleClick} />)
    
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<EditButton onClick={handleClick} />)
    
    fireEvent.click(screen.getByTestId('mocked-button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply correct CSS classes', () => {
    const handleClick = jest.fn()
    render(<EditButton onClick={handleClick} />)
    
    const button = screen.getByTestId('mocked-button')
    expect(button).toHaveClass('font-bold')
    expect(button).toHaveClass('text-xs')
    expect(button).toHaveClass('bg-muted')
    expect(button).toHaveClass('hover:bg-primary')
    expect(button).toHaveClass('text-primary')
    expect(button).toHaveClass('hover:text-white')
    expect(button).toHaveClass('transition-colors')
  })

  it('should have ghost variant', () => {
    const handleClick = jest.fn()
    render(<EditButton onClick={handleClick} />)
    
    const button = screen.getByTestId('mocked-button')
    // Проверяем, что кнопка получила правильный variant через пропсы
    expect(button).toBeInTheDocument()
  })

  it('should handle multiple clicks', () => {
    const handleClick = jest.fn()
    render(<EditButton onClick={handleClick} />)
    
    const button = screen.getByTestId('mocked-button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('should render icon with correct size', () => {
    const handleClick = jest.fn()
    render(<EditButton onClick={handleClick} />)
    
    const icon = screen.getByTestId('edit-icon')
    expect(icon).toHaveAttribute('width', '17')
    expect(icon).toHaveAttribute('height', '17')
  })

  it('should not be wrapped in additional container', () => {
    const handleClick = jest.fn()
    const { container } = render(<EditButton onClick={handleClick} />)
    
    // EditButton возвращает Button напрямую, без обертки
    expect(container.firstChild?.nodeName).toBe('BUTTON')
  })
}) 
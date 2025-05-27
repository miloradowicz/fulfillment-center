/* eslint-disable */
import './setup' // Импортируем общие моки
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import CancelButton from '../../../components/Buttons/CancelButton'

describe('CancelButton component', () => {
  it('should render button with correct text', () => {
    const handleClick = jest.fn()
    render(<CancelButton onClick={handleClick} />)
    
    expect(screen.getByTestId('mocked-button')).toHaveTextContent('Отменить')
  })

  it('should render SquareX icon', () => {
    const handleClick = jest.fn()
    render(<CancelButton onClick={handleClick} />)
    
    expect(screen.getByTestId('square-x-icon')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<CancelButton onClick={handleClick} />)
    
    fireEvent.click(screen.getByTestId('mocked-button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply correct CSS classes', () => {
    const handleClick = jest.fn()
    render(<CancelButton onClick={handleClick} />)
    
    const button = screen.getByTestId('mocked-button')
    expect(button).toHaveClass('font-bold')
    expect(button).toHaveClass('text-xs')
    expect(button).toHaveClass('bg-red-400')
    expect(button).toHaveClass('hover:bg-red-500')
    expect(button).toHaveClass('text-white')
    expect(button).toHaveClass('transition-colors')
    expect(button).toHaveClass('mb-2')
  })

  it('should handle multiple clicks', () => {
    const handleClick = jest.fn()
    render(<CancelButton onClick={handleClick} />)
    
    const button = screen.getByTestId('mocked-button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('should render icon with correct size', () => {
    const handleClick = jest.fn()
    render(<CancelButton onClick={handleClick} />)
    
    const icon = screen.getByTestId('square-x-icon')
    expect(icon).toHaveAttribute('width', '18')
    expect(icon).toHaveAttribute('height', '18')
  })

  it('should be wrapped in div container', () => {
    const handleClick = jest.fn()
    const { container } = render(<CancelButton onClick={handleClick} />)
    
    expect(container.firstChild?.nodeName).toBe('DIV')
  })
}) 
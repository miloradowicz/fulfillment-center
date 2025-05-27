/* eslint-disable */
import './setup' // Импортируем общие моки
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ArchiveButton from '../../../components/Buttons/ArchiveButton'

describe('ArchiveButton component', () => {
  it('should render button with correct text', () => {
    const handleClick = jest.fn()
    render(<ArchiveButton onClick={handleClick} />)
    
    expect(screen.getByTestId('mocked-button')).toHaveTextContent('Архивировать')
  })

  it('should render ArchiveRestore icon', () => {
    const handleClick = jest.fn()
    render(<ArchiveButton onClick={handleClick} />)
    
    expect(screen.getByTestId('archive-restore-icon')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<ArchiveButton onClick={handleClick} />)
    
    fireEvent.click(screen.getByTestId('mocked-button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply correct CSS classes', () => {
    const handleClick = jest.fn()
    render(<ArchiveButton onClick={handleClick} />)
    
    const button = screen.getByTestId('mocked-button')
    expect(button).toHaveClass('font-bold')
    expect(button).toHaveClass('text-xs')
    expect(button).toHaveClass('bg-muted')
    expect(button).toHaveClass('hover:bg-primary')
    expect(button).toHaveClass('text-primary')
    expect(button).toHaveClass('hover:text-white')
    expect(button).toHaveClass('transition-colors')
  })

  it('should handle multiple clicks', () => {
    const handleClick = jest.fn()
    render(<ArchiveButton onClick={handleClick} />)
    
    const button = screen.getByTestId('mocked-button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('should render icon with correct size', () => {
    const handleClick = jest.fn()
    render(<ArchiveButton onClick={handleClick} />)
    
    const icon = screen.getByTestId('archive-restore-icon')
    expect(icon).toHaveAttribute('width', '18')
    expect(icon).toHaveAttribute('height', '18')
  })

  it('should be wrapped in React Fragment', () => {
    const handleClick = jest.fn()
    const { container } = render(<ArchiveButton onClick={handleClick} />)
    
    // React Fragment не создает DOM элемент, поэтому кнопка должна быть прямым потомком
    expect(container.firstChild?.nodeName).toBe('BUTTON')
  })
}) 
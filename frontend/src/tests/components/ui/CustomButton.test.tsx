/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import CustomButton from '../../../components/CustomButton/CustomButton'

// Мокируем Button компонент
jest.mock('../../../components/ui/button', () => ({
  Button: ({ children, className, onClick, type, ...props }: any) => (
    <button 
      className={className} 
      onClick={onClick} 
      type={type}
      data-testid="custom-button"
      {...props}
    >
      {children}
    </button>
  ),
}))

describe('CustomButton component', () => {
  it('should render button with text', () => {
    const handleClick = jest.fn()
    render(<CustomButton text="Click me" onClick={handleClick} />)
    
    expect(screen.getByTestId('custom-button')).toHaveTextContent('Click me')
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<CustomButton text="Click me" onClick={handleClick} />)
    
    fireEvent.click(screen.getByTestId('custom-button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render button with different text values', () => {
    const handleClick = jest.fn()
    const { rerender } = render(<CustomButton text="First text" onClick={handleClick} />)
    
    expect(screen.getByTestId('custom-button')).toHaveTextContent('First text')
    
    rerender(<CustomButton text="Second text" onClick={handleClick} />)
    expect(screen.getByTestId('custom-button')).toHaveTextContent('Second text')
  })

  it('should apply custom button styles', () => {
    const handleClick = jest.fn()
    render(<CustomButton text="Styled button" onClick={handleClick} />)
    
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveClass('cursor-pointer')
    expect(button).toHaveClass('inline-flex')
    expect(button).toHaveClass('gap-2')
    expect(button).toHaveClass('items-center')
    expect(button).toHaveClass('font-medium')
    expect(button).toHaveClass('font-semibold')
  })

  it('should have button type', () => {
    const handleClick = jest.fn()
    render(<CustomButton text="Type button" onClick={handleClick} />)
    
    expect(screen.getByTestId('custom-button')).toHaveAttribute('type', 'button')
  })

  it('should handle multiple clicks', () => {
    const handleClick = jest.fn()
    render(<CustomButton text="Multi click" onClick={handleClick} />)
    
    const button = screen.getByTestId('custom-button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('should render with empty text', () => {
    const handleClick = jest.fn()
    render(<CustomButton text="" onClick={handleClick} />)
    
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    expect(screen.getByTestId('custom-button')).toHaveTextContent('')
  })

  it('should render with special characters in text', () => {
    const handleClick = jest.fn()
    const specialText = "Button with special chars: !@#$%^&*()"
    render(<CustomButton text={specialText} onClick={handleClick} />)
    
    expect(screen.getByTestId('custom-button')).toHaveTextContent(specialText)
  })
}) 
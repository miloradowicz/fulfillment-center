/* eslint-disable */
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../../components/Modal/Modal'

// Мокируем Dialog компоненты
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children, onOpenChange }: any) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => 
    <div data-testid="dialog-content" className={className}>{children}</div>,
  DialogClose: ({ children, asChild }: any) => 
    asChild ? children : <div data-testid="dialog-close">{children}</div>,
  DialogTitle: () => <div data-testid="dialog-title" />,
  DialogDescription: ({ children, className }: any) => 
    <div data-testid="dialog-description" className={className}>{children}</div>,
}))

describe('Modal component', () => {
  it('should render modal when open is true', () => {
    render(
      <Modal open={true} handleClose={jest.fn()}>
        <div>Modal content</div>
      </Modal>
    )
    
    expect(screen.getByText('Modal content')).toBeInTheDocument()
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should not render modal when open is false', () => {
    render(
      <Modal open={false} handleClose={jest.fn()}>
        <div>Modal content</div>
      </Modal>
    )
    
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('should call handleClose when close button is clicked', () => {
    const handleClose = jest.fn()
    render(
      <Modal open={true} handleClose={handleClose}>
        <div>Modal content</div>
      </Modal>
    )
    
    // Ищем кнопку закрытия по aria-label
    const closeButton = screen.getByLabelText('Закрыть модальное окно')
    fireEvent.click(closeButton)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should render modal content correctly', () => {
    render(
      <Modal open={true} handleClose={jest.fn()}>
        <div data-testid="modal-content">
          <h2>Test Title</h2>
          <p>Test description</p>
        </div>
      </Modal>
    )
    
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <Modal open={true} handleClose={jest.fn()}>
        <div>Modal content</div>
      </Modal>
    )
    
    // Проверяем наличие DialogTitle и DialogDescription
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-description')).toBeInTheDocument()
    expect(screen.getByLabelText('Закрыть модальное окно')).toBeInTheDocument()
  })

  it('should apply correct CSS classes', () => {
    render(
      <Modal open={true} handleClose={jest.fn()}>
        <div>Modal content</div>
      </Modal>
    )
    
    const dialogContent = screen.getByTestId('dialog-content')
    expect(dialogContent).toHaveClass('sm:max-w-[500px]')
    expect(dialogContent).toHaveClass('text-primary')
    expect(dialogContent).toHaveClass('p-6')
    expect(dialogContent).toHaveClass('max-h-[90vh]')
    expect(dialogContent).toHaveClass('overflow-y-auto')
  })

  it('should render children inside modal content wrapper', () => {
    render(
      <Modal open={true} handleClose={jest.fn()}>
        <button>Test Button</button>
        <input placeholder="Test Input" />
      </Modal>
    )
    
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument()
  })

  it('should handle multiple modal instances', () => {
    const handleClose1 = jest.fn()
    const handleClose2 = jest.fn()
    
    const { rerender } = render(
      <Modal open={true} handleClose={handleClose1}>
        <div>First modal</div>
      </Modal>
    )
    
    expect(screen.getByText('First modal')).toBeInTheDocument()
    
    rerender(
      <Modal open={true} handleClose={handleClose2}>
        <div>Second modal</div>
      </Modal>
    )
    
    expect(screen.getByText('Second modal')).toBeInTheDocument()
  })

  it('should render dialog description with correct content', () => {
    render(
      <Modal open={true} handleClose={jest.fn()}>
        <div>Modal content</div>
      </Modal>
    )
    
    const description = screen.getByTestId('dialog-description')
    expect(description).toHaveTextContent('Форма создания или редактирования.')
    expect(description).toHaveClass('sr-only')
  })
}) 
/* eslint-disable */
import React from 'react'

// Общие моки для всех тестов кнопок
export const mockButton = ({ children, className, onClick, variant, ...props }: any) => (
  <button 
    className={className} 
    onClick={onClick} 
    data-testid="mocked-button"
    {...props}
  >
    {children}
  </button>
)

export const mockIcons = {
  SquareX: ({ size }: { size?: number }) => (
    <svg data-testid="square-x-icon" width={size} height={size}>
      <rect />
    </svg>
  ),
  ArchiveRestore: ({ size }: { size?: number }) => (
    <svg data-testid="archive-restore-icon" width={size} height={size}>
      <rect />
    </svg>
  ),
  ArrowLeft: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="arrow-left-icon" width={size} height={size} className={className}>
      <rect />
    </svg>
  ),
  Edit: ({ size }: { size?: number }) => (
    <svg data-testid="edit-icon" width={size} height={size}>
      <rect />
    </svg>
  )
} 
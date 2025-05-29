/* eslint-disable */
import { renderHook, act } from '@testing-library/react'
import { useFileDeleteWithModal } from '../../hooks/UseFileRemoval'

// Мокируем toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Мокируем app hooks
jest.mock('@/app/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}))

import { toast } from 'react-toastify'

describe('useFileDeleteWithModal hook', () => {
  const mockDeleteFileAction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty files array when no initial files provided', () => {
    const { result } = renderHook(() => useFileDeleteWithModal([], mockDeleteFileAction))
    
    expect(result.current.existingFiles).toEqual([])
    expect(result.current.openDeleteModal).toBe(false)
    expect(result.current.fileIndexToRemove).toBe(null)
  })

  it('should initialize with provided initial files', () => {
    const initialFiles = [
      { document: 'file1.pdf' },
      { document: 'file2.pdf' }
    ]
    
    const { result } = renderHook(() => useFileDeleteWithModal(initialFiles, mockDeleteFileAction))
    
    expect(result.current.existingFiles).toEqual(initialFiles)
  })

  it('should open delete modal when handleRemoveExistingFile is called', () => {
    const initialFiles = [
      { document: 'file1.pdf' },
      { document: 'file2.pdf' }
    ]
    
    const { result } = renderHook(() => useFileDeleteWithModal(initialFiles, mockDeleteFileAction))
    
    act(() => {
      result.current.handleRemoveExistingFile(0)
    })
    
    expect(result.current.openDeleteModal).toBe(true)
    expect(result.current.fileIndexToRemove).toBe(0)
  })

  it('should close modal when handleModalCancel is called', () => {
    const { result } = renderHook(() => useFileDeleteWithModal([], mockDeleteFileAction))
    
    // First open the modal
    act(() => {
      result.current.handleRemoveExistingFile(0)
    })
    
    expect(result.current.openDeleteModal).toBe(true)
    
    // Then cancel
    act(() => {
      result.current.handleModalCancel()
    })
    
    expect(result.current.openDeleteModal).toBe(false)
    expect(result.current.fileIndexToRemove).toBe(null)
  })

  it('should update existing files when setExistingFiles is called', () => {
    const { result } = renderHook(() => useFileDeleteWithModal([], mockDeleteFileAction))
    
    const newFiles = [{ document: 'newfile.pdf' }]
    
    act(() => {
      result.current.setExistingFiles(newFiles)
    })
    
    expect(result.current.existingFiles).toEqual(newFiles)
  })

  it('should handle multiple file operations', () => {
    const initialFiles = [
      { document: 'file1.pdf' },
      { document: 'file2.pdf' },
      { document: 'file3.pdf' }
    ]
    
    const { result } = renderHook(() => useFileDeleteWithModal(initialFiles, mockDeleteFileAction))
    
    // Remove middle file
    act(() => {
      result.current.handleRemoveExistingFile(1)
    })
    
    expect(result.current.fileIndexToRemove).toBe(1)
    expect(result.current.openDeleteModal).toBe(true)
    
    // Cancel operation
    act(() => {
      result.current.handleModalCancel()
    })
    
    expect(result.current.openDeleteModal).toBe(false)
    expect(result.current.fileIndexToRemove).toBe(null)
    
    // Files should remain unchanged
    expect(result.current.existingFiles).toEqual(initialFiles)
  })
}) 
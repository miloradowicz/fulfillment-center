/* eslint-disable */
import { copyToClipboard } from '../../utils/copyToClipboard'

// Мокируем navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
}

Object.assign(navigator, {
  clipboard: mockClipboard,
})

// Мокируем document.execCommand
Object.assign(document, {
  execCommand: jest.fn(),
})

// Мокируем toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import { toast } from 'react-toastify'

describe('copyToClipboard utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Очищаем body от элементов
    document.body.innerHTML = ''
  })

  it('should copy text to clipboard successfully using navigator.clipboard', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)

    const result = await copyToClipboard('test text')

    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text')
    expect(result).toBe('test text')
  })

  it('should fallback to execCommand when clipboard API fails', async () => {
    const error = new Error('Clipboard error')
    mockClipboard.writeText.mockRejectedValue(error)
    document.execCommand = jest.fn().mockReturnValue(true)

    const result = await copyToClipboard('test text')

    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text')
    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(result).toBe('test text')
  })

  it('should return null for empty string', async () => {
    const result = await copyToClipboard('')

    expect(mockClipboard.writeText).not.toHaveBeenCalled()
    expect(result).toBe(null)
  })

  it('should return null for null input', async () => {
    const result = await copyToClipboard(null)

    expect(mockClipboard.writeText).not.toHaveBeenCalled()
    expect(result).toBe(null)
  })

  it('should return null for undefined input', async () => {
    const result = await copyToClipboard(undefined)

    expect(mockClipboard.writeText).not.toHaveBeenCalled()
    expect(result).toBe(null)
  })

  it('should handle special characters', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    const specialText = 'Test with special chars: !@#$%^&*()'

    const result = await copyToClipboard(specialText)

    expect(mockClipboard.writeText).toHaveBeenCalledWith(specialText)
    expect(result).toBe(specialText)
  })

  it('should create and remove textarea element in fallback', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'))
    document.execCommand = jest.fn().mockReturnValue(true)

    await copyToClipboard('test text')

    // Проверяем, что textarea был создан и удален
    expect(document.body.children.length).toBe(0)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })
}) 
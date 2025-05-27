/* eslint-disable */
import { getOS } from '../../utils/getOs'

// Мокируем navigator.userAgent
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  })
}

describe('getOS utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should detect Windows OS', () => {
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    expect(getOS()).toBe('Windows')
  })

  it('should detect Mac OS', () => {
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
    expect(getOS()).toBe('Mac OS')
  })

  it('should detect Linux OS', () => {
    mockUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36')
    expect(getOS()).toBe('Linux')
  })

  it('should detect Android before Linux', () => {
    mockUserAgent('Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36')
    expect(getOS()).toBe('Android')
  })

  it('should detect iOS from iPhone without Mac OS X', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1) AppleWebKit/605.1.15')
    expect(getOS()).toBe('iOS')
  })

  it('should detect iOS from iPad without Mac OS X', () => {
    mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_7_1) AppleWebKit/605.1.15')
    expect(getOS()).toBe('iOS')
  })

  it('should detect iOS from iPod without Mac OS X', () => {
    mockUserAgent('Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_1) AppleWebKit/605.1.15')
    expect(getOS()).toBe('iOS')
  })

  it('should detect Mac OS when both Mac OS X and iPhone are present', () => {
    // В реальности iOS устройства содержат "like Mac OS X", поэтому Mac OS определяется первым
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15')
    expect(getOS()).toBe('Mac OS')
  })

  it('should detect Mac OS when both Mac OS X and iPad are present', () => {
    mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15')
    expect(getOS()).toBe('Mac OS')
  })

  it('should detect Mac OS when both Mac OS X and iPod are present', () => {
    mockUserAgent('Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15')
    expect(getOS()).toBe('Mac OS')
  })

  it('should return Unknown for unrecognized OS', () => {
    mockUserAgent('Mozilla/5.0 (Unknown OS) AppleWebKit/537.36')
    expect(getOS()).toBe('Unknown')
  })

  it('should handle empty user agent', () => {
    mockUserAgent('')
    expect(getOS()).toBe('Unknown')
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { TokenAuthGuard } from '../../src/guards/token-auth.guard'
import { TokenAuthService } from '../../src/services/token-auth.service'
import { UnauthorizedException } from '@nestjs/common'
import { createMockExecutionContext } from '../test-utils'
describe('TokenAuthGuard', () => {
  let guard: TokenAuthGuard
  let tokenAuthService: TokenAuthService
  const mockTokenAuthService = {
    getUserForToken: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenAuthGuard,
        {
          provide: TokenAuthService,
          useValue: mockTokenAuthService,
        },
      ],
    }).compile()
    guard = module.get<TokenAuthGuard>(TokenAuthGuard)
    tokenAuthService = module.get<TokenAuthService>(TokenAuthService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(guard).toBeDefined()
  })
  describe('canActivate', () => {
    it('should return true if user is found for token', async () => {
      const context = createMockExecutionContext()
      const mockUser = { id: '1', username: 'test', role: 'user' }
      mockTokenAuthService.getUserForToken.mockResolvedValue(mockUser)
      const result = await guard.canActivate(context)
      expect(result).toBe(true)
      expect(tokenAuthService.getUserForToken).toHaveBeenCalledWith(context)
    })
    it('should throw UnauthorizedException if no user found for token', async () => {
      const context = createMockExecutionContext()
      mockTokenAuthService.getUserForToken.mockResolvedValue(null)
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
      expect(tokenAuthService.getUserForToken).toHaveBeenCalledWith(context)
    })
    it('should throw UnauthorizedException if getUserForToken returns undefined', async () => {
      const context = createMockExecutionContext()
      mockTokenAuthService.getUserForToken.mockResolvedValue(undefined)
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
      expect(tokenAuthService.getUserForToken).toHaveBeenCalledWith(context)
    })
    it('should handle service errors', async () => {
      const context = createMockExecutionContext()
      mockTokenAuthService.getUserForToken.mockRejectedValue(new Error('Service error'))
      await expect(guard.canActivate(context)).rejects.toThrow('Service error')
      expect(tokenAuthService.getUserForToken).toHaveBeenCalledWith(context)
    })
  })
}) 
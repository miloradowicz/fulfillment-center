/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { TokenAuthService } from '../src/services/token-auth.service'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { User } from '../src/schemas/user.schema'
import * as jwt from 'jsonwebtoken'
import { JwtToken } from '../src/types'
import { Reflector } from '@nestjs/core'
import config from '../src/config'
jest.mock('jsonwebtoken')
describe('TokenAuthService', () => {
  let service: TokenAuthService
  let userModel: any
  let reflector: Reflector
  const mockUser = {
    _id: 'user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'manager',
    token: 'valid-token',
    password: 'hashed-password',
    isArchived: false,
  }
  type MockRequest = {
    cookies: { token?: string }
    user: any
  }
  const mockContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        cookies: {
          token: 'valid-token',
        },
        user: undefined,
      } as MockRequest),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext
  beforeEach(async () => {
    jest.clearAllMocks()
    const mockUserModel = {
      findById: jest.fn(),
    }
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenAuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile()
    service = module.get<TokenAuthService>(TokenAuthService)
    userModel = module.get<any>(getModelToken(User.name))
    reflector = module.get<Reflector>(Reflector)
    ;(jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (token === 'valid-token') {
        return { id: 'user-id' } as JwtToken
      }
      if (token === 'invalid-token') {
        throw new Error('Invalid token')
      }
      return null
    })
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('getUserForToken', () => {
    it('should return true for a public endpoint without a token', async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(true)
      const mockGetRequest = mockContext.switchToHttp().getRequest as jest.Mock
      mockGetRequest.mockReturnValue({
        cookies: {},
        user: undefined,
      } as MockRequest)
      const result = await service.getUserForToken(mockContext)
      expect(result).toBe(true)
      expect(userModel.findById).not.toHaveBeenCalled()
    })
    it('should return true for a public endpoint with an invalid token', async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(true)
      const mockGetRequest = mockContext.switchToHttp().getRequest as jest.Mock
      mockGetRequest.mockReturnValue({
        cookies: { token: 'invalid-token' },
        user: undefined,
      } as MockRequest)
      const result = await service.getUserForToken(mockContext)
      expect(result).toBe(true)
      expect(userModel.findById).not.toHaveBeenCalled()
    })
    it('should return true and set user in request when token is valid', async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(false)
      const requestMock = {
        cookies: { token: 'valid-token' },
        user: undefined,
      } as MockRequest
      const mockGetRequest = mockContext.switchToHttp().getRequest as jest.Mock
      mockGetRequest.mockReturnValue(requestMock)
      userModel.findById.mockResolvedValue({ ...mockUser, token: 'valid-token' })
      const result = await service.getUserForToken(mockContext)
      expect(result).toBe(true)
      expect(userModel.findById).toHaveBeenCalledWith('user-id')
      expect(requestMock.user).toEqual({ ...mockUser, token: 'valid-token' })
    })
    it('should throw UnauthorizedException when token is valid but user is not found', async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(false)
      const mockGetRequest = mockContext.switchToHttp().getRequest as jest.Mock
      mockGetRequest.mockReturnValue({
        cookies: { token: 'valid-token' },
        user: undefined,
      } as MockRequest)
      userModel.findById.mockResolvedValue(null)
      await expect(service.getUserForToken(mockContext)).rejects.toThrow(UnauthorizedException)
      expect(userModel.findById).toHaveBeenCalledWith('user-id')
    })
    it("should throw UnauthorizedException when token in db doesn't match token in request", async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(false)
      const mockGetRequest = mockContext.switchToHttp().getRequest as jest.Mock
      mockGetRequest.mockReturnValue({
        cookies: { token: 'valid-token' },
        user: undefined,
      } as MockRequest)
      userModel.findById.mockResolvedValue({ ...mockUser, token: 'other-token' })
      await expect(service.getUserForToken(mockContext)).rejects.toThrow(UnauthorizedException)
      expect(userModel.findById).toHaveBeenCalledWith('user-id')
    })
    it('should return true for non-authenticated endpoints when authentication is not mandatory', async () => {
      const originalMandatoryAuthentication = config.mandatoryAuthentication
      Object.defineProperty(config, 'mandatoryAuthentication', {
        value: false,
        writable: true,
      })
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(false)
      const mockGetRequest = mockContext.switchToHttp().getRequest as jest.Mock
      mockGetRequest.mockReturnValue({
        cookies: {},
        user: undefined,
      } as MockRequest)
      const result = await service.getUserForToken(mockContext)
      expect(result).toBe(true)
      expect(userModel.findById).not.toHaveBeenCalled()
      Object.defineProperty(config, 'mandatoryAuthentication', {
        value: originalMandatoryAuthentication,
        writable: true,
      })
    })
    it('should throw UnauthorizedException when token verification fails for non-public endpoint', async () => {
      ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(false)
      const mockGetRequest = mockContext.switchToHttp().getRequest as jest.Mock
      mockGetRequest.mockReturnValue({
        cookies: { token: 'invalid-token' },
        user: undefined,
      } as MockRequest)
      await expect(service.getUserForToken(mockContext)).rejects.toThrow(UnauthorizedException)
      expect(userModel.findById).not.toHaveBeenCalled()
    })
  })
})

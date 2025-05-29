/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { RolesGuard } from '../../src/guards/roles.guard'
import { RolesService } from '../../src/services/roles.service'
import { Reflector } from '@nestjs/core'
import { ExecutionContext } from '@nestjs/common'
import { createMockExecutionContext } from '../test-utils'
describe('RolesGuard', () => {
  let guard: RolesGuard
  let rolesService: RolesService
  let reflector: Reflector
  const mockRolesService = {
    checkAuthorization: jest.fn(),
  }
  const mockReflector = {
    getAllAndOverride: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile()
    guard = module.get<RolesGuard>(RolesGuard)
    rolesService = module.get<RolesService>(RolesService)
    reflector = module.get<Reflector>(Reflector)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(guard).toBeDefined()
  })
  describe('canActivate', () => {
    it('should call rolesService.checkAuthorization and return true', () => {
      const context = createMockExecutionContext({ id: '1', role: 'admin' })
      mockRolesService.checkAuthorization.mockReturnValue(true)
      const result = guard.canActivate(context)
      expect(result).toBe(true)
      expect(rolesService.checkAuthorization).toHaveBeenCalledWith(context)
    })
    it('should call rolesService.checkAuthorization and return false', () => {
      const context = createMockExecutionContext({ id: '1', role: 'user' })
      mockRolesService.checkAuthorization.mockReturnValue(false)
      const result = guard.canActivate(context)
      expect(result).toBe(false)
      expect(rolesService.checkAuthorization).toHaveBeenCalledWith(context)
    })
    it('should handle context without user', () => {
      const context = createMockExecutionContext()
      mockRolesService.checkAuthorization.mockReturnValue(false)
      const result = guard.canActivate(context)
      expect(result).toBe(false)
      expect(rolesService.checkAuthorization).toHaveBeenCalledWith(context)
    })
  })
}) 
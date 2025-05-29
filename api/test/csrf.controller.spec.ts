/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { CsrfController } from '../src/controllers/csrf.controller'
import { Request, Response } from 'express'
describe('CsrfController', () => {
  let controller: CsrfController
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsrfController],
    }).compile()
    controller = module.get<CsrfController>(CsrfController)
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('getCsrfToken', () => {
    it('should return CSRF token and set cookie', () => {
      const mockCsrfToken = 'mock-csrf-token-123'
      const mockRequest = {
        csrfToken: jest.fn().mockReturnValue(mockCsrfToken),
      } as unknown as Request
      const mockResponse = {
        cookie: jest.fn(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response
      controller.getCsrfToken(mockRequest, mockResponse)
      expect(mockRequest.csrfToken).toHaveBeenCalled()
      expect(mockResponse.cookie).toHaveBeenCalledWith('XSRF-TOKEN', mockCsrfToken)
      expect(mockResponse.json).toHaveBeenCalledWith({ csrfToken: mockCsrfToken })
    })
    it('should handle different CSRF tokens', () => {
      const testTokens = ['token1', 'token2', 'very-long-csrf-token-with-special-chars-123']
      testTokens.forEach(token => {
        const mockRequest = {
          csrfToken: jest.fn().mockReturnValue(token),
        } as unknown as Request
        const mockResponse = {
          cookie: jest.fn(),
          json: jest.fn().mockReturnThis(),
        } as unknown as Response
        controller.getCsrfToken(mockRequest, mockResponse)
        expect(mockRequest.csrfToken).toHaveBeenCalled()
        expect(mockResponse.cookie).toHaveBeenCalledWith('XSRF-TOKEN', token)
        expect(mockResponse.json).toHaveBeenCalledWith({ csrfToken: token })
      })
    })
  })
}) 
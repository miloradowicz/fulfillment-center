/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { ReportsController } from '../src/controllers/reports.controller'
import { ReportService } from '../src/services/report.service'
describe('ReportsController', () => {
  let controller: ReportsController
  let reportService: ReportService
  const mockReportService = {
    getReportTaskForPeriod: jest.fn(),
    getReportClientForPeriod: jest.fn(),
  }
  const mockRolesService = {
    hasRole: jest.fn().mockReturnValue(true),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportService,
          useValue: mockReportService,
        },
        {
          provide: 'RolesService',
          useValue: mockRolesService,
        },
      ],
    })
      .overrideGuard(require('../src/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()
    controller = module.get<ReportsController>(ReportsController)
    reportService = module.get<ReportService>(ReportService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('getReport', () => {
    it('should get tasks report for period', async () => {
      const mockReport = { tasks: [], totalCount: 0 }
      jest.spyOn(mockReportService, 'getReportTaskForPeriod').mockResolvedValue(mockReport)
      const result = await controller.getReport('tasks', '2023-01-01', '2023-01-31')
      expect(result).toEqual(mockReport)
      expect(mockReportService.getReportTaskForPeriod).toHaveBeenCalledWith(
        new Date('2023-01-01'),
        new Date('2023-01-31')
      )
    })
    it('should get clients report for period', async () => {
      const mockReport = { clients: [], totalRevenue: 0 }
      jest.spyOn(mockReportService, 'getReportClientForPeriod').mockResolvedValue(mockReport)
      const result = await controller.getReport('clients', '2023-01-01', '2023-01-31')
      expect(result).toEqual(mockReport)
      expect(mockReportService.getReportClientForPeriod).toHaveBeenCalledWith(
        new Date('2023-01-01'),
        new Date('2023-01-31')
      )
    })
    it('should throw error for invalid date format', async () => {
      await expect(controller.getReport('tasks', 'invalid-date', '2023-01-31')).rejects.toThrow('Invalid date format')
    })
    it('should throw error for invalid tab value', async () => {
      await expect(controller.getReport('invalid-tab', '2023-01-01', '2023-01-31')).rejects.toThrow('Invalid tab value')
    })
  })
}) 
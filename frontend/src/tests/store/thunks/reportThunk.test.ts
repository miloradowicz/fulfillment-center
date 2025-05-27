/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import { fetchTaskReport, fetchClientReport } from '../../../store/thunks/reportThunk'
import { ReportTaskResponse, ReportClientResponse } from '../../../types'
import axiosAPI from '../../../utils/axiosAPI'

// Мокаем axiosAPI
jest.mock('../../../utils/axiosAPI', () => ({
  default: {
    get: jest.fn()
  }
}))

const mockedAxiosAPI = axiosAPI as jest.Mocked<typeof axiosAPI>

describe('reportThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('fetchTaskReport', () => {
    it('should successfully fetch task report', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'
      
      const mockTaskReport: ReportTaskResponse = {
        userTaskReports: [
          {
            user: {
              _id: 'user-1',
              displayName: 'Иван Петров',
              isArchived: false
            },
            tasks: [
              {
                _id: 'task-1',
                taskNumber: 'T-001',
                isArchived: false
              },
              {
                _id: 'task-2',
                taskNumber: 'T-002',
                isArchived: false
              }
            ],
            taskCount: 2
          },
          {
            user: {
              _id: 'user-2',
              displayName: 'Мария Сидорова',
              isArchived: false
            },
            tasks: [
              {
                _id: 'task-3',
                taskNumber: 'T-003',
                isArchived: false
              }
            ],
            taskCount: 1
          }
        ],
        dailyTaskCounts: [
          {
            date: '2023-01-01',
            taskCount: 5
          },
          {
            date: '2023-01-02',
            taskCount: 3
          },
          {
            date: '2023-01-03',
            taskCount: 7
          }
        ]
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: mockTaskReport })

      const result = await store.dispatch(fetchTaskReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchTaskReport/fulfilled')
      expect(result.payload).toEqual(mockTaskReport)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(
        `/reports?tab=tasks&startDate=${startDate}&endDate=${endDate}`
      )
      expect(mockedAxiosAPI.get).toHaveBeenCalledTimes(1)
    })

    it('should handle task report fetch error', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'
      const error = new Error('Server error')

      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchTaskReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchTaskReport/rejected')
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(
        `/reports?tab=tasks&startDate=${startDate}&endDate=${endDate}`
      )
    })

    it('should handle empty task report', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-01-01'
      
      const emptyTaskReport: ReportTaskResponse = {
        userTaskReports: [],
        dailyTaskCounts: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyTaskReport })

      const result = await store.dispatch(fetchTaskReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchTaskReport/fulfilled')
      expect(result.payload).toEqual(emptyTaskReport)
      expect(result.payload.userTaskReports).toHaveLength(0)
      expect(result.payload.dailyTaskCounts).toHaveLength(0)
    })

    it('should handle different date formats', async () => {
      const testCases = [
        { startDate: '2023-01-01', endDate: '2023-01-31' },
        { startDate: '2023-12-01', endDate: '2023-12-31' },
        { startDate: '2023-06-15', endDate: '2023-06-15' }, // single day
        { startDate: '2022-01-01', endDate: '2024-12-31' }  // long period
      ]

      const mockReport: ReportTaskResponse = {
        userTaskReports: [],
        dailyTaskCounts: []
      }

      for (const { startDate, endDate } of testCases) {
        mockedAxiosAPI.get.mockClear()
        mockedAxiosAPI.get.mockResolvedValueOnce({ data: mockReport })

        const result = await store.dispatch(fetchTaskReport({ startDate, endDate }))

        expect(result.type).toBe('reports/fetchTaskReport/fulfilled')
        expect(mockedAxiosAPI.get).toHaveBeenCalledWith(
          `/reports?tab=tasks&startDate=${startDate}&endDate=${endDate}`
        )
      }
    })
  })

  describe('fetchClientReport', () => {
    it('should successfully fetch client report', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'
      
      const mockClientReport: ReportClientResponse = {
        clientReport: [
          {
            client: {
              _id: 'client-1',
              name: 'ООО "Рога и копыта"',
              isArchived: false
            },
            orders: [
              {
                _id: 'order-1',
                orderNumber: 'ORD-001',
                status: 'доставлен',
                isArchived: false
              },
              {
                _id: 'order-2',
                orderNumber: 'ORD-002',
                status: 'в пути',
                isArchived: false
              }
            ],
            arrivals: [
              {
                _id: 'arrival-1',
                arrivalNumber: 'ARR-001',
                arrival_status: 'получена',
                isArchived: false
              }
            ],
            invoices: [
              {
                _id: 'invoice-1',
                invoiceNumber: 'INV-001',
                status: 'оплачено',
                totalAmount: 50000,
                paidAmount: 50000,
                isArchived: false
              },
              {
                _id: 'invoice-2',
                invoiceNumber: 'INV-002',
                status: 'частично оплачено',
                totalAmount: 30000,
                paidAmount: 15000,
                isArchived: false
              }
            ]
          },
          {
            client: {
              _id: 'client-2',
              name: 'ИП Иванов',
              isArchived: false
            },
            orders: [],
            arrivals: [],
            invoices: []
          }
        ]
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: mockClientReport })

      const result = await store.dispatch(fetchClientReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchClientReport/fulfilled')
      expect(result.payload).toEqual(mockClientReport)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(
        `/reports?tab=clients&startDate=${startDate}&endDate=${endDate}`
      )
      expect(mockedAxiosAPI.get).toHaveBeenCalledTimes(1)
    })

    it('should handle client report fetch error', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'
      const error = new Error('Network error')

      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchClientReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchClientReport/rejected')
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(
        `/reports?tab=clients&startDate=${startDate}&endDate=${endDate}`
      )
    })

    it('should handle empty client report', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-01-01'
      
      const emptyClientReport: ReportClientResponse = {
        clientReport: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyClientReport })

      const result = await store.dispatch(fetchClientReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchClientReport/fulfilled')
      expect(result.payload).toEqual(emptyClientReport)
      expect(result.payload.clientReport).toHaveLength(0)
    })

    it('should handle client report with archived items', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'
      
      const reportWithArchived: ReportClientResponse = {
        clientReport: [
          {
            client: {
              _id: 'client-archived',
              name: 'Архивный клиент',
              isArchived: true
            },
            orders: [
              {
                _id: 'order-archived',
                orderNumber: 'ORD-ARCH-001',
                status: 'доставлен',
                isArchived: true
              }
            ],
            arrivals: [
              {
                _id: 'arrival-archived',
                arrivalNumber: 'ARR-ARCH-001',
                arrival_status: 'получена',
                isArchived: true
              }
            ],
            invoices: [
              {
                _id: 'invoice-archived',
                invoiceNumber: 'INV-ARCH-001',
                status: 'оплачено',
                totalAmount: 25000,
                paidAmount: 25000,
                isArchived: true
              }
            ]
          }
        ]
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: reportWithArchived })

      const result = await store.dispatch(fetchClientReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchClientReport/fulfilled')
      expect(result.payload).toEqual(reportWithArchived)
      expect(result.payload.clientReport[0].client.isArchived).toBe(true)
      expect(result.payload.clientReport[0].orders[0].isArchived).toBe(true)
      expect(result.payload.clientReport[0].arrivals[0].isArchived).toBe(true)
      expect(result.payload.clientReport[0].invoices[0].isArchived).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in dates', async () => {
      const startDate = '2023-01-01T00:00:00Z'
      const endDate = '2023-12-31T23:59:59Z'
      
      const mockReport: ReportTaskResponse = {
        userTaskReports: [],
        dailyTaskCounts: []
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: mockReport })

      const result = await store.dispatch(fetchTaskReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchTaskReport/fulfilled')
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(
        `/reports?tab=tasks&startDate=${startDate}&endDate=${endDate}`
      )
    })

    it('should handle concurrent report requests', async () => {
      const params1 = { startDate: '2023-01-01', endDate: '2023-06-30' }
      const params2 = { startDate: '2023-07-01', endDate: '2023-12-31' }
      
      const mockTaskReport: ReportTaskResponse = {
        userTaskReports: [],
        dailyTaskCounts: []
      }
      
      const mockClientReport: ReportClientResponse = {
        clientReport: []
      }

      mockedAxiosAPI.get
        .mockResolvedValueOnce({ data: mockTaskReport })
        .mockResolvedValueOnce({ data: mockClientReport })

      const [taskResult, clientResult] = await Promise.all([
        store.dispatch(fetchTaskReport(params1)),
        store.dispatch(fetchClientReport(params2))
      ])

      expect(taskResult.type).toBe('reports/fetchTaskReport/fulfilled')
      expect(clientResult.type).toBe('reports/fetchClientReport/fulfilled')
      expect(mockedAxiosAPI.get).toHaveBeenCalledTimes(2)
    })

    it('should handle malformed response data', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'

      // Ответ с неправильной структурой
      const malformedResponse = {
        wrongField: 'wrongValue'
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: malformedResponse })

      const result = await store.dispatch(fetchTaskReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchTaskReport/fulfilled')
      expect(result.payload).toEqual(malformedResponse)
    })

    it('should handle null response data', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: null })

      const result = await store.dispatch(fetchClientReport({ startDate, endDate }))

      expect(result.type).toBe('reports/fetchClientReport/fulfilled')
      expect(result.payload).toBeNull()
    })
  })
}) 
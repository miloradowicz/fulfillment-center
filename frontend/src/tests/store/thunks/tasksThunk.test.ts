/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit'
import {
  fetchTasks,
  fetchArchivedTasks,
  fetchTasksWithPopulate,
  fetchTasksByUserId,
  fetchTasksByUserIdWithPopulate,
  fetchTaskById,
  addTask,
  deleteTask,
  archiveTask,
  unarchiveTask,
  updateTask,
  updateTaskStatus
} from '../../../store/thunks/tasksThunk'
import {
  Task,
  TaskMutation,
  TaskWithPopulate,
  ValidationError,
  GlobalError
} from '../../../types'
import { isAxiosError } from 'axios'
import axiosAPI from '../../../utils/axiosAPI'

// Мокаем axiosAPI
jest.mock('../../../utils/axiosAPI', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

// Мокаем isAxiosError
jest.mock('axios', () => ({
  isAxiosError: jest.fn()
}))

const mockedAxiosAPI = axiosAPI as jest.Mocked<typeof axiosAPI>
const mockedIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>

describe('tasksThunk', () => {
  let store: any

  beforeEach(() => {
    store = configureStore({
      reducer: {
        test: (state = {}, action) => state
      }
    })
    jest.clearAllMocks()
  })

  describe('fetchTasks', () => {
    it('should successfully fetch tasks', async () => {
      const tasks: Task[] = [
        {
          _id: 'task-1',
          taskNumber: 'T-001',
          title: 'Тестовая задача 1',
          type: 'обработка',
          description: 'Описание задачи 1',
          status: 'в работе',
          user: 'user-1'
        },
        {
          _id: 'task-2',
          taskNumber: 'T-002',
          title: 'Тестовая задача 2',
          type: 'доставка',
          description: 'Описание задачи 2',
          status: 'завершена',
          user: 'user-2'
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: tasks })

      const result = await store.dispatch(fetchTasks())

      expect(result.type).toBe('tasks/fetchTasks/fulfilled')
      expect(result.payload).toEqual(tasks)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/tasks')
    })

    it('should handle fetch tasks error', async () => {
      const error = new Error('Network error')
      mockedAxiosAPI.get.mockRejectedValueOnce(error)

      const result = await store.dispatch(fetchTasks())

      expect(result.type).toBe('tasks/fetchTasks/rejected')
    })
  })

  describe('fetchArchivedTasks', () => {
    it('should successfully fetch archived tasks with populate', async () => {
      const archivedTasks: TaskWithPopulate[] = [
        {
          _id: 'task-archived-1',
          taskNumber: 'T-ARCH-001',
          title: 'Архивная задача',
          type: 'обработка',
          description: 'Описание архивной задачи',
          status: 'завершена',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          date_inProgress: '2023-01-01T10:00:00Z',
          date_Done: '2023-01-02T15:00:00Z',
          date_ToDO: '2023-01-01T09:00:00Z',
          user: {
            _id: 'user-1',
            displayName: 'Иван Петров',
            email: 'ivan@example.com',
            role: 'manager'
          }
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: archivedTasks })

      const result = await store.dispatch(fetchArchivedTasks())

      expect(result.type).toBe('tasks/fetchArchivedTasks/fulfilled')
      expect(result.payload).toEqual(archivedTasks)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/tasks/archived/all?populate=1')
    })
  })

  describe('fetchTasksWithPopulate', () => {
    it('should successfully fetch tasks with populate', async () => {
      const tasksWithPopulate: TaskWithPopulate[] = [
        {
          _id: 'task-1',
          taskNumber: 'T-001',
          title: 'Задача с пользователем',
          type: 'доставка',
          description: 'Описание задачи с пользователем',
          status: 'в работе',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T12:00:00Z',
          date_inProgress: '2023-01-01T10:00:00Z',
          date_Done: null,
          date_ToDO: '2023-01-01T09:00:00Z',
          user: {
            _id: 'user-1',
            displayName: 'Мария Сидорова',
            email: 'maria@example.com',
            role: 'stock-worker'
          }
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: tasksWithPopulate })

      const result = await store.dispatch(fetchTasksWithPopulate())

      expect(result.type).toBe('tasks/fetchTasksWithPopulate/fulfilled')
      expect(result.payload).toEqual(tasksWithPopulate)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith('/tasks?populate=1')
    })
  })

  describe('fetchTasksByUserId', () => {
    it('should successfully fetch tasks by user id', async () => {
      const userId = 'user-123'
      const userTasks: Task[] = [
        {
          _id: 'task-1',
          taskNumber: 'T-001',
          title: 'Задача пользователя',
          type: 'обработка',
          description: 'Описание задачи пользователя',
          status: 'в работе',
          user: userId
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: userTasks })

      const result = await store.dispatch(fetchTasksByUserId(userId))

      expect(result.type).toBe('arrivals/fetchTasksByUserId/fulfilled')
      expect(result.payload).toEqual(userTasks)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/tasks?user=${userId}`)
    })
  })

  describe('fetchTasksByUserIdWithPopulate', () => {
    it('should successfully fetch tasks by user id with populate', async () => {
      const userId = 'user-123'
      const userTasksWithPopulate: TaskWithPopulate[] = [
        {
          _id: 'task-1',
          taskNumber: 'T-001',
          title: 'Задача пользователя с populate',
          type: 'доставка',
          description: 'Описание задачи пользователя с populate',
          status: 'в работе',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T12:00:00Z',
          date_inProgress: '2023-01-01T10:00:00Z',
          date_Done: null,
          date_ToDO: '2023-01-01T09:00:00Z',
          user: {
            _id: userId,
            displayName: 'Алексей Иванов',
            email: 'alexey@example.com',
            role: 'manager'
          }
        }
      ]

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: userTasksWithPopulate })

      const result = await store.dispatch(fetchTasksByUserIdWithPopulate(userId))

      expect(result.type).toBe('arrivals/fetchTasksByUserIdWithPopulate/fulfilled')
      expect(result.payload).toEqual(userTasksWithPopulate)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/tasks?user=${userId}&populate=1`)
    })
  })

  describe('fetchTaskById', () => {
    it('should successfully fetch task by id', async () => {
      const taskId = 'task-123'
      const task: TaskWithPopulate = {
        _id: taskId,
        taskNumber: 'T-123',
        title: 'Конкретная задача',
        type: 'обработка',
        description: 'Описание конкретной задачи',
        status: 'в работе',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T12:00:00Z',
        date_inProgress: '2023-01-01T10:00:00Z',
        date_Done: null,
        date_ToDO: '2023-01-01T09:00:00Z',
        user: {
          _id: 'user-1',
          displayName: 'Петр Петров',
          email: 'petr@example.com',
          role: 'admin'
        }
      }

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: task })

      const result = await store.dispatch(fetchTaskById(taskId))

      expect(result.type).toBe('tasks/fetchTaskById/fulfilled')
      expect(result.payload).toEqual(task)
      expect(mockedAxiosAPI.get).toHaveBeenCalledWith(`/tasks/${taskId}`)
    })
  })

  describe('addTask', () => {
    it('should successfully add task', async () => {
      const taskData: TaskMutation = {
        title: 'Новая задача',
        type: 'обработка',
        description: 'Описание новой задачи',
        user: 'user-123'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})

      const result = await store.dispatch(addTask(taskData))

      expect(result.type).toBe('tasks/addTask/fulfilled')
      expect(mockedAxiosAPI.post).toHaveBeenCalledWith('/tasks', taskData)
    })

    it('should handle validation error (400 status)', async () => {
      const taskData: TaskMutation = {
        title: '',
        type: 'обработка',
        description: '',
        user: ''
      }

      const validationError: ValidationError = {
        type: 'ValidationError',
        errors: {
          taskNumber: {
            name: 'taskNumber',
            messages: ['Номер задачи обязателен']
          },
          description: {
            name: 'description',
            messages: ['Описание обязательно']
          }
        }
      }

      const axiosError = {
        response: {
          status: 400,
          data: validationError
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addTask(taskData))

      expect(result.type).toBe('tasks/addTask/rejected')
      expect(result.payload).toEqual(validationError)
    })

    it('should throw error for non-400 status', async () => {
      const taskData: TaskMutation = {
        title: 'Тест',
        type: 'обработка',
        description: 'Описание теста',
        user: 'user-123'
      }

      const axiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxiosAPI.post.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(addTask(taskData))

      expect(result.type).toBe('tasks/addTask/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('deleteTask', () => {
    it('should successfully delete task', async () => {
      const taskId = 'task-123'

      mockedAxiosAPI.delete.mockResolvedValueOnce({})

      const result = await store.dispatch(deleteTask(taskId))

      expect(result.type).toBe('tasks/deleteTask/fulfilled')
      expect(mockedAxiosAPI.delete).toHaveBeenCalledWith(`/tasks/${taskId}`)
    })

    it('should handle delete error (non-401)', async () => {
      const taskId = 'task-123'
      const errorData: GlobalError = { message: 'Нельзя удалить задачу в работе' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteTask(taskId))

      expect(result.type).toBe('tasks/deleteTask/rejected')
      expect(result.payload).toEqual(errorData)
    })

    it('should throw error for 401 status', async () => {
      const taskId = 'task-123'

      const axiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      mockedAxiosAPI.delete.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(deleteTask(taskId))

      expect(result.type).toBe('tasks/deleteTask/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })
  })

  describe('archiveTask', () => {
    it('should successfully archive task', async () => {
      const taskId = 'task-123'
      const responseData = { id: taskId }

      mockedAxiosAPI.patch.mockResolvedValueOnce({ data: responseData })

      const result = await store.dispatch(archiveTask(taskId))

      expect(result.type).toBe('tasks/archiveTask/fulfilled')
      expect(result.payload).toEqual(responseData)
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/tasks/${taskId}/archive`)
    })

    it('should handle archive task error', async () => {
      const taskId = 'task-123'
      const error = new Error('Archive error')

      mockedAxiosAPI.patch.mockRejectedValueOnce(error)

      const result = await store.dispatch(archiveTask(taskId))

      expect(result.type).toBe('tasks/archiveTask/rejected')
    })
  })

  describe('unarchiveTask', () => {
    it('should successfully unarchive task', async () => {
      const taskId = 'task-123'

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(unarchiveTask(taskId))

      expect(result.type).toBe('tasks/unarchiveTask/fulfilled')
      expect(result.payload).toEqual({ id: taskId })
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/tasks/${taskId}/unarchive`)
    })

    it('should handle unarchive error (non-401)', async () => {
      const taskId = 'task-123'
      const errorData: GlobalError = { message: 'Задача не найдена' }

      const axiosError = {
        response: {
          status: 404,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(unarchiveTask(taskId))

      expect(result.type).toBe('tasks/unarchiveTask/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('updateTask', () => {
    it('should successfully update task', async () => {
      const taskId = 'task-123'
      const updateData: TaskMutation = {
        title: 'Обновленная задача',
        type: 'доставка',
        description: 'Описание обновленной задачи',
        user: 'user-456'
      }

      mockedAxiosAPI.put.mockResolvedValueOnce({})

      const result = await store.dispatch(updateTask({ taskId, data: updateData }))

      expect(result.type).toBe('tasks/updateTask/fulfilled')
      expect(mockedAxiosAPI.put).toHaveBeenCalledWith(`/tasks/${taskId}`, updateData)
    })

    it('should handle update error (non-401)', async () => {
      const taskId = 'task-123'
      const updateData: TaskMutation = {
        title: 'Тест',
        type: 'обработка',
        description: 'Описание теста',
        user: 'user-123'
      }

      const errorData: GlobalError = { message: 'Ошибка обновления задачи' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.put.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateTask({ taskId, data: updateData }))

      expect(result.type).toBe('tasks/updateTask/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('updateTaskStatus', () => {
    it('should successfully update task status', async () => {
      const taskId = 'task-123'
      const statusData: TaskMutation = {
        title: 'Задача',
        type: 'обработка',
        description: 'Описание',
        user: 'user-123'
      }

      mockedAxiosAPI.patch.mockResolvedValueOnce({})

      const result = await store.dispatch(updateTaskStatus({ taskId, data: statusData }))

      expect(result.type).toBe('tasks/updateTaskStatus/fulfilled')
      expect(mockedAxiosAPI.patch).toHaveBeenCalledWith(`/tasks/${taskId}/status`, statusData)
    })

    it('should handle update status error (non-401)', async () => {
      const taskId = 'task-123'
      const statusData: TaskMutation = {
        title: 'Задача с ошибкой',
        type: 'обработка',
        description: 'Описание',
        user: 'user-123'
      }

      const errorData: GlobalError = { message: 'Неверный статус задачи' }

      const axiosError = {
        response: {
          status: 400,
          data: errorData
        }
      }

      mockedAxiosAPI.patch.mockRejectedValueOnce(axiosError)
      mockedIsAxiosError.mockReturnValueOnce(true)

      const result = await store.dispatch(updateTaskStatus({ taskId, data: statusData }))

      expect(result.type).toBe('tasks/updateTaskStatus/rejected')
      expect(result.payload).toEqual(errorData)
    })
  })

  describe('edge cases', () => {
    it('should handle empty tasks list', async () => {
      const emptyTasks: Task[] = []

      mockedAxiosAPI.get.mockResolvedValueOnce({ data: emptyTasks })

      const result = await store.dispatch(fetchTasks())

      expect(result.type).toBe('tasks/fetchTasks/fulfilled')
      expect(result.payload).toEqual(emptyTasks)
      expect(result.payload).toHaveLength(0)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      
      mockedAxiosAPI.get.mockRejectedValueOnce(networkError)
      mockedIsAxiosError.mockReturnValueOnce(false)

      const result = await store.dispatch(fetchTasks())

      expect(result.type).toBe('tasks/fetchTasks/rejected')
      expect(result.meta.rejectedWithValue).toBe(false)
    })

    it('should handle concurrent task operations', async () => {
      const taskData: TaskMutation = {
        title: 'Concurrent task',
        type: 'обработка',
        description: 'Описание concurrent task',
        user: 'user-123'
      }

      mockedAxiosAPI.post.mockResolvedValueOnce({})
      mockedAxiosAPI.get.mockResolvedValueOnce({ data: [] })

      const [addResult, fetchResult] = await Promise.all([
        store.dispatch(addTask(taskData)),
        store.dispatch(fetchTasks())
      ])

      expect(addResult.type).toBe('tasks/addTask/fulfilled')
      expect(fetchResult.type).toBe('tasks/fetchTasks/fulfilled')
    })
  })
}) 
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing'
import { TasksController } from '../../src/controllers/tasks.controller'
import { TasksService } from '../../src/services/tasks.service'
import { CreateTaskDto } from '../../src/dto/create-task.dto'
import { UpdateTaskDto } from '../../src/dto/update-task.dto'
import { UpdateTaskStatusDto } from '../../src/dto/update-taskstatus.dto'
import { RequestWithUser } from '../../src/types'
import mongoose from 'mongoose'
describe('TasksController', () => {
  let controller: TasksController
  let tasksService: TasksService
  const mockUserId = new mongoose.Types.ObjectId('000000000000000000000001')
  const mockUser = {
    _id: mockUserId,
    name: 'Test User',
    role: 'admin',
  }
  const mockTask = {
    _id: 'task-id-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    isArchived: false,
  }
  const mockTasksService = {
    getAll: jest.fn(),
    getAllByUser: jest.fn(),
    getAllArchived: jest.fn(),
    getById: jest.fn(),
    getArchivedById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    delete: jest.fn(),
  }
  const mockRolesService = {
    hasRole: jest.fn().mockReturnValue(true),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: 'RolesService',
          useValue: mockRolesService,
        },
      ],
    })
      .overrideGuard(require('../../src/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()
    controller = module.get<TasksController>(TasksController)
    tasksService = module.get<TasksService>(TasksService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('getAllTasks', () => {
    it('should get all tasks without user filter', async () => {
      const tasks = [mockTask]
      jest.spyOn(mockTasksService, 'getAll').mockResolvedValue(tasks)
      const result = await controller.getAllTasks('', undefined)
      expect(result).toEqual(tasks)
      expect(mockTasksService.getAll).toHaveBeenCalledWith(false)
    })
    it('should get all tasks with populate', async () => {
      const tasks = [mockTask]
      jest.spyOn(mockTasksService, 'getAll').mockResolvedValue(tasks)
      const result = await controller.getAllTasks('', '1')
      expect(result).toEqual(tasks)
      expect(mockTasksService.getAll).toHaveBeenCalledWith(true)
    })
    it('should get tasks by user', async () => {
      const userId = 'user-id-1'
      const tasks = [mockTask]
      jest.spyOn(mockTasksService, 'getAllByUser').mockResolvedValue(tasks)
      const result = await controller.getAllTasks(userId, undefined)
      expect(result).toEqual(tasks)
      expect(mockTasksService.getAllByUser).toHaveBeenCalledWith(userId, false)
    })
    it('should get tasks by user with populate', async () => {
      const userId = 'user-id-1'
      const tasks = [mockTask]
      jest.spyOn(mockTasksService, 'getAllByUser').mockResolvedValue(tasks)
      const result = await controller.getAllTasks(userId, '1')
      expect(result).toEqual(tasks)
      expect(mockTasksService.getAllByUser).toHaveBeenCalledWith(userId, true)
    })
  })
  describe('getAllArchivedTasks', () => {
    it('should get all archived tasks', async () => {
      const archivedTasks = [{ ...mockTask, isArchived: true }]
      jest.spyOn(mockTasksService, 'getAllArchived').mockResolvedValue(archivedTasks)
      const result = await controller.getAllArchivedTasks(undefined)
      expect(result).toEqual(archivedTasks)
      expect(mockTasksService.getAllArchived).toHaveBeenCalledWith(false)
    })
    it('should get all archived tasks with populate', async () => {
      const archivedTasks = [{ ...mockTask, isArchived: true }]
      jest.spyOn(mockTasksService, 'getAllArchived').mockResolvedValue(archivedTasks)
      const result = await controller.getAllArchivedTasks('1')
      expect(result).toEqual(archivedTasks)
      expect(mockTasksService.getAllArchived).toHaveBeenCalledWith(true)
    })
  })
  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      jest.spyOn(mockTasksService, 'getById').mockResolvedValue(mockTask)
      const result = await controller.getTaskById('task-id-1')
      expect(result).toEqual(mockTask)
      expect(mockTasksService.getById).toHaveBeenCalledWith('task-id-1')
    })
  })
  describe('getArchivedTaskById', () => {
    it('should get an archived task by id', async () => {
      const archivedTask = { ...mockTask, isArchived: true }
      jest.spyOn(mockTasksService, 'getArchivedById').mockResolvedValue(archivedTask)
      const result = await controller.getArchivedTaskById('task-id-1')
      expect(result).toEqual(archivedTask)
      expect(mockTasksService.getArchivedById).toHaveBeenCalledWith('task-id-1')
    })
  })
  describe('createTask', () => {
    it('should create a task', async () => {
      const createDto: CreateTaskDto = {
        user: new mongoose.Types.ObjectId(),
        title: 'New Task',
        description: 'New Description',
        status: 'к выполнению',
        type: 'другое',
      }
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      jest.spyOn(mockTasksService, 'create').mockResolvedValue(mockTask)
      const result = await controller.createTask(createDto, mockRequest)
      expect(result).toEqual(mockTask)
      expect(mockTasksService.create).toHaveBeenCalledWith(createDto, mockUserId)
    })
  })
  describe('updateTask', () => {
    it('should update a task', async () => {
      const updateDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      }
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const updatedTask = { ...mockTask, ...updateDto }
      jest.spyOn(mockTasksService, 'update').mockResolvedValue(updatedTask)
      const result = await controller.updateTask('task-id-1', updateDto, mockRequest)
      expect(result).toEqual(updatedTask)
      expect(mockTasksService.update).toHaveBeenCalledWith('task-id-1', updateDto, mockUserId)
    })
  })
  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const statusDto: UpdateTaskStatusDto = {
        status: 'готово',
      }
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const updatedTask = { ...mockTask, status: 'готово' }
      jest.spyOn(mockTasksService, 'updateStatus').mockResolvedValue(updatedTask)
      const result = await controller.updateTaskStatus('task-id-1', statusDto, mockRequest)
      expect(result).toEqual(updatedTask)
      expect(mockTasksService.updateStatus).toHaveBeenCalledWith('task-id-1', statusDto, mockUserId)
    })
  })
  describe('archiveTask', () => {
    it('should archive a task', async () => {
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const archiveResult = { message: 'Task archived successfully' }
      jest.spyOn(mockTasksService, 'archive').mockResolvedValue(archiveResult)
      const result = await controller.archiveTask('task-id-1', mockRequest)
      expect(result).toEqual(archiveResult)
      expect(mockTasksService.archive).toHaveBeenCalledWith('task-id-1', mockUserId)
    })
  })
  describe('unarchiveTask', () => {
    it('should unarchive a task', async () => {
      const mockRequest = { user: mockUser } as unknown as RequestWithUser
      const unarchiveResult = { message: 'Task unarchived successfully' }
      jest.spyOn(mockTasksService, 'unarchive').mockResolvedValue(unarchiveResult)
      const result = await controller.unarchiveTask('task-id-1', mockRequest)
      expect(result).toEqual(unarchiveResult)
      expect(mockTasksService.unarchive).toHaveBeenCalledWith('task-id-1', mockUserId)
    })
  })
  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const deleteResult = { message: 'Task deleted successfully' }
      jest.spyOn(mockTasksService, 'delete').mockResolvedValue(deleteResult)
      const result = await controller.deleteTask('task-id-1')
      expect(result).toEqual(deleteResult)
      expect(mockTasksService.delete).toHaveBeenCalledWith('task-id-1')
    })
  })
}) 
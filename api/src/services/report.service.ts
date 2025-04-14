import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Task, TaskDocument } from '../schemas/task.schema'
import { clientOrderReport, DailyTaskCount, OrderWithClient, TaskInterface, UserTaskReport } from '../types'
import { Order, OrderDocument } from '../schemas/order.schema'
import { normalizeDates } from '../utils/normalazeDates'
import { Client, ClientDocument } from '../schemas/client.schema'

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,) {
  }

  async getReportTaskForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<{ userTaskReports: UserTaskReport[]; dailyTaskCounts: DailyTaskCount[] }> {
    const [normalizedStart, normalizedEnd] = normalizeDates(startDate, endDate)
    return this.getTaskReport(normalizedStart, normalizedEnd)
  }

  async getTaskReport(
    startDate: Date,
    endDate: Date
  ): Promise<{ userTaskReports: UserTaskReport[]; dailyTaskCounts: DailyTaskCount[] }> {
    const tasks = await this.taskModel
      .find({
        date_Done: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString(),
        },
      })
      .populate('user', 'displayName') as unknown as TaskInterface[]

    const userTaskCount = tasks.reduce((acc, task) => {
      const userId = task.user._id.toString()

      if (!acc[userId]) {
        acc[userId] = { user:{ _id:task.user._id.toString(), displayName:task.user.displayName }, taskCount: 0, tasks: [] }
      }
      acc[userId].taskCount += 1
      acc[userId].tasks.push({ _id: String(task._id), taskNumber: task.taskNumber, isArchived:task.isArchived })

      return acc
    }, {} as Record<string, UserTaskReport>)

    const userTaskReports = Object.values(userTaskCount)

    const dailyTaskCounts: DailyTaskCount[] = []

    tasks.forEach(task => {
      const taskDate = task.date_Done ? new Date(task.date_Done).toISOString().split('T')[0] : ''
      const existingDay = dailyTaskCounts.find(day => day.date === taskDate)

      if (existingDay) {
        existingDay.taskCount += 1
      } else {
        dailyTaskCounts.push({
          date: taskDate,
          taskCount: 1,
        })
      }
    })
    return { userTaskReports, dailyTaskCounts }
  }

  async getReportClientForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<{ clientOrderReport: clientOrderReport[] }> {
    const [normalizedStart, normalizedEnd] = normalizeDates(startDate, endDate)
    return this.getClientReport(normalizedStart, normalizedEnd)
  }

  async getClientReport(
    startDate: Date,
    endDate: Date
  ): Promise<{ clientOrderReport: clientOrderReport[] }> {
    const orders = await this.orderModel
      .find({
        createdAt: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString(),
        },
      })
      .populate('client', 'name isArchived') as unknown as OrderWithClient[]
    const clientOrderCount = orders.reduce((acc, order): Record<string, clientOrderReport> => {
      const clientId = String(order.client._id)

      if (!acc[clientId]) {
        acc[clientId] = {
          client: { _id: clientId, name: order.client.name, isArchived: order.isArchived },
          orderCount: 0,
          orders: [],
        }
      }

      acc[clientId].orderCount += 1
      acc[clientId].orders.push({
        _id: String(order._id),
        orderNumber: order.orderNumber ?? '',
        status: order.status,
        isArchived: order.isArchived,
      })

      return acc
    }, {} as Record<string, clientOrderReport>)

    const clients = await this.clientModel.find()

    for (const client of clients) {
      const clientId = String(client._id)
      if (!clientOrderCount[clientId]) {
        clientOrderCount[clientId] = {
          client: { _id: clientId, name: client.name, isArchived: client.isArchived },
          orderCount: 0,
          orders: [],
        }
      }
    }

    const clientOrderReport = Object.values(clientOrderCount).sort(
      (a, b) => b.orderCount - a.orderCount
    )

    return { clientOrderReport }
  }
}


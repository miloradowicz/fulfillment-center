import { TaskWithPopulate, User } from '../../../types'

export interface TaskLineProps {
  title: string;
  items: TaskWithPopulate[];
  selectedUser: string | null
}

export interface TaskCardProps {
  task: TaskWithPopulate
  index: number
  parent: string
  selectedUser: string | null
}

interface UserListProps {
  users: User[]
  selectedUser: string | null
  setSelectedUser: (userId: string | null) => void
}


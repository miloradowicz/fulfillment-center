import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { useState } from 'react'
import {
  selectAllArchivedUsers,
  selectUsersLoading,
} from '@/store/slices/userSlice.ts'
import { deleteUser, fetchArchivedUsers, unarchiveUser } from '@/store/thunks/userThunk.ts'
import { toast } from 'react-toastify'
import { hasMessage, isAxios401Error, isGlobalError } from '@/utils/helpers.ts'
import { useNavigate } from 'react-router-dom'
import { selectUser, unsetUser } from '@/store/slices/authSlice'

const useArchivedUsersActions = () => {
  const dispatch = useAppDispatch()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [userToActionId, setUserToActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'delete' | 'unarchive'>('delete')
  const users = useAppSelector(selectAllArchivedUsers)
  const loading = useAppSelector(selectUsersLoading)
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)

  const deleteOneUser = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap()
      await dispatch(fetchArchivedUsers())
      toast.success('Пользователь успешно удален!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось удалить пользователя')
      }
      console.error(e)
    }
  }

  const unarchiveOneUser = async (id: string) => {
    try {
      await dispatch(unarchiveUser(id)).unwrap()
      await dispatch(fetchArchivedUsers())
      toast.success('Пользователь успешно восстановлен!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось восстановить пользователя')
      }
      console.error(e)
    }
  }

  const handleConfirmationOpen = (id: string, type: 'delete' | 'unarchive') => {
    setUserToActionId(id)
    setActionType(type)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setUserToActionId(null)
  }

  const handleConfirmationAction = async () => {
    if (!userToActionId) return

    if (actionType === 'delete') {
      await deleteOneUser(userToActionId)
    } else {
      await unarchiveOneUser(userToActionId)
    }

    handleConfirmationClose()
  }

  return {
    users,
    loading,
    confirmationOpen,
    actionType,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationAction,
  }
}

export default useArchivedUsersActions

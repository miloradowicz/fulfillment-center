import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { selectAllArchivedArrivals, selectLoadingFetchArchivedArrivals } from '@/store/slices/arrivalSlice.ts'
import { useState } from 'react'
import { deleteArrival, fetchArchivedArrivals, unarchiveArrival } from '@/store/thunks/arrivalThunk.ts'
import { toast } from 'react-toastify'
import { hasMessage, isAxios401Error, isGlobalError } from '@/utils/helpers.ts'
import { useNavigate } from 'react-router-dom'
import { selectUser, unsetUser } from '@/store/slices/authSlice'

export const useArchivedArrivalsActions = () => {
  const dispatch = useAppDispatch()
  const arrivals = useAppSelector(selectAllArchivedArrivals)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [arrivalToActionId, setArrivalToActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'delete' | 'unarchive'>('delete')
  const loading = useAppSelector(selectLoadingFetchArchivedArrivals)
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)

  const deleteOneArrival = async (id: string) => {
    try {
      await dispatch(deleteArrival(id)).unwrap()
      await dispatch(fetchArchivedArrivals())
      toast.success('Поставка успешно удалена!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось удалить поставку')
      }
      console.error(e)
    }
  }

  const unarchiveOneArrival = async (id: string) => {
    try {
      await dispatch(unarchiveArrival(id)).unwrap()
      await dispatch(fetchArchivedArrivals())
      toast.success('Поставка успешно восстановлена!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось восстановить поставку')
      }
      console.error(e)
    }
  }

  const handleConfirmationOpen = (id: string, type: 'delete' | 'unarchive') => {
    setArrivalToActionId(id)
    setActionType(type)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setArrivalToActionId(null)
  }

  const handleConfirmationAction = async () => {
    if (!arrivalToActionId) return

    if (actionType === 'delete') {
      await deleteOneArrival(arrivalToActionId)
    } else {
      await unarchiveOneArrival(arrivalToActionId)
    }

    handleConfirmationClose()
  }


  return {
    arrivals,
    loading,
    confirmationOpen,
    actionType,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationAction,
  }
}

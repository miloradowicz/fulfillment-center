import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { selectPopulatedArrivals } from '@/store/slices/arrivalSlice.ts'
import { useCallback, useEffect, useState } from 'react'
import { archiveArrival, cancelArrival, fetchPopulatedArrivals } from '@/store/thunks/arrivalThunk.ts'
import { toast } from 'react-toastify'
import { ArrivalWithClient } from '@/types'
import { fetchArchivedOrders } from '@/store/thunks/orderThunk.ts'
import { hasMessage, isAxios401Error, isGlobalError } from '@/utils/helpers.ts'
import { useNavigate } from 'react-router-dom'
import { selectUser, unsetUser } from '@/store/slices/authSlice'

export const useArrivalsList = () => {
  const dispatch = useAppDispatch()
  const arrivals = useAppSelector(selectPopulatedArrivals)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [selectedArrivalId, setSelectedArrivalId] = useState<string | null>(null)
  const [arrivalToCancel, setArrivalToCancel] = useState<ArrivalWithClient | null>(null)
  const [openCancelModal, setOpenCancelModal] = useState(false)
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)

  const fetchAllArrivals = useCallback(async () => {
    await dispatch(fetchPopulatedArrivals())
  }, [dispatch])

  useEffect(() => {
    void fetchAllArrivals()
  }, [dispatch, fetchAllArrivals])

  const handleClose = () => {
    setIsOpen(false)
    setArchiveModalOpen(false)
  }

  const handleArchiveClick = (arrivalId: string) => {
    setSelectedArrivalId(arrivalId)
    setArchiveModalOpen(true)
  }

  const handleConfirmArchive = async () => {
    try {
      if (selectedArrivalId) {
        await dispatch(archiveArrival(selectedArrivalId)).unwrap()
        await fetchAllArrivals()
        toast.success('Поставка успешно архивирована.')
      }
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось архивировать поставку')
      }
      console.error(e)
    } finally {
      handleClose()
    }
  }

  const handleCancelArrival = async (id: string) => {
    try {
      await dispatch(cancelArrival(id))
      void fetchAllArrivals()
      toast.success('Поставка успешно отменена!')
      dispatch(fetchArchivedOrders())
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else {
        toast.error('Ошибка при отмене поставки.')
        console.error(e)
      }
    }
  }
  const handleCancelConfirm = async () => {
    if (arrivalToCancel) {
      await handleCancelArrival(arrivalToCancel._id)
    }
    setOpenCancelModal(false)
    setArrivalToCancel(null)
  }
  const handleCancelCancel = () => {
    setOpenCancelModal(false)
    setArrivalToCancel(null)
  }

  return {
    arrivals,
    handleArchiveClick,
    handleConfirmArchive,
    isOpen,
    archiveModalOpen,
    handleClose,
    handleCancelConfirm,
    handleCancelCancel,
    openCancelModal,
    setArrivalToCancel,
    setOpenCancelModal,
  }
}

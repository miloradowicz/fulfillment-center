import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { selectLoadingFetchOrder, selectPopulateOrder } from '@/store/slices/orderSlice.ts'
import { archiveOrder, cancelOrder, fetchOrderByIdWithPopulate } from '@/store/thunks/orderThunk.ts'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { hasMessage, isAxios401Error, isGlobalError } from '@/utils/helpers.ts'
import { selectUser, unsetUser } from '@/store/slices/authSlice'
import { getOS } from '@/utils/getOs.ts'

export const useOrderDetails = () => {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const order = useAppSelector(selectPopulateOrder)
  const loading = useAppSelector(selectLoadingFetchOrder)
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)

  const [open, setOpen] = useState(false)
  const [openArchiveModal, setOpenArchiveModal] = useState(false)
  const [confirmCancelModalOpen, setConfirmCancelModalOpen] = useState(false)
  const [tabs, setTabs] = useState(0)
  const [os] = useState<string>(getOS())

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderByIdWithPopulate(id))
    }
  }, [dispatch, id])


  const handleArchive = async () => {
    try {
      if (order) {
        await dispatch(archiveOrder(order._id)).unwrap()
        navigate('/orders')
        toast.success('Заказ успешно архивирован!')
      }
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось архивировать заказ')
      }
      console.error(e)
    }
    setOpenArchiveModal(false)
  }

  const handleCancel = async () => {
    try {
      if (order) {
        await dispatch(cancelOrder(order._id))
        navigate('/orders')
        toast.success('Заказ успешно отменен!')
      }
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else {
        console.error(e)
        toast.error('Ошибка при отмене заказа')
      }
    }
    setConfirmCancelModalOpen(false)
  }

  return {
    order,
    loading,
    open,
    openArchiveModal,
    handleArchive,
    setOpen,
    setOpenArchiveModal,
    tabs,
    setTabs,
    handleCancel,
    setConfirmCancelModalOpen,
    confirmCancelModalOpen,
    os,
    currentUser,
  }
}

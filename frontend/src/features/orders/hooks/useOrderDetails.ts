import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks.ts'
import { selectLoadingFetchOrder, selectPopulateOrder } from '../../../store/slices/orderSlice.ts'
import { archiveOrder, fetchOrderByIdWithPopulate } from '../../../store/thunks/orderThunk.ts'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { OrderWithProductsAndClients } from '../../../types'
import dayjs from 'dayjs'

export const useOrderDetails = () => {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const order = useAppSelector(selectPopulateOrder)
  const loading = useAppSelector(selectLoadingFetchOrder)
  const [open, setOpen] = useState(false)
  const [openArchiveModal, setOpenArchiveModal] = useState(false)
  const [infoTab, setInfoTab] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderByIdWithPopulate(id))
    }
  }, [dispatch, id])

  const handleArchive = async () => {
    try {
      if (order) {
        await dispatch(archiveOrder(order._id))
        navigate('/orders')
        toast.success('Заказ успешно архивирован!')
      }
    } catch (e) {
      console.error(e)
      toast.error('Ошибка при архивации заказа')
    }
    setOpenArchiveModal(false)
  }

  const handleOpenEdit = () => {
    setOpen(true)
  }

  const navigateBack = () => {
    navigate(-1)
  }

  const getStepDescription = (index: number, order: OrderWithProductsAndClients) => {
    const descriptions = [
      'Товар собирается на складе',
      'Заказ отправлен заказчику',
      order.delivered_at ? `Дата доставки: ${ dayjs(order.delivered_at).format('D MMMM YYYY') }` : 'Ожидается доставка',
    ]
    return descriptions[index] || ''
  }

  return {
    order,
    loading,
    open,
    openArchiveModal,
    handleArchive,
    handleOpenEdit,
    setOpen,
    navigateBack,
    getStepDescription,
    setOpenArchiveModal,
    infoTab,
    setInfoTab,
  }
}

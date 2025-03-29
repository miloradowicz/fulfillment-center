import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import {
  selectArrivalError,
  selectArrivalWithPopulate,
  selectLoadingFetchArrival,
} from '../../../store/slices/arrivalSlice'
import { deleteArrival, fetchArrivalByIdWithPopulate } from '../../../store/thunks/arrivalThunk'
import { toast } from 'react-toastify'
import { hasMessage } from '../../../utils/helpers'

const useArrivalDetails = () => {
  const { arrivalId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const arrival = useAppSelector(selectArrivalWithPopulate)
  const loading = useAppSelector(selectLoadingFetchArrival)
  const error = useAppSelector(selectArrivalError)
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
  const [productsTab, setProductsTabs] = useState(0)
  const [infoTab, setInfoTab] = useState(0)

  useEffect(() => {
    if (arrivalId) {
      dispatch(fetchArrivalByIdWithPopulate(arrivalId))
    }
  }, [dispatch, arrivalId])

  const navigateBack = () => {
    navigate(-1)
  }

  const handleDelete = async () => {
    if (arrivalId) {
      try {
        await dispatch(deleteArrival(arrivalId)).unwrap()
        toast.success('Поставка удалена')
        setIsDeleted(true)
      } catch (e) {
        if (hasMessage(e)) {
          toast.error(e.message || 'Ошибка удаления')
        } else {
          console.error(e)
          toast.error('Неизвестная ошибка')
        }
      }
    }

    hideConfirmDeleteModal()
  }

  const showConfirmDeleteModal = () => {
    setConfirmDeleteModalOpen(true)
  }

  const hideConfirmDeleteModal = () => {
    setConfirmDeleteModalOpen(false)
  }

  const getStepDescription = (index: number) => {
    const descriptions = [
      'Товар отправлен заказчиком',
      'Товар прибыл на склад',
      'Товар отсортирован на складе',
    ]
    return descriptions[index] || ''
  }

  return {
    arrivalId,
    arrival,
    loading,
    error,
    productsTab,
    infoTab,
    confirmDeleteModalOpen,
    isDeleted,
    showConfirmDeleteModal,
    hideConfirmDeleteModal,
    handleDelete,
    navigateBack,
    editModalOpen,
    setEditModalOpen,
    setProductsTabs,
    setInfoTab,
    getStepDescription,
  }
}

export default useArrivalDetails

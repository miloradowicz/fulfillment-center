import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { useState } from 'react'
import {
  deleteProduct,
  fetchArchivedProducts,
  unarchiveProduct,
} from '@/store/thunks/productThunk.ts'
import { toast } from 'react-toastify'
import {
  selectAllArchivedProducts, selectLoadingFetchAllArchivedProduct,
} from '@/store/slices/productSlice.ts'
import { hasMessage, isAxios401Error, isGlobalError } from '@/utils/helpers.ts'
import { useNavigate } from 'react-router-dom'
import { selectUser, unsetUser } from '@/store/slices/authSlice'

const useArchivedProductActions = () => {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectAllArchivedProducts)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [productToActionId, setProductToActionId] = useState<string | null>(null)
  const loading = useAppSelector(selectLoadingFetchAllArchivedProduct)
  const [actionType, setActionType] = useState<'delete' | 'unarchive'>('delete')
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)
  
  const deleteOneProduct = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap()
      await dispatch(fetchArchivedProducts())
      toast.success('Товар успешно удален!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось удалить товар')
      }
      console.error(e)
    }
  }

  const unarchiveOneProduct = async (id: string) => {
    try {
      await dispatch(unarchiveProduct(id)).unwrap()
      fetchArchivedProducts()
      toast.success('Товар успешно восстановлен!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось восстановить товар')
      }
      console.error(e)
    }
  }

  const handleConfirmationOpen = (id: string, type: 'delete' | 'unarchive') => {
    setProductToActionId(id)
    setActionType(type)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setProductToActionId(null)
  }

  const handleConfirmationAction = async () => {
    if (!productToActionId) return

    if (actionType === 'delete') {
      await deleteOneProduct(productToActionId)
    } else {
      await unarchiveOneProduct(productToActionId)
    }

    handleConfirmationClose()
  }

  return {
    products,
    loading,
    confirmationOpen,
    actionType,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationAction,
  }
}

export default useArchivedProductActions

import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { hasMessage, isAxios401Error, isGlobalError } from '@/utils/helpers.ts'
import {
  selectAllArchivedInvoices, selectLoadingFetchArchiveInvoice,
} from '@/store/slices/invoiceSlice.ts'
import { deleteInvoice, fetchArchivedInvoices, unarchiveInvoice } from '@/store/thunks/invoiceThunk.ts'
import { useNavigate } from 'react-router-dom'
import { selectUser, unsetUser } from '@/store/slices/authSlice'

const useArchivedInvoiceActions = () => {
  const dispatch = useAppDispatch()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [invoiceToActionId, setInvoiceToActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'delete' | 'unarchive'>('delete')
  const invoices = useAppSelector(selectAllArchivedInvoices)
  const loading = useAppSelector(selectLoadingFetchArchiveInvoice)
  const navigate= useNavigate()
  const currentUser = useAppSelector(selectUser)

  const deleteOneInvoice = async (id: string) => {
    try {
      await dispatch(deleteInvoice(id)).unwrap()
      await dispatch(fetchArchivedInvoices())
      toast.success('Счет успешно удален!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось удалить счет')
      }
      console.error(e)
    }
  }

  const unarchiveOneInvoice = async (id: string) => {
    try {
      await dispatch(unarchiveInvoice(id)).unwrap()
      await dispatch(fetchArchivedInvoices())
      toast.success('Счет успешно восстановлен!')
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось восстановить счет')
      }
      console.error(e)
    }
  }

  const handleConfirmationOpen = (id: string, type: 'delete' | 'unarchive') => {
    setInvoiceToActionId(id)
    setActionType(type)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setInvoiceToActionId(null)
  }

  const handleConfirmationAction = async () => {
    if (!invoiceToActionId) return

    if (actionType === 'delete') {
      await deleteOneInvoice(invoiceToActionId)
    } else {
      await unarchiveOneInvoice(invoiceToActionId)
    }

    handleConfirmationClose()
  }

  return {
    invoices,
    loading,
    confirmationOpen,
    actionType,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationAction,
  }
}

export default useArchivedInvoiceActions

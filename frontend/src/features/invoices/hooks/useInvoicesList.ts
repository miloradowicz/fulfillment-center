import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAllInvoices } from '@/store/slices/invoiceSlice'
import { useCallback, useEffect, useState } from 'react'
import { archiveInvoice, fetchInvoices } from '@/store/thunks/invoiceThunk'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { selectUser, unsetUser } from '@/store/slices/authSlice'
import { isAxios401Error } from '@/utils/helpers'

export const useInvoicesList = () => {
  const dispatch = useAppDispatch()
  const invoices = useAppSelector(selectAllInvoices)
  const [isOpen, setIsOpen] = useState(false)
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)

  const fetchAllInvoices = useCallback(async () => {
    await dispatch(fetchInvoices())
  }, [dispatch])

  useEffect(() => {
    void fetchAllInvoices()
  }, [fetchAllInvoices])

  const handleClose = () => {
    setIsOpen(false)
    setArchiveModalOpen(false)
  }

  const handleArchiveClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setArchiveModalOpen(true)
  }

  const handleConfirmArchive = async () => {
    try {
      if (selectedInvoiceId) {
        await dispatch(archiveInvoice(selectedInvoiceId)).unwrap()
        toast.success('Счёт успешно архивирован.')
        await fetchAllInvoices()
      }
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      } else {
        toast.error('Ошибка при архивировании счёта.')
        console.error(e)
      }
    } finally {
      handleClose()
    }
  }

  return {
    invoices,
    handleArchiveClick,
    handleConfirmArchive,
    isOpen,
    archiveModalOpen,
    handleClose,
  }
}

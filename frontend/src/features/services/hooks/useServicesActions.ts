import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { hasMessage, isGlobalError } from '@/utils/helpers.ts'
import { Service } from '@/types'
import { archiveService, fetchServiceById, fetchServices } from '@/store/thunks/serviceThunk.ts'
import {
  clearServiceError,
  selectAllServices,
  selectLoadingFetchService,
  selectService,
  selectServiceError,
} from '@/store/slices/serviceSlice.ts'

export const useServiceActions = (fetchOnDelete: boolean) => {
  const dispatch = useAppDispatch()
  const { id } = useParams()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [serviceToArchiveId, setServiceToArchiveId] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const services = useAppSelector(selectAllServices)
  const service = useAppSelector(selectService)
  const error = useAppSelector(selectServiceError)
  const loading = useAppSelector(selectLoadingFetchService)

  const [openDetailsModal, setOpenDetailsModal] = useState(false)

  useEffect(() => {
    if (id) {
      setOpenDetailsModal(true)
      dispatch(fetchServiceById(id))
    } else {
      setOpenDetailsModal(false)
    }
  }, [id, dispatch])

  useEffect(() => {
    dispatch(fetchServices())
  }, [dispatch])

  const handleCloseDetailsModal = useCallback(() => {
    setOpenDetailsModal(false)
    navigate('/services', { replace: true })
  }, [navigate])

  const clearErrors = useCallback(() => {
    dispatch(clearServiceError())
  }, [dispatch])

  const archiveOneService = async (id: string) => {
    try {
      await dispatch(archiveService(id)).unwrap()
      if (fetchOnDelete) {
        await dispatch(fetchServices())
      } else {
        navigate('/services')
      }
      toast.success('Услуга успешно архивирована!')
    } catch (e) {
      if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось архивировать услугу')
      }
      console.error(e)
    }
  }

  const handleOpen = (service?: Service) => {
    if (service) {
      setSelectedService(service)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    clearErrors()
  }

  const handleConfirmationOpen = (id: string) => {
    setServiceToArchiveId(id)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setServiceToArchiveId(null)
  }

  const handleConfirmationArchive = () => {
    if (serviceToArchiveId) archiveOneService(serviceToArchiveId)
    handleConfirmationClose()
  }

  return {
    services,
    service,
    selectedService,
    open,
    confirmationOpen,
    openDetailsModal,
    error,
    loading,
    id,
    navigate,
    archiveOneService,
    handleOpen,
    handleClose,
    handleCloseDetailsModal,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationArchive,
  }
}

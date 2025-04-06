import { useAppDispatch, useAppSelector } from '../../../app/hooks.ts'
import { useCallback, useEffect, useState } from 'react'
import {
  archiveProduct,
  fetchProductByIdWithPopulate,
  fetchProductsWithPopulate,
} from '../../../store/thunks/productThunk.ts'
import { toast } from 'react-toastify'
import {
  clearErrorProduct,
  selectLoadingFetchProduct, selectProductError,
  selectProductsWithPopulate,
  selectProductWithPopulate,
} from '../../../store/slices/productSlice.ts'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductWithPopulate } from '../../../types'
import { hasMessage, isGlobalError } from '../../../utils/helpers.ts'


const useProductActions = (fetchOnDelete: boolean) => {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [productToArchiveId, setProductToArchiveId] = useState<string | null>(null)
  const products = useAppSelector(selectProductsWithPopulate)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithPopulate | null>(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const product = useAppSelector(selectProductWithPopulate)
  const loading = useAppSelector(selectLoadingFetchProduct)
  const error = useAppSelector(selectProductError)

  const clearErrors = useCallback(() => {
    dispatch(clearErrorProduct())
  }, [dispatch])

  const fetchAllProducts = useCallback(async () => {
    await dispatch(fetchProductsWithPopulate())
  }, [dispatch])

  const fetchProduct = useCallback(async (id: string) => {
    await dispatch(fetchProductByIdWithPopulate(id))
  }, [dispatch])

  useEffect(() => {
    void clearErrors()
  }, [clearErrors])

  useEffect(() => {
    void fetchAllProducts()
  }, [fetchAllProducts])

  useEffect(() => {
    if (id) {
      void fetchProduct(id)
    }
  }, [id, fetchProduct])

  const archiveOneProduct = async (id: string) => {
    try {
      await dispatch(archiveProduct(id)).unwrap()
      if (fetchOnDelete) {
        await fetchAllProducts()
      } else {
        navigate('/products')
      }
      toast.success('Товар успешно архивирован!')
    } catch (e) {
      if (isGlobalError(e) || hasMessage(e)) {
        toast.error(e.message)
      } else {
        toast.error('Не удалось архивировать товар')
      }
      console.error(e)
    }
  }

  const handleOpen = (product?: ProductWithPopulate) => {
    if (product) {
      setSelectedProduct(product)
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    clearErrors()
  }

  const handleConfirmationOpen = (id: string) => {
    setProductToArchiveId(id)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setProductToArchiveId(null)
  }

  const handleConfirmationArchive = async () => {
    if (productToArchiveId) await archiveOneProduct(productToArchiveId)
    handleConfirmationClose()
  }

  return {
    products,
    product,
    selectedProduct,
    archiveOneProduct,
    fetchAllProducts,
    fetchProduct,
    open,
    handleOpen,
    handleClose,
    id,
    navigate,
    loading,
    error,
    confirmationOpen,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationArchive,
    productToArchiveId,
  }
}

export default useProductActions

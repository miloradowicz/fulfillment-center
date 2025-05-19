import { initialErrorState, initialState } from '../state/stockState.ts'
import React, { useEffect, useState } from 'react'
import { Stock, StockError, StockMutation } from '@/types'
import { useAppDispatch, useAppSelector } from '@/app/hooks.ts'
import { selectAllProducts } from '@/store/slices/productSlice.ts'
import { clearStockError, selectIsStockCreating, selectStockCreateError } from '@/store/slices/stocksSlice.ts'
import { fetchProducts } from '@/store/thunks/productThunk.ts'
import { toast } from 'react-toastify'
import { addStock, fetchStockById, fetchStocks, updateStock } from '@/store/thunks/stocksThunk.ts'
import { useNavigate } from 'react-router-dom'
import { selectUser, unsetUser } from '@/store/slices/authSlice.ts'
import { isAxios401Error } from '@/utils/helpers.ts'

export const useStockForm = (initialData?: Stock, onSuccess?: () => void) => {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectAllProducts)
  const error = useAppSelector(selectStockCreateError)
  const isLoading = useAppSelector(selectIsStockCreating)
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectUser)

  const [form, setForm] = useState<StockMutation>(
    initialData
      ? {
        name: initialData.name,
        address: initialData.address,
      }
      : { ...initialState },
  )

  const [errors, setErrors] = useState<StockError>({ ...initialErrorState })

  useEffect(() => {
    dispatch(clearStockError())
    dispatch(fetchProducts())
  }, [dispatch])

  const handleBlur = (field: keyof StockError, value: string | number) => {
    type ErrorMessages = {
      [key in keyof StockError]: string
    }

    const errorMessages: ErrorMessages = {
      name: !value ? 'Заполните название склада.' : '',
      address: !value ? 'Укажите адрес склада.' : '',
    }

    setErrors(prev => ({
      ...prev,
      [field]: errorMessages[field] || '',
    }))
  }

  const submitFormHandler = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (initialData) {
        await dispatch(updateStock({ stockId: initialData._id, stock: form })).unwrap()
        onSuccess?.()
        toast.success('Склад успешно обновлен!')
        await dispatch(fetchStockById(initialData._id))
      } else {
        await dispatch(addStock(form)).unwrap()
        await dispatch(fetchStocks())
        toast.success('Склад успешно создан!')
      }

      setForm({ ...initialState })
      setErrors({ ...initialErrorState })
      onSuccess?.()
    } catch (e) {
      if (isAxios401Error(e) && currentUser) {
        toast.error('Другой пользователь зашел в данный аккаунт')
        dispatch(unsetUser())
        navigate('/login')
      }
      console.error(e)
    }
  }

  return {
    products,
    isLoading,
    form,
    setForm,
    errors,
    handleBlur,
    error,
    submitFormHandler,
  }
}

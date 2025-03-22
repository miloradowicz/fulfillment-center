import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks.ts'
import { createCounterparty, fetchAllCounterparties, fetchCounterpartyById, updateCounterparty } from '../../../store/thunks/counterpartyThunk.ts'
import { CounterpartyMutation } from '../../../types'
import { phoneNumberRegex } from '../../../constants.ts'
import { initialState } from '../state/counterpartyState.ts'
import { toast } from 'react-toastify'
import { selectAllCounterparties, selectCounterparty, selectLoadingAddCounterparty } from '../../../store/slices/counterpartySlices.ts'

const requiredField: (keyof CounterpartyMutation)[] = ['name']

export const useCounterpartyForm = (counterpartyId?: string, onClose?: () => void) => {
  const loading = useAppSelector(selectLoadingAddCounterparty)
  const counterparties = useAppSelector(selectAllCounterparties)
  const counterparty = useAppSelector(selectCounterparty)
  const [form, setForm] = useState<CounterpartyMutation>(initialState)
  const [errors, setErrors] = useState<{[K in keyof CounterpartyMutation]?: string}>({})
  const [submitting, setSubmitting] = useState(false)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (counterpartyId) dispatch(fetchCounterpartyById(counterpartyId))
  }, [dispatch, counterpartyId])

  useEffect(() => {
    if (counterpartyId && counterparty) setForm(counterparty)
  }, [counterpartyId, counterparty])

  useEffect(() => {
    dispatch(fetchAllCounterparties())
  }, [dispatch])

  const validate = (name: keyof CounterpartyMutation, value?: string): string | undefined => {
    if (name === 'name' && !value?.trim()) return 'Поле не может быть пустым'
    if (name === 'phone_number' && value && !phoneNumberRegex.test(value)) {
      return 'Неправильный формат номера телефона'
    }
    return undefined
  }

  const validateFields = (): boolean => {
    const newErrors: {[K in keyof CounterpartyMutation]?: string} = {}

    requiredField.forEach(field => {
      const value = form[field] as string
      const errorMessage = validate(field, value)
      if (errorMessage) newErrors[field] = errorMessage
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length > 0
  }

  const checkCounterpartyNameExistence = (name: string) => {
    const existing = counterparties.find(c =>
      c.name.toLowerCase() === name.toLowerCase() &&
      c._id !== counterpartyId,
    )

    if (existing) {
      setErrors(prev => ({ ...prev, name: 'Контрагент с таким именем уже существует' }))
      return true
    }

    setErrors(prev => ({ ...prev, name: '' }))
    return false
  }

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value || '',
    }))

    if (name === 'phone_number') {
      setErrors(prev => ({
        ...prev,
        phone_number: value && !phoneNumberRegex.test(value)
          ? 'Неправильный формат номера телефона'
          : '',
      }))
    }

    if (name === 'name') checkCounterpartyNameExistence(value)
  }

  const getFieldError = (field: keyof CounterpartyMutation) => errors[field] || ''

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateFields()) return

    const isNameTaken = checkCounterpartyNameExistence(form.name)
    if (isNameTaken) return

    setSubmitting(true)

    try {
      const submissionData = {
        ...form,
        phone_number: form.phone_number?.trim() || undefined,
        address: form.address?.trim() || undefined,
      }

      if (counterpartyId) {
        await dispatch(updateCounterparty({ id: counterpartyId, data: submissionData })).unwrap()
        await dispatch(fetchCounterpartyById(counterpartyId))
        toast.success('Контрагент успешно обновлен!')
      } else {
        await dispatch(createCounterparty(submissionData)).unwrap()
        await dispatch(fetchAllCounterparties())
        toast.success('Контрагент успешно создан!')
      }

      setForm(initialState)
      onClose?.()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return { form, loading: loading || submitting, inputChangeHandler, onSubmit, getFieldError }
}

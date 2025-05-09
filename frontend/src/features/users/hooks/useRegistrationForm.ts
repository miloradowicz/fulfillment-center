import { SelectChangeEvent } from '@mui/material'
import { passwordStrength, DiversityType } from 'check-password-strength'
import { useState, ChangeEvent } from 'react'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { passwordStrengthOptions, emailRegex, roles } from '../../../constants'
import { selectCreateError } from '../../../store/slices/arrivalSlice'
import { selectLoadingRegisterUser, clearCreateError } from '../../../store/slices/userSlice'
import { registerUser } from '../../../store/thunks/userThunk'
import { UserRegistrationMutation } from '../../../types'

type FormType = UserRegistrationMutation | (Omit<UserRegistrationMutation, 'role'> & { role: '' })

const isUserRegistrationMutation = (type: FormType): type is UserRegistrationMutation =>
  roles.map(x => x.name).includes(type.role)

const initialState: UserRegistrationMutation | (Omit<UserRegistrationMutation, 'role'> & { role: '' }) = {
  email: '',
  password: '',
  displayName: '',
  role: '',
}

export const useRegistrationForm = () => {
  const dispatch = useAppDispatch()

  const sending = useAppSelector(selectLoadingRegisterUser)
  const backendError = useAppSelector(selectCreateError)
  const [frontendError, setFrontendError] = useState<{ [key: string]: string }>({})
  const [form, setForm] = useState(initialState)
  const [confirmPassword, setConfirmPassword] = useState('')

  const checkStrenght = (password: string) => {
    const strength = passwordStrength(password, passwordStrengthOptions)
    return (
      strength.id > 0 && ['number', 'uppercase', 'lowercase'].every(x => strength.contains.includes(x as DiversityType))
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isUserRegistrationMutation(form)) {
      return void validateFields('role')
    } else {
      try {
        setForm(data => ({ ...data, displayName: data.displayName.trim() }))

        if (!checkStrenght((form as UserRegistrationMutation).password)) {
          return void toast.error(
            'Слишком слабый пароль. Пароль должен быть не короче 8 символов и содержать одну заглавную и одну строчную латниские буквы, одну цифру',
          )
        }

        await dispatch(registerUser(form)).unwrap()

        setForm(initialState)
        setConfirmPassword('')
        dispatch(clearCreateError())
        setFrontendError({})
        toast.success('Пользователь успешно создан!')
      } catch {
        toast.error('Пользователь не создан')
      }
    }
  }

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const _error = { ...frontendError }
    delete _error.confirmPassword
    setFrontendError(_error)

    setConfirmPassword(e.target.value)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>) => {
    dispatch(clearCreateError(e.target.name))

    let value = e.target.value as string

    if (e.target.name !== 'displayName') {
      value = value.trim()
    }

    setForm(data => ({ ...data, [e.target.name]: value }))
  }

  const validateFields = (...fieldNames: string[]) => {
    const _error = { ...frontendError }
    fieldNames.forEach(x => delete _error[x])
    setFrontendError(_error)

    fieldNames.forEach(x => {
      switch (x) {
      case 'email':
        if (!emailRegex.test(form.email)) {
          setFrontendError(error => ({ ...error, [x]: 'Недействительная почта' }))
        }
        break

      case 'confirmPassword':
        if (form.password !== confirmPassword) {
          setFrontendError(error => ({ ...error, [x]: 'Пароли не совпадают' }))
        }
        break

      case 'role':
        if (!roles.map(x => x.name).includes(form.role)) {
          setFrontendError(error => ({ ...error, [x]: 'Укажите роль' }))
        }
        break
      }
    })
  }

  const getFieldError = (fieldName: string) => {
    try {
      return frontendError[fieldName] || backendError?.errors[fieldName].messages.join('; ')
    } catch {
      return undefined
    }
  }

  return {
    sending,
    backendError,
    frontendError,
    setFrontendError,
    form,
    setForm,
    confirmPassword,
    setConfirmPassword,
    checkStrenght,
    onSubmit,
    handleConfirmPasswordChange,
    handleChange,
    validateFields,
    getFieldError,
  }
}
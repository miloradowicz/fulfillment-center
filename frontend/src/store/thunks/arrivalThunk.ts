import { createAsyncThunk } from '@reduxjs/toolkit'
import axiosAPI from '../../utils/axiosAPI.ts'
import { Arrival, ArrivalMutation, GlobalError } from '../../types'
import { isAxiosError } from 'axios'

export const fetchArrivals = createAsyncThunk<Arrival[]>(
  'arrivals/fetchArrivals',
  async () => {
    const response = await axiosAPI.get('/arrivals')
    return response.data
  },
)

export const fetchArrivalById = createAsyncThunk<Arrival, string>(
  'arrivals/fetchArrivalById',
  async (arrivalId: string) => {
    const response = await axiosAPI.get(`/arrivals/?=${ arrivalId }`)
    return response.data
  },
)

export const addArrival = createAsyncThunk<void, ArrivalMutation, { rejectValue: GlobalError }
>('arrivals/addArrival', async (data: ArrivalMutation, { rejectWithValue }) => {
  try {
    await axiosAPI.post('/arrivals', data)
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      return rejectWithValue(e.response.data as GlobalError)
    }
    throw e
  }
})

export const deleteArrival = createAsyncThunk<void, string, { rejectValue: GlobalError }
>('arrivals/deleteArrival', async (arrivalId: string, { rejectWithValue }) => {
  try {
    await axiosAPI.delete(`/arrivals/?=${ arrivalId }`)
  } catch (e) {
    if (isAxiosError(e) && e.response) {
      return rejectWithValue(e.response.data as GlobalError)
    }
    throw e
  }
})

export const updateArrival = createAsyncThunk<void, { arrivalId: string; data: ArrivalMutation }, { rejectValue: GlobalError }>(
  'arrivals/updateArrival',
  async ({ arrivalId, data }, { rejectWithValue }) => {
    try {
      await axiosAPI.put(`/arrivals/${ arrivalId }`, data)
    } catch (e) {
      if (isAxiosError(e) && e.response) {
        return rejectWithValue(e.response.data as GlobalError)
      }
      throw e
    }
  },
)

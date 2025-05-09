import { createSlice } from '@reduxjs/toolkit'
import { GlobalError, Service } from '../../types'
import {
  fetchServices,
  fetchServiceById,
  createService,
  updateService,
  deleteService,
  archiveService,
} from '../thunks/serviceThunk.ts'
import { RootState } from '../../app/store.ts'

interface ServiceState {
  service: Service | null;
  services: Service[] | null;
  loadingFetch: boolean;
  loadingFetchOne: boolean;
  loadingAdd: boolean;
  loadingArchive: boolean;
  loadingDelete: boolean;
  loadingUpdate: boolean;
  error: GlobalError | null;
}

const initialState: ServiceState = {
  service: null,
  services: null,
  loadingFetch: false,
  loadingFetchOne: false,
  loadingAdd: false,
  loadingArchive: false,
  loadingDelete: false,
  loadingUpdate: false,
  error: null,
}

export const selectService = (state: RootState) => state.services.service
export const selectAllServices = (state: RootState) => state.services.services
export const selectLoadingFetchService = (state: RootState) => state.services.loadingFetch
export const selectLoadingAddService = (state: RootState) => state.services.loadingAdd
export const selectLoadingArchiveService = (state: RootState) => state.services.loadingArchive
export const selectLoadingDeleteService = (state: RootState) => state.services.loadingDelete
export const selectLoadingUpdateService = (state: RootState) => state.services.loadingUpdate
export const selectServiceError = (state: RootState) => state.services.error

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchServices.pending, state => {
      state.loadingFetch = true
    })
    builder.addCase(fetchServices.fulfilled, (state, action) => {
      state.loadingFetch = false
      state.services = action.payload
    })
    builder.addCase(fetchServices.rejected, state => {
      state.loadingFetch = false
    })

    builder.addCase(fetchServiceById.pending, state => {
      state.loadingFetchOne = true
    })
    builder.addCase(fetchServiceById.fulfilled, (state, action) => {
      state.loadingFetchOne = false
      state.service = action.payload
    })
    builder.addCase(fetchServiceById.rejected, state => {
      state.loadingFetchOne = false
    })

    builder.addCase(createService.pending, state => {
      state.loadingAdd = true
    })
    builder.addCase(createService.fulfilled, state => {
      state.loadingAdd = false
    })
    builder.addCase(createService.rejected, (state, action) => {
      state.loadingAdd = false
      state.error = action.payload ?? { message: 'Ошибка создания услуги' }
    })

    builder.addCase(updateService.pending, state => {
      state.loadingUpdate = true
    })
    builder.addCase(updateService.fulfilled, state => {
      state.loadingUpdate = false
    })
    builder.addCase(updateService.rejected, (state, { payload: error }) => {
      state.loadingUpdate = false
      state.error = error || null
    })

    builder.addCase(archiveService.pending, state => {
      state.loadingArchive = true
      state.error = null
    })
    builder.addCase(archiveService.fulfilled, state => {
      state.loadingArchive = false
      state.error = null
    })
    builder.addCase(archiveService.rejected, (state, { payload: error }) => {
      state.loadingArchive = false
      state.error = error || null
    })

    builder.addCase(deleteService.pending, state => {
      state.loadingDelete = true
      state.error = null
    })
    builder.addCase(deleteService.fulfilled, state => {
      state.loadingDelete = false
      state.error = null
    })
    builder.addCase(deleteService.rejected, (state, { payload: error }) => {
      state.loadingDelete = false
      state.error = error || null
    })
  },
})

export const serviceReducer = serviceSlice.reducer

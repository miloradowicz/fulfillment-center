import { configureStore } from '@reduxjs/toolkit'
import { clientReducer } from '../store/slices/clientSlice.ts'
import { productReducer } from '../store/slices/productSlice.ts'
import { arrivalReducer } from '../store/slices/arrivalSlice.ts'
import { orderReducer } from '../store/slices/orderSlice.ts'
import { userReducer } from '../store/slices/userSlice.ts'
import { taskReducer } from '../store/slices/taskSlice.ts'
import { serviceReducer } from '../store/slices/serviceSlice.ts'
import { stockReducer } from '../store/slices/stocksSlice.ts'
import { counterpartyReducer } from '../store/slices/counterpartySlices.ts'

export const store = configureStore({
  reducer: {
    clients: clientReducer,
    products: productReducer,
    arrivals: arrivalReducer,
    orders: orderReducer,
    users: userReducer,
    tasks: taskReducer,
    services: serviceReducer,
    stocks: stockReducer,
    counterparties: counterpartyReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

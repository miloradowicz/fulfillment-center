import { Route, Routes } from 'react-router-dom'
import ClientForm from './features/clients/components/ClientForm.tsx'
import { Typography } from '@mui/material'
import ArrivalForm from './features/arrivals/components/ArrivalForm.tsx'
import ProductForm from './features/products/components/ProductForm.tsx'
import OrderForm from './features/orders/components/OrderForm.tsx'
import Layout from './components/UI/Layout/Layout.tsx'
import LoginPage from './features/users/containers/LoginPage.tsx'
import { ThemeProvider, createTheme } from '@mui/material'
import ArrivalPage from './features/arrivals/containers/ArrivalPage.tsx'
import ProductPage from './features/products/containers/ProductPage.tsx'
import OrderPage from './features/orders/containers/OrderPage.tsx'
import ClientPage from './features/clients/containers/ClientPage.tsx'
import ReportPage from './features/reports/containers/ReportPage.tsx'
import RegistrationForm from './features/users/components/RegistrationForm.tsx'
import ClientDetail from './features/clients/containers/ClientDetail.tsx'



const App = () => {

  const theme = createTheme()
  return <>
    <ThemeProvider theme={theme}>
      <Layout>
        <Routes>
          <Route path='/' element={<LoginPage/>} />
          <Route path='/login' element={<LoginPage/>} />
          <Route path='/clients' element={<ClientPage/>} />
          <Route path='/clients/:clientId' element={<ClientDetail/>} />
          <Route path='/arrivals' element={<ArrivalPage/>} />
          <Route path='/products' element={<ProductPage/>} />
          <Route path='/orders' element={<OrderPage/>} />
          <Route path='/reports' element={<ReportPage/>} />
          <Route path='/login' element={<LoginPage/>} />
          <Route path='/add-new-client' element={<ClientForm />} />
          <Route path='/add-new-product' element={<ProductForm />} />
          <Route path='/add-new-order' element={<OrderForm />} />
          <Route path='/add-new-order' element={<OrderForm />} />
          <Route path='/add-new-arrival' element={<ArrivalForm/>}/>
          <Route path='/add-new-order' element={<OrderForm />} />
          <Route path='/add-new-user' element={<RegistrationForm/>} />
          <Route path="/*" element={<Typography variant={'h3'} textAlign="center">Not Found</Typography>}/>
        </Routes>
      </Layout>
    </ThemeProvider>
  </>
}

export default App

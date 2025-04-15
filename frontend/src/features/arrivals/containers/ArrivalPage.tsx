import Modal from '@/components/Modal/Modal.tsx'
import { Box, CircularProgress } from '@mui/material'
import { useArrivalPage } from '../hooks/useArrivalPage.ts'
import ArrivalsDataList from '../components/ArrivalsDataList.tsx'
import ArrivalForm from '../components/ArrivalForm.tsx'
import Grid from '@mui/material/Grid2'
import CustomButton from '@/components/CustomButton/CustomButton.tsx'
import CustomTitle from '@/components/CustomTitle/CustomTitle.tsx'
import { Truck } from 'lucide-react'

const ArrivalPage = () => {
  const { open, handleOpen, handleClose, isLoading, arrivalToEdit, handleOpenEdit } = useArrivalPage()

  return (
    <>
      {isLoading ? (
        <Grid sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Grid>
      ) : null}

      <Modal handleClose={handleClose} open={open} aria-modal="true">
        <ArrivalForm initialData={arrivalToEdit} onSuccess={handleClose} />
      </Modal>

      <Box display={'flex'} className="max-w-[1000px] mx-auto mb-5 mt-7 w-full flex items-center justify-end">
        <CustomTitle text={'Поставки'} icon={<Truck size={25} />} />
        <CustomButton text={'Добавить поставку'} onClick={handleOpen} />
      </Box>
      <Box className="my-8">
        <ArrivalsDataList onEdit={handleOpenEdit} />
      </Box>
    </>
  )
}

export default ArrivalPage

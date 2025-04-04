import { Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { useStockDetails } from '../hooks/useStockDetails.ts'
import Modal from '../../../components/UI/Modal/Modal.tsx'
import StockForm from '../components/StockForm.tsx'
import Grid from '@mui/material/Grid2'
import { ArrowBack } from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { ruRU } from '@mui/x-data-grid/locales'
import EditButton from '../../../components/UI/EditButton/EditButton.tsx'
import DeleteButton from '../../../components/UI/DeleteButton/DeleteButton.tsx'

const StockDetails = () => {
  const {
    stock,
    isLoading,
    deleteModalOpen,
    showDeleteModal,
    hideDeleteModal,
    handleDelete,
    navigateBack,
    editModalOpen,
    setEditModalOpen,
    stockColumns,
  } = useStockDetails()

  return (
    <>
      {isLoading ? (
        <Grid sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Grid>
      ) : null}

      <Modal open={editModalOpen} handleClose={() => setEditModalOpen(false)}>
        <StockForm
          initialData={stock || undefined}
          onSuccess={() => {
            setEditModalOpen(false)
          }}
        />
      </Modal>

      <Modal open={deleteModalOpen} handleClose={hideDeleteModal}>
        <Grid container direction="column">
          <Grid mb={4}>
            <Typography variant="h6" gutterBottom>
              Вы действительно хотите удалить склад?
            </Typography>
          </Grid>

          <Grid>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Удалить
              </Button>
              <Button variant="outlined" onClick={hideDeleteModal}>
                Отмена
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Modal>

      <div className="flex items-center gap-3">
        <IconButton onClick={() => navigateBack()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700} className="whitespace-normal break-words">
          Назад
        </Typography>
      </div>

      <div className="max-w-4xl mx-auto mt-6 bg-white rounded-lg shadow-lg p-8 mb-8">
        <Box className="text-center mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
          <Typography
            sx={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}
            className="whitespace-normal break-words"
          >
            📦 Склад: {stock?.name}
          </Typography>

          <Typography
            sx={{ fontSize: '20px', fontWeight: 700, color: '#1F2937', marginTop: '8px' }}
            className="whitespace-normal break-words"
          >
            📍 Адрес: {stock?.address}
          </Typography>
        </Box>

        <Box className="mt-2 bg-gray-100 p-4 rounded-lg shadow-lg">
          <Typography variant="h6" className="mb-7 text-center">
            Товары:
          </Typography>
          <DataGrid
            rows={stock?.products?.map(item => ({
              id: item._id,
              amount: item.amount,
              client: item.product.client.name,
              title: item.product.title,
              article: item.product.article,
              barcode: item.product.barcode,
            }))}
            columns={stockColumns}
            localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
            pageSizeOptions={[5, 10, 20, 100]}
            className="mt-4"
            disableRowSelectionOnClick
          />
        </Box>

        <Box className="text-center mt-8 p-4 flex items-center justify-center gap-3">
          <EditButton onClick={() => setEditModalOpen(true)} />
          <DeleteButton onClick={showDeleteModal}/>
        </Box>
      </div>
    </>
  )
}

export default StockDetails

import {
  Box,
  Button,
  Card, Chip, CircularProgress,
  Container,
  Divider,
  IconButton,
  Step, StepLabel, Stepper, Tab, Tabs,
  Typography,
} from '@mui/material'
import { ArrowBack, DeleteOutline, EditOutlined } from '@mui/icons-material'
import dayjs from 'dayjs'
import useArrivalDetails from '../hooks/useArrivalDetails'
import Modal from '../../../components/UI/Modal/Modal'
import ArrivalForm from '../components/ArrivalForm.tsx'
import { Link } from 'react-router-dom'
import { ArrivalStatus } from '../../../constants.ts'
import ProductsTable from '../../../components/Tables/ProductsTable.tsx'
import DefectsTable from '../../../components/Tables/DefectsTable.tsx'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import LogsTable from '../../../components/Tables/LogsTable.tsx'
import ConfirmationModal from '../../../components/UI/Modal/ConfirmationModal.tsx'
import { basename } from 'path-browserify'
import { getArrivalStatusColor } from '../../../utils/getOrderStatusColor.ts'


const ArrivalDetails = () => {
  const {
    arrival,
    loading,
    infoTab,
    productsTab,
    confirmDeleteModalOpen,
    navigateBack,
    handleDelete,
    editModalOpen,
    setEditModalOpen,
    setConfirmDeleteModalOpen,
    setInfoTab,
    setProductsTabs,
    getStepDescription,
  } = useArrivalDetails()

  const statuses = Object.values(ArrivalStatus)
  const activeStep = arrival ? statuses.indexOf(arrival.arrival_status as string) : 0

  if (loading) {
    return (
      <Box className="flex justify-center mt-4">
        <CircularProgress />
      </Box>
    )
  }

  if (!arrival) {
    return <Typography className="text-center mt-4">Поставка не найдена</Typography>
  }

  return (
    <>
      <Modal open={editModalOpen} handleClose={() => setEditModalOpen(false)}>
        <ArrivalForm
          initialData={arrival || undefined}
          onSuccess={() => {
            setEditModalOpen(false)
          }}
        />
      </Modal>

      <ConfirmationModal
        open={confirmDeleteModalOpen}
        entityName="эту поставку"
        actionType="delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteModalOpen(false)}
      />

      <Container maxWidth="md">
        <Card className="mx-auto bg-white shadow-lg rounded-lg p-6">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigateBack()}>
            <IconButton >
              <ArrowBack />
            </IconButton>
            <Typography variant="caption" className="!text-sm">
              Поставки
            </Typography>
          </Box>
          <Box className="flex flex-wrap gap-5 items-start mt-3 mb-5">
            <Box>
              <Typography variant="h5" className="!font-bold">Детали поставки #{arrival.arrivalNumber}</Typography>
              <Typography variant="h6" >{arrival.stock.name}</Typography>
              <Typography variant="caption" className="text-gray-600 text-sm">Создана: {dayjs(arrival.arrival_date).format('D MMMM YYYY')}
              </Typography>
            </Box>
            <Chip label={arrival.arrival_status} color={getArrivalStatusColor(arrival.arrival_status)}  sx={{
              borderRadius: '4px',
              height: '28px',
            }}
            variant="outlined" />
            <Box className="ml-auto flex flex-col items-center !self-end !me-10">
              <Typography className="!text-xs">Заказчик</Typography>
              <Typography component={Link} to={`/clients/${ arrival.client._id }`} target="_blank" className="!font-bold underline underline-offset-4">{arrival.client.name}</Typography>
              <Typography className="!font-light !mb-3">{arrival.client.phone_number}</Typography>

              {arrival.shipping_agent && (
                <>
                  <Typography className="!text-xs">Контрагент</Typography>
                  <Typography component={Link} to={'/counterparties'} target="_blank" className="!font-bold underline underline-offset-4">{arrival.shipping_agent.name}</Typography>
                  <Typography className="!font-light">{arrival.shipping_agent.phone_number}</Typography>
                </>
              )}
            </Box>
          </Box>

          <Box>
            <Stepper  activeStep={activeStep} alternativeLabel>
              {ArrivalStatus.map((label, index) => (
                <Step key={index}>
                  <StepLabel
                    optional={<span style={{ fontSize: '12px', color: '#888' }}>{getStepDescription(index)}</span>}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper >
          </Box>

          <Divider className="!mt-10 !mb-4 !mx-40 uppercase text-l font-bold text-gray-600">Товары</Divider>

          <Tabs value={productsTab} onChange={(_, newValue) => setProductsTabs(newValue)} className="mt-4">
            <Tab label="Отправленные" />
            <Tab label="Полученные" />
          </Tabs>

          <Box className="mt-2 rounded-lg">
            {productsTab === 0 ? (
              <ProductsTable products={arrival.products} />
            ) : (
              <ProductsTable products={arrival.received_amount} />
            )}
          </Box>

          <Divider className="!mt-10 !mb-4 !mx-40 uppercase text-l font-bold text-gray-600">Дополнительно</Divider>

          <Tabs value={infoTab} onChange={(_, newValue) => setInfoTab(newValue)} className="mt-6">
            <Tab label="Дефекты" />
            <Tab label="История" />
            <Tab label="Документы" />
          </Tabs>
          <Box className="mt-4">
            {infoTab === 0 ? (
              <DefectsTable defects={arrival.defects} />
            ) : infoTab === 1 ? (
              <LogsTable logs={arrival.logs || []} />
            ) : (
              <Box  className="flex gap-3 items-center">
                {arrival?.documents?.length ? (
                  arrival.documents.map((doc, index) => (
                    <Link
                      key={index}
                      to={doc.document}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 hover:text-blue-500"
                    >
                      <InsertDriveFileIcon fontSize="large" color="primary" />
                      <Typography variant="caption" className="!text-sm !truncate !w-40">{basename(doc.document)}</Typography>
                    </Link>
                  ))
                ) : null}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button
              type={'button'}
              variant="contained"
              startIcon={<EditOutlined />}
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
              }}
              onClick={() => setEditModalOpen(true)}
            >
              Редактировать
            </Button>
            <Button
              type={'button'}
              variant="contained"
              color="error"
              startIcon={<DeleteOutline />}
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
              }}
              onClick={() => setConfirmDeleteModalOpen(true)}
            >
              Удалить
            </Button>
          </Box>
        </Card>
      </Container>
    </>
  )
}

export default ArrivalDetails

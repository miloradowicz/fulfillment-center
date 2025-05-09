import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid2 as Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { ArrowBack, DeleteOutline, EditOutlined, ExpandMore } from '@mui/icons-material'
import ClientInfoItem from '../../clients/components/ClientInfoItem'
import ArrivalProductItem from '../components/ArrivalProductItem'
import ArrivalDetailsTextItem from '../components/ArrivalDetailsTextItem'
import dayjs from 'dayjs'
import useArrivalDetails from '../hooks/useArrivalDetails'
import Modal from '../../../components/UI/Modal/Modal'
import ArrivalForm from '../components/ArrivalForm.tsx'

const ArrivalDetails = () => {
  const {
    arrival,
    loading,
    confirmDeleteModalOpen,
    isDeleted,
    navigateBack,
    showConfirmDeleteModal,
    hideConfirmDeleteModal,
    handleDelete,
    editModalOpen,
    setEditModalOpen,
  } = useArrivalDetails()

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

      <Modal open={confirmDeleteModalOpen} handleClose={hideConfirmDeleteModal}>
        <Grid container direction="column">
          <Grid mb={4}>
            <Typography variant="h6" gutterBottom>
              Вы действительно хотите удалить поставку?
            </Typography>
          </Grid>
          <Grid>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Удалить
              </Button>
              <Button variant="outlined" onClick={hideConfirmDeleteModal}>
                Отмена
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Modal>
      <Container maxWidth="lg">
        <Box sx={{ mx: 'auto', p: { xs: 1, md: 3 } }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigateBack()}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight={700}>
              Назад
            </Typography>
          </Box>

          {!loading && !arrival ? (
            <Typography>Поставка не найдена</Typography>
          ) : isDeleted ? (
            <Typography>Поставка удалена</Typography>
          ) : (
            <Card
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 3,
                boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid>
                    <ClientInfoItem loading={loading} label="Имя клиента" value={arrival?.client?.name || '—'} />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid>
                    <ClientInfoItem loading={loading} label="Склад" value={arrival?.stock.name || '—'} />
                  </Grid>
                </Grid>
              </Box>

              {arrival?.shipping_agent ?
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid>
                      <ClientInfoItem loading={loading} label="Компания-перевозчик" value={arrival?.shipping_agent.name} />
                    </Grid>
                  </Grid>
                </Box> : null}

              {arrival?.pickup_location ?
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid>
                      <ClientInfoItem loading={loading} label="Адрес доставки" value={arrival?.pickup_location} />
                    </Grid>
                  </Grid>
                </Box> : null}

              <Divider sx={{ my: 3 }} />

              <ArrivalDetailsTextItem label="Цена" value={arrival?.arrival_price} loading={loading} />
              <ArrivalDetailsTextItem label="Статус" value={arrival?.arrival_status} loading={loading} />
              {arrival?.arrival_date && (
                <ArrivalDetailsTextItem
                  label="Дата поставки"
                  value={dayjs(arrival.arrival_date).format('DD.MM.YYYY')}
                  loading={loading}
                />
              )}
              <ArrivalDetailsTextItem label="Отправлено" value={arrival?.sent_amount} loading={loading} />

              <Divider sx={{ my: 3 }} />

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Товары</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {arrival?.products?.map((x, i) => (
                      <Grid key={i}>
                        <ArrivalProductItem product={x} loading={loading} />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {arrival?.defects?.length ? (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Брак</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {arrival?.defects?.map((x, i) => (
                        <Grid key={i}>
                          <ArrivalProductItem product={x} loading={loading} />
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ) : null}

              {arrival?.received_amount?.length ? (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Получено</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {arrival?.received_amount?.map((x, i) => (
                        <Grid key={i}>
                          <ArrivalProductItem product={x} loading={loading} />
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ) : null}

              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Button
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
                  variant="contained"
                  color="error"
                  startIcon={<DeleteOutline />}
                  sx={{
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                  onClick={showConfirmDeleteModal}
                >
                  Удалить
                </Button>
              </Box>
            </Card>
          )}
        </Box>
      </Container>
    </>
  )
}

export default ArrivalDetails

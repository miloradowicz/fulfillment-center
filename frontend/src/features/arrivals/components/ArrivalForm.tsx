import Grid from '@mui/material/Grid2'
import { Button, CircularProgress, Divider, InputLabel, TextField, Typography } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import ItemsList from './ItemsList.tsx'
import { ArrivalData, useArrivalForm } from '../hooks/useArrivalForm.ts'
import { Defect, ProductArrival } from '../../../types'
import { initialItemState } from '../state/arrivalState.ts'
import { getFieldError } from '../../../utils/getFieldError.ts'
import { inputChangeHandler } from '../../../utils/inputChangeHandler.ts'
import React from 'react'
import { getProductNameById } from '../../../utils/getProductName.ts'
import { getItemNameById } from '../../../utils/getItemNameById.ts'

interface Props {
  initialData?: ArrivalData | undefined
  onSuccess?: () => void
}

const ArrivalForm: React.FC<Props> = ({ initialData, onSuccess }) => {
  const {
    products,
    isLoading,
    form,
    setForm,
    newItem,
    setNewItem,
    errors,
    productsForm,
    setProductsForm,
    receivedForm,
    setReceivedForm,
    defectsForm,
    setDefectForm,
    productsModalOpen,
    setProductsModalOpen,
    receivedModalOpen,
    setReceivedModalOpen,
    defectsModalOpen,
    setDefectsModalOpen,
    openModal,
    addItem,
    deleteItem,
    handleBlur,
    error,
    submitFormHandler,
    status,
    clients,
    stocks,
    availableItem,
    counterparties,
  } = useArrivalForm(initialData, onSuccess)

  return (
    <form onSubmit={submitFormHandler}>
      <Grid container direction="column" spacing={2} sx={{ maxWidth: '500px', margin: 'auto' }}>
        {isLoading ? (
          <Grid sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Grid>
        ) : null}

        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
          {initialData ? 'Редактировать данные поставки' : 'Добавить новую поставку'}
        </Typography>

        <Grid>
          <Autocomplete
            id="client"
            value={getItemNameById(clients, 'name', '_id').find(option => option.id === form.client) || null}
            onChange={(_, newValue) => setForm(prevState => ({ ...prevState, client: newValue?.id || '' }))}
            size="small"
            fullWidth
            disablePortal
            options={getItemNameById(clients, 'name', '_id')}
            getOptionKey={option => option.id}
            sx={{ width: '100%' }}
            renderInput={params => (
              <TextField
                {...params}
                label="Клиент"
                error={Boolean(errors.client || getFieldError('client', error))}
                helperText={errors.client || getFieldError('client', error)}
                onBlur={e => handleBlur('client', e.target.value)}
              />
            )}
          />
        </Grid>

        <Grid>
          <Autocomplete
            id="stock"
            value={getItemNameById(stocks, 'name', '_id').find(option => option.id === form.stock) || null}
            onChange={(_, newValue) => setForm(prevState => ({ ...prevState, stock: newValue?.id || '' }))}
            size="small"
            fullWidth
            disablePortal
            options={getItemNameById(stocks, 'name', '_id')}
            getOptionKey={option => option.id}
            sx={{ width: '100%' }}
            renderInput={params => (
              <TextField
                {...params}
                label="Склад, на который прибыла поставка"
                error={Boolean(errors.stock || getFieldError('stock', error))}
                helperText={errors.stock || getFieldError('stock', error)}
                onBlur={e => handleBlur('stock', e.target.value)}
              />
            )}
          />
        </Grid>

        <Grid>
          <Autocomplete
            id="shipping_agent"
            value={
              getItemNameById(counterparties, 'name', '_id').find(option => option.id === form.shipping_agent) || null
            }
            onChange={(_, newValue) => {
              const value = newValue?.id || ''
              setForm(prevState => ({
                ...prevState,
                shipping_agent: value,
              }))
            }}
            size="small"
            fullWidth
            disablePortal
            options={getItemNameById(counterparties, 'name', '_id')}
            getOptionKey={option => option.id}
            sx={{ width: '100%' }}
            renderInput={params => <TextField {...params} label="Компания-перевозчик" />}
          />
        </Grid>

        <Grid>
          <TextField
            id="pickup_location"
            name="pickup_location"
            label="Адрес доставки"
            value={form.pickup_location}
            onChange={e => inputChangeHandler(e, setForm)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid>
          <TextField
            type="number"
            id="arrival_price"
            name="arrival_price"
            label="Цена доставки"
            value={form.arrival_price || ''}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                arrival_price: Number(e.target.value),
              }))
            }
            size="small"
            error={Boolean(errors.arrival_price || getFieldError('arrival_price', error))}
            helperText={errors.arrival_price || getFieldError('arrival_price', error)}
            onBlur={e => handleBlur('arrival_price', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid>
          <Autocomplete
            id="arrival_status"
            value={ form.arrival_status && status.includes(form.arrival_status) ? form.arrival_status : null}
            onChange={(_, newValue) => setForm(prevState => ({ ...prevState, arrival_status: newValue || '' }))}
            size="small"
            fullWidth
            disablePortal
            options={status}
            sx={{ width: '100%' }}
            renderInput={params => (
              <TextField
                {...params}
                label="Статус доставки"
                error={Boolean(errors.arrival_status || getFieldError('arrival_status', error))}
                helperText={errors.arrival_status || getFieldError('arrival_status', error)}
              />
            )}
          />
        </Grid>

        <Grid>
          <InputLabel htmlFor="arrival_date" style={{ fontSize: '15px', marginLeft: '12px' }}>
            Дата прибытия
          </InputLabel>
          <TextField
            id="arrival_date"
            name="arrival_date"
            size={'small'}
            type="date"
            value={form.arrival_date}
            onChange={e => inputChangeHandler(e, setForm)}
            error={Boolean(errors.arrival_date || getFieldError('arrival_date', error))}
            helperText={errors.arrival_date || getFieldError('arrival_date', error)}
            onBlur={e => handleBlur('arrival_date', e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid>
          <TextField
            id="sent_amount"
            name="sent_amount"
            label="Количество отправленного товара (шт/мешков/коробов)"
            value={form.sent_amount}
            onChange={e => inputChangeHandler(e, setForm)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid>
          <Typography fontWeight="bold">Отправленные товары</Typography>
          <ItemsList
            items={productsForm}
            onDelete={i => deleteItem(i, setProductsForm)}
            getProductNameById={i => getProductNameById(products, i)}
          />
          <Button type="button" onClick={() => openModal('products', initialItemState)}>
            + Добавить товары
          </Button>
        </Grid>

        {productsModalOpen && (
          <Grid>
            <Typography sx={{ marginBottom: '15px' }}>Укажите товары</Typography>
            <Autocomplete
              fullWidth
              size="small"
              disablePortal
              options={products ?? []}
              onChange={(_, newValue) => {
                if (newValue) {
                  setNewItem(prev => ({ ...prev, product: newValue._id }))
                }
              }}
              getOptionLabel={option => `${ option.title }. Артикул: ${ option.article }`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Товар"
                  error={Boolean(errors.product || getFieldError('product', error))}
                  helperText={errors.product || getFieldError('product', error)}
                  onBlur={e => handleBlur('product', e.target.value)}
                />
              )}
              sx={{ marginBottom: '15px' }}
            />

            <TextField
              type="number"
              fullWidth
              size="small"
              name="amount"
              label="Количество товара"
              value={newItem.amount || ''}
              onChange={e => setNewItem(prev => ({ ...prev, amount: +e.target.value }))}
              error={Boolean(errors.amount || getFieldError('amount', error))}
              helperText={errors.amount || getFieldError('amount', error)}
              onBlur={e => handleBlur('amount', e.target.value)}
              sx={{ marginBottom: '15px' }}
            />

            <TextField
              label="Описание товара"
              fullWidth
              size="small"
              name="description"
              value={(newItem as ProductArrival).description || ''}
              onChange={e =>
                setNewItem(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              sx={{ marginBottom: '15px' }}
            />

            <Grid container spacing={2}>
              <Button type="button" variant="outlined" onClick={() => addItem('products')}>
                Добавить
              </Button>

              <Button type="button" variant="outlined" onClick={() => setProductsModalOpen(false)}>
                Закрыть
              </Button>
            </Grid>
          </Grid>
        )}

        <Grid>
          <Divider sx={{ width: '100%', marginBottom: '15px' }} />
          <Typography fontWeight="bold">Полученные товары</Typography>
          <ItemsList
            items={receivedForm}
            onDelete={i => deleteItem(i, setReceivedForm)}
            getProductNameById={i => getProductNameById(products, i)}
          />
          <Button type="button" onClick={() => openModal('received_amount', initialItemState)}>
            + Добавить полученные товары
          </Button>
        </Grid>

        {receivedModalOpen && (
          <Grid>
            <Typography sx={{ marginBottom: '15px' }}>Укажите полученные товары</Typography>
            <Autocomplete
              fullWidth
              size="small"
              disablePortal
              options={availableItem ?? []}
              onChange={(_, newValue) => {
                if (newValue) {
                  setNewItem(prev => ({ ...prev, product: newValue._id }))
                }
              }}
              getOptionLabel={option => `${ option.title }. Артикул: ${ option.article }`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Товар"
                  error={Boolean(errors.product || getFieldError('product', error))}
                  helperText={errors.product || getFieldError('product', error)}
                  onBlur={e => handleBlur('product', e.target.value)}
                />
              )}
              sx={{ marginBottom: '15px' }}
            />

            <TextField
              type="number"
              fullWidth
              size="small"
              name="amount"
              label="Количество товара"
              value={newItem.amount || ''}
              onChange={e => setNewItem(prev => ({ ...prev, amount: +e.target.value }))}
              error={Boolean(errors.amount || getFieldError('amount', error))}
              helperText={errors.amount || getFieldError('amount', error)}
              onBlur={e => handleBlur('amount', e.target.value)}
              sx={{ marginBottom: '15px' }}
            />

            <TextField
              label="Описание товара"
              fullWidth
              size="small"
              name="description"
              value={(newItem as ProductArrival).description || ''}
              onChange={e =>
                setNewItem(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              sx={{ marginBottom: '15px' }}
            />

            <Grid container spacing={2}>
              <Button type="button" variant="outlined" onClick={() => addItem('received_amount')}>
                Добавить
              </Button>

              <Button type="button" variant="outlined" onClick={() => setReceivedModalOpen(false)}>
                Закрыть
              </Button>
            </Grid>
          </Grid>
        )}

        <Grid>
          <Divider sx={{ width: '100%', marginBottom: '15px' }} />
          <Typography fontWeight="bold">Дефекты</Typography>
          <ItemsList
            items={defectsForm}
            onDelete={i => deleteItem(i, setDefectForm)}
            getProductNameById={i => getProductNameById(products, i)}
          />
          <Button type="button" onClick={() => openModal('defects', initialItemState)}>
            + Добавить дефекты
          </Button>
        </Grid>

        {defectsModalOpen && (
          <Grid>
            <Typography sx={{ marginBottom: '15px' }}>Укажите дефекты</Typography>
            <Autocomplete
              fullWidth
              size="small"
              disablePortal
              options={availableItem ?? []}
              onChange={(_, newValue) => {
                if (newValue) {
                  setNewItem(prev => ({ ...prev, product: newValue._id }))
                }
              }}
              getOptionLabel={option => `${ option.title }. Артикул: ${ option.article }`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Товар"
                  error={Boolean(errors.product || getFieldError('product', error))}
                  helperText={errors.product || getFieldError('product', error)}
                  onBlur={e => handleBlur('product', e.target.value)}
                />
              )}
              sx={{ marginBottom: '15px' }}
            />

            <TextField
              type="number"
              fullWidth
              size="small"
              label="Количество дефектного товара"
              name="amount"
              value={newItem.amount || ''}
              onChange={e => setNewItem(prev => ({ ...prev, amount: +e.target.value }))}
              error={Boolean(errors.amount || getFieldError('amount', error))}
              helperText={errors.amount || getFieldError('amount', error)}
              onBlur={e => handleBlur('amount', e.target.value)}
              sx={{ marginBottom: '15px' }}
            />

            <TextField
              label="Описание дефекта"
              fullWidth
              size="small"
              name="defect_description"
              value={(newItem as Defect).defect_description || ''}
              onChange={e =>
                setNewItem(prev => ({
                  ...prev,
                  defect_description: e.target.value,
                }))
              }
              error={Boolean(errors.defect_description || getFieldError('defect_description', error))}
              helperText={errors.defect_description || getFieldError('defect_description', error)}
              onBlur={e => handleBlur('defect_description', e.target.value)}
              sx={{ marginBottom: '15px' }}
            />

            <Grid container spacing={2}>
              <Button type="button" variant="outlined" onClick={() => addItem('defects')}>
                Добавить
              </Button>

              <Button type="button" variant="outlined" onClick={() => setDefectsModalOpen(false)}>
                Закрыть
              </Button>
            </Grid>
          </Grid>
        )}

        <Grid>
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : initialData ? (
              'Обновить поставку'
            ) : (
              'Создать поставку'
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default ArrivalForm

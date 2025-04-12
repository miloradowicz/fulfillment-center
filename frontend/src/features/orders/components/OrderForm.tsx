import Grid from '@mui/material/Grid2'
import {
  Autocomplete,
  Button,
  CircularProgress,
  Divider,
  FormControl, IconButton,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { inputChangeHandler } from '@/utils/inputChangeHandler.ts'
import { getFieldError } from '@/utils/getFieldError.ts'
import { useOrderForm } from '../hooks/useOrderForm.ts'
import React from 'react'
import { ErrorMessagesList } from '@/messages.ts'
import { OrderStatus } from '@/constants.ts'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { getAutocompleteItemName } from '@/utils/getAutocompleteItemName.ts'

interface Props {
  onSuccess?: () => void
  handleClose?: () => void
}

const OrderForm: React.FC<Props> = ({ onSuccess }) => {
  const {
    form,
    setForm,
    productsForm,
    defectForm,
    newField,
    setNewField,
    newFieldDefects,
    setNewFieldDefects,
    modalOpen,
    modalOpenDefects,
    isButtonDefectVisible,
    isButtonVisible,
    errors,
    setErrors,
    loading,
    createError,
    clients,
    availableProducts,
    loadingFetchClient,
    handleBlur,
    handleBlurAutoComplete,
    handleButtonClick,
    handleButtonDefectClick,
    handleCloseModal,
    handleCloseDefectModal,
    deleteProduct,
    deleteDefect,
    addArrayProductInForm,
    addArrayDefectInForm,
    onSubmit,
    initialData,
    availableDefects,
    files,
    handleFileChange,
    stocks,
  } = useOrderForm(onSuccess)

  return (
    <>
      {loadingFetchClient ? (
        <CircularProgress />
      ) : (
        <form onSubmit={onSubmit}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {initialData ? 'Редактировать данные заказа' : 'Добавить новый заказ'}
          </Typography>
          <Grid container direction="column" spacing={2}>
            {clients && clients?.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <Autocomplete
                    size={'small'}
                    fullWidth
                    disablePortal
                    options={clients}
                    getOptionKey={option => option._id}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        setForm(prevState => ({ ...prevState, client: newValue._id }))
                      }
                    }}
                    value={clients.find(option => option._id === form.client) || null}
                    getOptionLabel={option => option.name || ''}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Клиент"
                        error={Boolean(errors.client || getFieldError('client', createError))}
                        helperText={errors.client || getFieldError('client', createError)}
                        onBlur={() => handleBlurAutoComplete('client', setErrors, form, ErrorMessagesList.ClientErr)}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            )}

            <Grid>
              <Autocomplete
                id="stock"
                value={getAutocompleteItemName(stocks, 'name', '_id').find(option => option.id === form.stock) || null}
                onChange={(_, newValue) => setForm(prevState => ({ ...prevState, stock: newValue?.id || '' }))}
                size="small"
                fullWidth
                disablePortal
                options={getAutocompleteItemName(stocks, 'name', '_id')}
                getOptionKey={option => option.id}
                sx={{ width: '100%' }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Склад, с которого будет отправлен товар"
                    error={Boolean(errors.stock || getFieldError(ErrorMessagesList.StockErr, createError))}
                    helperText={errors.stock || getFieldError(ErrorMessagesList.StockErr, createError)}
                    onBlur={() => handleBlurAutoComplete('stock', setErrors, form, ErrorMessagesList.StockErr)}
                  />
                )}
              />
            </Grid>

            <>
              <label className={'fs-4 my-1'}>Товары</label>
              {productsForm.length === 0 ? (
                <Typography>В заказе отсутствуют товары</Typography>
              ) : (
                <>
                  {productsForm.map((product, i) => (
                    <Grid
                      style={{ border: '1px solid lightgrey', borderRadius: '5px' }}
                      padding={'5px'}
                      fontSize={'15px'}
                      display={'flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                      key={product.product._id + i}
                    >
                      <Grid style={{ textTransform: 'capitalize' }}>
                        {product.product.title}{' '}
                        <Typography fontSize={'15px'} fontWeight={'bolder'}>
                          aртикул: {product.product.article}
                        </Typography>{' '}
                        {product.amount} шт
                      </Grid>
                      <Button
                        type={'button'}
                        onClick={() => {
                          deleteProduct(i)
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </Grid>
                  ))}
                </>
              )}
            </>

            <Grid>
              <Grid>
                {isButtonVisible && (
                  <Button type="button" className={'btn d-block w-50 mx-auto text-center'} onClick={handleButtonClick}>
                    + Добавить товар
                  </Button>
                )}
              </Grid>
            </Grid>

            {modalOpen && availableProducts && (
              <Grid size={{ xs: 12 }}>
                <Typography style={{ marginBottom: '10px' }}>Добавить товар</Typography>
                <Autocomplete
                  style={{ marginBottom: '10px' }}
                  fullWidth
                  size={'small'}
                  disablePortal
                  options={availableProducts}
                  getOptionKey={option => option._id}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setNewField(prevState => ({ ...prevState, product: newValue._id }))
                    }
                  }}
                  getOptionLabel={option => `${ option.title }   артикул: ${ option.article }`}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Товар"
                      required={true}
                      error={Boolean(errors.product || getFieldError('product', createError))}
                      helperText={errors.product || getFieldError('product', createError)}
                      onBlur={() => handleBlurAutoComplete('product', setErrors, newField, ErrorMessagesList.ProductErr)}
                    />
                  )}
                />
                <TextField
                  fullWidth
                  size={'small'}
                  label="количество товара"
                  style={{ marginBottom: '10px' }}
                  type="number"
                  name={'amount'}
                  required={true}
                  value={newField.amount || ''}
                  onChange={e => setNewField({ ...newField, amount: Number(e.target.value) })}
                  error={Boolean(errors.amount || getFieldError('amount', createError))}
                  helperText={errors.amount || getFieldError('amount', createError)}
                  onBlur={handleBlur}
                />
                <TextField
                  label="описание товара"
                  fullWidth
                  size={'small'}
                  style={{ marginBottom: '10px' }}
                  type="text"
                  value={newField.description}
                  onChange={e => setNewField({ ...newField, description: e.target.value })}
                />
                <Button type={'button'} onClick={addArrayProductInForm}>
                  Добавить товар в заказ
                </Button>
                <Button type={'button'} onClick={handleCloseModal}>
                  Закрыть
                </Button>
              </Grid>
            )}

            <Grid>
              <TextField
                id="price"
                name="price"
                size={'small'}
                type={'number'}
                label="Сумма заказа"
                value={form.price || ''}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                error={Boolean(errors.price || getFieldError('price', createError))}
                helperText={errors.price || getFieldError('price', createError)}
                fullWidth
                onBlur={handleBlur}
              />
            </Grid>

            <Grid>
              <InputLabel htmlFor="sent_at" style={{ fontSize: '15px', marginLeft: '12px' }}>
                Дата отправки
              </InputLabel>
              <TextField
                id="sent_at"
                name="sent_at"
                size={'small'}
                type="date"
                value={form.sent_at}
                onChange={e => inputChangeHandler(e, setForm)}
                error={Boolean(errors.sent_at || getFieldError('sent_at', createError))}
                helperText={errors.sent_at || getFieldError('sent_at', createError)}
                onBlur={handleBlur}
                fullWidth
              />
            </Grid>

            <Grid>
              <InputLabel htmlFor="delivered_at" style={{ fontSize: '15px', marginLeft: '12px' }}>
                Дата доставки
              </InputLabel>
              <TextField
                id="delivered_at"
                name="delivered_at"
                size={'small'}
                value={form.delivered_at}
                type="date"
                onChange={e => inputChangeHandler(e, setForm)}
                fullWidth
              />
            </Grid>
            <Grid container direction="column" spacing={2}>
              {OrderStatus && OrderStatus?.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <Autocomplete
                      size={'small'}
                      fullWidth
                      disablePortal
                      options={OrderStatus}
                      onChange={(_, newValue) => {
                        if (newValue) {
                          setForm(prevState => ({ ...prevState, status: newValue || '' }))
                        }
                      }}
                      value={OrderStatus.find(option => option === form.status) || null}
                      getOptionLabel={option => option || ''}
                      isOptionEqualToValue={(option, value) => option === value}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="Статус заказа"
                          error={Boolean(errors.status || getFieldError('status', createError))}
                          helperText={errors.status || getFieldError('status', createError)}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
              )}{' '}
            </Grid>
            <Grid>
              <TextField
                id="comment"
                size={'small'}
                name="comment"
                label="Комментарий"
                value={form.comment}
                onChange={e => inputChangeHandler(e, setForm)}
                fullWidth
              />
            </Grid>
            <>
              <label className={'fs-4 my-1'}>Дефекты товаров</label>
              {productsForm.length === 0 ? (
                <Typography>В заказе отсутствуют дефекты</Typography>
              ) : (
                <>
                  {' '}
                  {defectForm.map((defect, i) => (
                    <Grid
                      style={{ border: '1px solid lightgrey', borderRadius: '5px' }}
                      padding={'5px'}
                      fontSize={'15px'}
                      display={'flex'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                      key={defect.product._id + i}
                    >
                      <Grid style={{ textTransform: 'capitalize' }}>
                        {defect.product.title}{' '}
                        <Typography fontSize={'15px'} fontWeight={'bolder'}>
                          aртикул: {defect.product.article}
                        </Typography>
                        <Typography fontSize={'15px'}> {defect.defect_description}</Typography> {defect.amount} шт
                      </Grid>
                      <Button
                        type={'button'}
                        onClick={() => {
                          deleteDefect(i)
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </Grid>
                  ))}
                </>
              )}
            </>

            <Grid>
              <Grid>
                {isButtonDefectVisible && (
                  <Button
                    type="button"
                    className={'btn d-block w-50 mx-auto text-center'}
                    onClick={handleButtonDefectClick}
                  >
                    + Добавить дефекты
                  </Button>
                )}
              </Grid>
            </Grid>

            {modalOpenDefects && availableProducts && (
              <Grid size={{ xs: 12 }}>
                <Typography style={{ marginBottom: '10px' }}>Добавить дефекты товаров</Typography>
                <Autocomplete
                  style={{ marginBottom: '10px' }}
                  fullWidth
                  size={'small'}
                  disablePortal
                  options={availableDefects}
                  getOptionKey={option => option._id}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setNewFieldDefects(prevState => ({ ...prevState, product: newValue._id }))
                    }
                  }}
                  getOptionLabel={option => `${ option.title }   артикул: ${ option.article }`}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Товар"
                      error={Boolean(errors.product || getFieldError('product', createError))}
                      helperText={errors.product || getFieldError('product', createError)}
                      onBlur={() => handleBlurAutoComplete('product', setErrors, newFieldDefects, ErrorMessagesList.ProductErr)}
                    />
                  )}
                />
                <TextField
                  fullWidth
                  size={'small'}
                  label="количество дефектного товара"
                  style={{ marginBottom: '10px' }}
                  type="number"
                  error={Boolean(errors.amount || getFieldError('amount', createError))}
                  name={'amount'}
                  helperText={errors.amount || getFieldError('amount', createError)}
                  onBlur={handleBlur}
                  value={newFieldDefects.amount || ''}
                  onChange={e => setNewFieldDefects({ ...newFieldDefects, amount: Number(e.target.value) })}
                />
                <TextField
                  label="описание дефекта товара"
                  fullWidth
                  size={'small'}
                  style={{ marginBottom: '10px' }}
                  type="text"
                  name={'defect_description'}
                  error={Boolean(errors.defect_description || getFieldError('defect_description', createError))}
                  helperText={errors.defect_description || getFieldError('defect_description', createError)}
                  onBlur={handleBlur}
                  value={newFieldDefects.defect_description}
                  onChange={e => setNewFieldDefects({ ...newFieldDefects, defect_description: e.target.value })}
                />
                <Button type={'button'} onClick={addArrayDefectInForm}>
                  Добавить дефект в заказ
                </Button>
                <Button type={'button'} onClick={handleCloseDefectModal}>
                  Закрыть
                </Button>
              </Grid>
            )}

            {initialData && (<> <Divider sx={{ width: '100%', marginBottom: '10px' }} />
              <Typography style={{ marginBottom: '10px' }}>Документы</Typography></>)}
            {initialData && initialData.documents && initialData.documents.length > 0 && (initialData.documents.map((document, index) => (
              <><Typography style={{ textAlign: 'left' }} key={index} variant="body2">{document.document.split('/').pop()}</Typography>
                <Divider sx={{ width: '100%', marginBottom: '10px' }} /></>
            )))}

            <Grid className="flex gap-2 content-between items-center">
              <Typography>Загрузить документ</Typography>
              <Grid sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton component="label">
                  <InsertDriveFileIcon fontSize="large" color="primary" />
                  <input type="file" accept=".pdf, .doc, .docx, .xlsx" multiple hidden onChange={handleFileChange} />
                </IconButton>
                {files.length > 0 && (
                  <Grid sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>

                    {files.map((file, index) => (
                      <Typography key={index} variant="body2">{file.name}</Typography>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : initialData ? (
                  'Обновить заказ'
                ) : (
                  'Создать заказ'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </>
  )
}
export default OrderForm

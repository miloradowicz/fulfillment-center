import { Box, Card, CircularProgress, Divider, Typography, IconButton } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import useProductActions from '../hooks/useProductActions.ts'
import Modal from '@/components/Modal/Modal.tsx'
import ProductForm from '../components/ProductForm.tsx'
import EditButton from '@/components/Buttons/EditButton.tsx'
import ArchiveButton from '@/components/Buttons/ArchiveButton.tsx'
import ConfirmationModal from '@/components/Modal/ConfirmationModal.tsx'

const ProductDetails = () => {
  const navigate = useNavigate()
  const {
    id,
    product,
    error,
    loading,
    open,
    handleClose,
    handleOpen,
    fetchProduct,
    confirmationOpen,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationArchive,
  } = useProductActions(false)

  return (
    <>
      <Modal handleClose={handleClose} open={open}>
        <ProductForm
          initialData={product || undefined}
          onSuccess={async () => {
            if (id) await fetchProduct(id)
            handleClose()
          }}
        />
      </Modal>

      <ConfirmationModal
        open={confirmationOpen}
        entityName="этот товар"
        actionType="archive"
        onConfirm={handleConfirmationArchive}
        onCancel={handleConfirmationClose}
      />

      <Box className="max-w-2xl mx-auto p-4 sm:p-8">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/products')}>
          <IconButton>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Товары
          </Typography>
        </Box>

        {error ? (
          <Box textAlign="center" mt={4}>
            <Typography color="error" variant="body1">
              Ошибка загрузки данных товара
            </Typography>
          </Box>
        ) : (
          <Card
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            {!product ? (
              <Box textAlign="center" mt={4}>
                <Typography variant="body1">Товар не найден</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <Typography variant="h6" fontWeight={600} className="text-center uppercase !mt-4">
                      {product.client.name}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2, mx: 4 }} />

                <Card className="!px-20 !py-4 !shadow-none">
                  <Typography variant="h5" fontWeight={600}>
                    {product.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Артикул:</strong> {product.article}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Штрихкод:</strong> {product.barcode}
                  </Typography>

                  {product.dynamic_fields.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Характеристики:
                      </Typography>
                      {product.dynamic_fields.map(field => (
                        <Typography key={field.key} variant="body1" color="text.secondary">
                          <strong>{field.label}:</strong> {field.value}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Card>

                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <EditButton onClick={() => handleOpen()} />
                  <ArchiveButton onClick={() => handleConfirmationOpen(product._id)} />
                </Box>
              </>
            )}
          </Card>
        )}
      </Box>
    </>
  )
}

export default ProductDetails

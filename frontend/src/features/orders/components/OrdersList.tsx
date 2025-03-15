import { OrderWithClient } from '../../../types'
import React from 'react'
import { Box, Chip, IconButton, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { NavLink } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import ClearIcon from '@mui/icons-material/Clear'
import { ruRU } from '@mui/x-data-grid/locales'
import dayjs from 'dayjs'

interface Props {
  orders: OrderWithClient[] | [];
  handleDelete: (id: string) => void
  onEdit: (data:OrderWithClient) => void
}

const OrdersList: React.FC<Props> = ({ orders, handleDelete, onEdit }) => {

  const columns: GridColDef<OrderWithClient>[] = [
    {
      field: 'client',
      headerName: 'Клиент',
      flex: 0.1,
      editable: false,
      filterable: true,
      valueGetter: (_value: string, row: OrderWithClient) => row.client.name },
    {
      field: 'sent_at',
      headerName: 'Отправлен',
      flex: 0.1,
      valueGetter: (_value: string, row: OrderWithClient) => new Date(row.sent_at),
      valueFormatter: row => dayjs(row).format('DD.MM.YYYY'),
    },
    {
      field: 'delivered_at',
      headerName: 'Доставлен',
      flex: 0.1,
      valueGetter: (_value: string, row: OrderWithClient) => new Date(row.delivered_at),
      valueFormatter: row => dayjs(row).format('DD.MM.YYYY'),
    },
    {
      field: 'price',
      headerName: 'Стоимость',
      flex: 0.1,
    },
    {
      field: 'defects',
      headerName: 'Дефекты',
      flex: 0.1,
      valueGetter: (_value: string, row: OrderWithClient) => row.defects.length,
      filterable: false,
    },
    {
      field: 'status',
      headerName: 'Статус',
      flex: 0.1,
      renderCell: ({ row }) => {
        const statusColors: Record<string, 'warning' | 'success' | 'info' | 'default'> = {
          'в сборке': 'warning',
          'доставлен': 'success',
          'в пути': 'info',
        }

        const status = row.status || 'В обработке'
        const capitalizeFirstLetter = (text: string) =>
          text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

        return <Chip label={capitalizeFirstLetter(status)} color={statusColors[status] ?? 'default'} />
      },
    },
    {
      field: 'products',
      headerName: 'Товаров',
      flex: 0.1,
      valueGetter: (_value: string, row: OrderWithClient) => row.products.length,
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.2,
      renderCell: ({ row } ) => (
        <>
          <IconButton onClick={() => {
            onEdit(row)
          }}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(row._id)}
          >
            <ClearIcon fontSize="inherit" />
          </IconButton>
          <NavLink className="text-gray-500 hover:text-gray-700 ml-2"
            to={`/orders/${ row._id }`}
          >
            Подробнее
          </NavLink>
        </>
      ),
    },
  ]

  return (
    <Box className="max-w-[1000px] mx-auto w-full">
      {orders ? (
        <DataGrid
          getRowId={row => row._id}
          rows={orders}
          columns={columns}
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      ) :
        (
          <Typography className="text-center mt-5">Заказы не найдены.</Typography>
        )
      }
    </Box>
  )
}

export default OrdersList

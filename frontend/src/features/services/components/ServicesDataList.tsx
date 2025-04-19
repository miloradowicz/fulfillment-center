import { ColumnDef } from '@tanstack/react-table'
import { PopulatedService, Service, ServiceCategory } from '@/types'
import SelectableColumn from '@/components/DataTable/SelectableColumn/SelectableColumn.tsx'
import DataTableColumnHeader from '@/components/DataTable/DataTableColumnHeader/DataTableColumnHeader.tsx'
import TableActionsMenu from '@/components/DataTable/TableActionsMenu/TableActionsMenu.tsx'
import DataTable from '@/components/DataTable/DataTable.tsx'
import ConfirmationModal from '@/components/Modal/ConfirmationModal.tsx'
import Modal from '@/components/Modal/Modal.tsx'
import ServiceForm from '@/features/services/components/ServiceForm.tsx'
import { useServiceActions } from '@/features/services/hooks/useServicesActions.ts'
import ServiceDetails from '@/features/services/components/ServiceDetails.tsx'

const ServicesDataList = () => {
  const {
    services,
    selectedService,
    open,
    handleOpen,
    handleClose,
    confirmationOpen,
    handleConfirmationOpen,
    handleConfirmationClose,
    handleConfirmationArchive,
    openDetailsModal,
    handleCloseDetailsModal,
  } = useServiceActions(true)

  const columns: ColumnDef<PopulatedService>[] = [
    {
      id: 'select',
      header: ({ table }) => SelectableColumn(table, 'header'),
      cell: ({ row }) => SelectableColumn(row, 'cell'),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Название" />,
      enableColumnFilter: true,
      enableHiding: false,
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'serviceCategory',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Категория" />,
      enableColumnFilter: true,
      enableHiding: false,
      cell: info => {
        const category = info.getValue() as ServiceCategory
        return category?.name || ''
      },
    },
    {
      accessorKey: 'price',
      header: 'Цена',
      enableColumnFilter: true,
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      enableColumnFilter: true,
      cell: info => info.getValue(),
    },
    {
      id: 'actions',
      header: 'Действия',
      enableGlobalFilter: false,
      enableHiding: false,
      cell: ({ row }) => {
        const tableService = row.original
        const service: Service = {
          ...tableService,
          serviceCategory: tableService.serviceCategory._id,
        }

        return (
          <TableActionsMenu<Service>
            row={service}
            handleOpen={handleOpen}
            handleConfirmationOpen={handleConfirmationOpen}
            showDetailsLink={true}
            detailsPathPrefix="services"
          />
        )
      },
    },
  ]

  return (
    <div className="max-w-[1000px] w-full mx-auto space-y-4">
      <DataTable columns={columns} data={[...(services ?? [])].reverse()} />

      <ConfirmationModal
        open={confirmationOpen}
        entityName="эту услугу"
        actionType="archive"
        onConfirm={handleConfirmationArchive}
        onCancel={handleConfirmationClose}
      />

      <Modal open={openDetailsModal} handleClose={handleCloseDetailsModal}>
        <ServiceDetails />
      </Modal>

      <Modal open={open} handleClose={handleClose}>
        <ServiceForm serviceId={selectedService?._id} onClose={handleClose} />
      </Modal>
    </div>
  )
}

export default ServicesDataList

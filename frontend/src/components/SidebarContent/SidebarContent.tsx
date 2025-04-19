import { NavLink } from 'react-router-dom'
import {
  ArchiveRestore,
  BookUser,
  ClipboardList,
  FileText,
  ListTodo,
  Package,
  Truck,
  Users,
  Warehouse,
  Settings,
} from 'lucide-react'
import React from 'react'

const links = [
  { to: '/admin', label: 'Админ-панель', icon: <Settings size={25} /> },
  { to: '/clients', label: 'Клиенты', icon: <Users size={25} /> },
  { to: '/products', label: 'Товары', icon: <Package size={25} /> },
  { to: '/arrivals', label: 'Поставки', icon: <Truck size={25} /> },
  { to: '/orders', label: 'Заказы', icon: <ClipboardList size={25} /> },
  { to: '/tasks', label: 'Задачи', icon: <ListTodo size={25} /> },
  { to: '/reports', label: 'Отчеты', icon: <FileText size={25} /> },
  { to: '/stocks', label: 'Склады', icon: <Warehouse size={25} /> },
  { to: '/counterparties', label: 'Контрагенты', icon: <BookUser size={25} /> },
  { to: '/archives', label: 'Архив', icon: <ArchiveRestore size={25} /> },
]

interface Props {
  onLinkClick: () => void
}

const SidebarContent: React.FC<Props> = ({ onLinkClick }) => {
  return (
    <nav className="flex flex-col gap-1 mt-4 px-2">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `w-full flex items-center gap-2 p-2 rounded-md transition-colors
             ${ isActive ? 'bg-ring/50 text-primary' : 'text-primary hover:bg-primary hover:text-card' }`
          }
        >
          {icon}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default SidebarContent

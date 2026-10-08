import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuthStore } from '../../stores/authStore'

export const AdminRoute: React.FC = () => {
  const { isAuthenticated } = useAdminAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export default AdminRoute

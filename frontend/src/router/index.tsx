import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import BottomNav from '../components/layout/BottomNav'
import { PageLoader } from '../components/ui/LoadingSpinner'
import AdminLayout from '../components/admin/AdminLayout'
import AdminRoute from '../components/admin/AdminRoute'

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('../pages/HomePage'))
const SearchPage = lazy(() => import('../pages/SearchPage'))
const MovieDetailPage = lazy(() => import('../pages/MovieDetailPage'))
const WatchPage = lazy(() => import('../pages/WatchPage'))
const MyMoviesPage = lazy(() => import('../pages/MyMoviesPage'))
const WalletPage = lazy(() => import('../pages/WalletPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))

// Admin pages
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminMoviesPage = lazy(() => import('../pages/admin/AdminMoviesPage'))
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'))
const AdminDepositsPage = lazy(() => import('../pages/admin/AdminDepositsPage'))
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'))

// Layout wrapper with bottom nav for user routes
function UserLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

// Protected route — redirects to '/' if not authenticated
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* User routes (with bottom nav) */}
        <Route element={<UserLayout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/watch/:movieId/:episodeId" element={<WatchPage />} />
            <Route path="/my-movies" element={<MyMoviesPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin routes (no bottom nav, own sidebar layout) */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/movies" element={<AdminMoviesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/deposits" element={<AdminDepositsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter

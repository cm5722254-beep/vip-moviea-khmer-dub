import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppRouter } from './router'
import { initTelegram } from './lib/telegram'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './stores/authStore'
import { PageLoader } from './components/ui/LoadingSpinner'

function App() {
  const [initializing, setInitializing] = useState(true)
  const { authenticate } = useAuth()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegram()

    // Attempt authentication
    const init = async () => {
      try {
        if (!isAuthenticated) {
          await authenticate()
        }
      } catch {
        // Auth failed — user can still browse free content
        // Don't block app load
      } finally {
        setInitializing(false)
      }
    }

    init()
  }, []) // run once on mount

  if (initializing) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <AppRouter />
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1a24',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: "'Noto Sans Khmer', 'Inter', sans-serif",
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  )
}

export default App

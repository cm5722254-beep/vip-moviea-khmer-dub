import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { queryClient } from './lib/queryClient'
import './index.css'

// Extend Window type to include the loader helper defined in index.html
declare global {
  interface Window {
    __hideLoader?: () => void
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)

// Hide the HTML splash screen once React has hydrated the root.
// The __hideLoader function is defined in index.html — it fades out
// and removes the #initial-loader div.
window.__hideLoader?.()

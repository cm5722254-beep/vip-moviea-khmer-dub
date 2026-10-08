import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@store': path.resolve(__dirname, './src/store'),
        '@api': path.resolve(__dirname, './src/api'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },

    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/v1': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 4173,
      host: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'ES2020',
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            ui: ['framer-motion', 'lucide-react', 'swiper'],
            player: ['react-player'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    // Optimize dependencies for faster startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
        'axios',
        'lucide-react',
        'framer-motion',
        'date-fns',
        'clsx',
        'tailwind-merge',
      ],
    },

    define: {
      // Expose build time
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  }
})

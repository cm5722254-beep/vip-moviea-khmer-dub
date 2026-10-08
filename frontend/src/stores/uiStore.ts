import { create } from 'zustand'

interface ModalConfig {
  type: string
  data?: unknown
}

interface UIState {
  // Global loading
  isGlobalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  // Page loading
  pageLoading: boolean
  setPageLoading: (loading: boolean) => void

  // Modal system
  activeModal: ModalConfig | null
  openModal: (type: string, data?: unknown) => void
  closeModal: () => void

  // Bottom sheet
  activeSheet: ModalConfig | null
  openSheet: (type: string, data?: unknown) => void
  closeSheet: () => void

  // Toast notifications
  toasts: Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>
  addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void
  removeToast: (id: string) => void

  // Purchase modal
  purchaseModalOpen: boolean
  purchaseTarget: { type: 'movie' | 'episode'; id: string } | null
  openPurchaseModal: (type: 'movie' | 'episode', id: string) => void
  closePurchaseModal: () => void

  // Deposit modal
  depositModalOpen: boolean
  openDepositModal: () => void
  closeDepositModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  pageLoading: false,
  setPageLoading: (loading) => set({ pageLoading: loading }),

  activeModal: null,
  openModal: (type, data) => set({ activeModal: { type, data } }),
  closeModal: () => set({ activeModal: null }),

  activeSheet: null,
  openSheet: (type, data) => set({ activeSheet: { type, data } }),
  closeSheet: () => set({ activeSheet: null }),

  toasts: [],
  addToast: (type, message) => {
    const id = Date.now().toString()
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }))
    // Auto remove after 4s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  purchaseModalOpen: false,
  purchaseTarget: null,
  openPurchaseModal: (type, id) =>
    set({ purchaseModalOpen: true, purchaseTarget: { type, id } }),
  closePurchaseModal: () =>
    set({ purchaseModalOpen: false, purchaseTarget: null }),

  depositModalOpen: false,
  openDepositModal: () => set({ depositModalOpen: true }),
  closeDepositModal: () => set({ depositModalOpen: false }),
}))

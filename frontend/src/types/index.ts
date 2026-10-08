// ============================================================
// Core Domain Types for អាធិរាជរឿង Telegram Mini App
// ============================================================

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

export interface User {
  id: string
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  isPremium: boolean
  balance: number
  status: 'active' | 'banned' | 'suspended'
  createdAt: string
  updatedAt: string
  purchasedMoviesCount?: number
}

export interface Category {
  id: string
  name: string
  nameKh: string
  slug: string
  icon?: string
  color?: string
  moviesCount?: number
  createdAt: string
}

export interface Movie {
  id: string
  title: string
  titleKh: string
  description?: string
  descriptionKh?: string
  posterUrl?: string
  bannerUrl?: string
  trailerUrl?: string
  price: number
  isFree: boolean
  isPublished: boolean
  isNew: boolean
  isPopular: boolean
  isFeatured: boolean
  year?: number
  duration?: number
  rating?: number
  language?: string
  subtitleLanguages?: string[]
  categoryId?: string
  category?: Category
  episodesCount?: number
  episodes?: Episode[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface Episode {
  id: string
  movieId: string
  movie?: Movie
  episodeNumber: number
  title: string
  titleKh?: string
  description?: string
  descriptionKh?: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  isFree: boolean
  isPublished: boolean
  subtitles?: Subtitle[]
  createdAt: string
  updatedAt: string
}

export interface Subtitle {
  id: string
  episodeId: string
  language: string
  languageCode: string
  url: string
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  totalDeposited: number
  totalSpent: number
  updatedAt: string
}

export type TransactionType =
  | 'deposit'
  | 'purchase'
  | 'refund'
  | 'bonus'
  | 'withdrawal'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  descriptionKh?: string
  referenceId?: string
  status: TransactionStatus
  createdAt: string
}

export type DepositMethod = 'aba' | 'acleda' | 'wing' | 'pipay' | 'manual'
export type DepositStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface Deposit {
  id: string
  userId: string
  user?: User
  method: DepositMethod
  amount: number
  status: DepositStatus
  proofUrl?: string
  note?: string
  adminNote?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export type PurchaseType = 'movie' | 'episode'

export interface Purchase {
  id: string
  userId: string
  movieId?: string
  movie?: Movie
  episodeId?: string
  episode?: Episode
  type: PurchaseType
  amount: number
  createdAt: string
}

export interface WatchProgress {
  id: string
  userId: string
  movieId: string
  episodeId: string
  movie?: Movie
  episode?: Episode
  currentTime: number
  duration: number
  percentage: number
  completed: boolean
  lastWatchedAt: string
  createdAt: string
  updatedAt: string
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SearchResult {
  movies: Movie[]
  total: number
  query: string
}

// ============================================================
// Admin Types
// ============================================================

export interface AdminUser {
  id: string
  username: string
  role: 'admin' | 'superadmin'
  createdAt: string
}

export interface AdminAuthResponse {
  token: string
  admin: AdminUser
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalMovies: number
  publishedMovies: number
  todaySales: number
  totalRevenue: number
  todayDeposits: number
  pendingDeposits: number
  totalTransactions: number
  recentTransactions: Transaction[]
}

export interface MovieFormData {
  title: string
  titleKh: string
  description?: string
  descriptionKh?: string
  price: number
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  isNew: boolean
  isPopular: boolean
  year?: number
  rating?: number
  language?: string
  categoryId?: string
  tags?: string[]
}

export interface EpisodeFormData {
  movieId: string
  episodeNumber: number
  title: string
  titleKh?: string
  description?: string
  videoUrl?: string
  isFree: boolean
  isPublished: boolean
}

// ============================================================
// UI Store Types
// ============================================================

export interface ModalState {
  isOpen: boolean
  type: string | null
  data: unknown
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

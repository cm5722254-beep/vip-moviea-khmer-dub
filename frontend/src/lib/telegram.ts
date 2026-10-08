// Telegram WebApp utilities for អាធិរាជរឿង
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      photo_url?: string
      is_premium?: boolean
    }
    auth_date: number
    hash: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive: boolean) => void
    hideProgress: () => void
  }
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  showPopup: (params: {
    title?: string
    message: string
    buttons?: Array<{ type: string; text: string; id?: string }>
  }, callback?: (buttonId: string) => void) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
  sendData: (data: string) => void
  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void
}

export const tg = window.Telegram?.WebApp

export const initTelegram = (): void => {
  tg?.ready()
  tg?.expand()
  tg?.setHeaderColor('#0a0a0f')
  tg?.setBackgroundColor('#0a0a0f')
}

export const getTelegramInitData = (): string => tg?.initData || ''

export const getTelegramUser = () => tg?.initDataUnsafe?.user

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy'): void => {
  tg?.HapticFeedback?.impactOccurred(type)
}

export const hapticNotification = (type: 'error' | 'success' | 'warning'): void => {
  tg?.HapticFeedback?.notificationOccurred(type)
}

export const hapticSelection = (): void => {
  tg?.HapticFeedback?.selectionChanged()
}

export const showTelegramAlert = (message: string, callback?: () => void): void => {
  if (tg) {
    tg.showAlert(message, callback)
  } else {
    alert(message)
    callback?.()
  }
}

export const showTelegramConfirm = (
  message: string,
  callback: (confirmed: boolean) => void
): void => {
  if (tg) {
    tg.showConfirm(message, callback)
  } else {
    const confirmed = confirm(message)
    callback(confirmed)
  }
}

export const isTelegramApp = (): boolean => {
  return !!(window.Telegram?.WebApp?.initData)
}

export const getTelegramVersion = (): string => tg?.version || '0'

export const showBackButton = (callback: () => void): void => {
  tg?.BackButton.show()
  tg?.BackButton.onClick(callback)
}

export const hideBackButton = (): void => {
  tg?.BackButton.hide()
}

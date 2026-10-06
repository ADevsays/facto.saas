import { computed } from 'vue'

export interface OtpModalConfig {
  mode?: 'login' | 'ad_setup' | 'custom'
  badge?: string
  title?: string
  description?: string
  email?: string
  emailLabel?: string
  emailPlaceholder?: string
  sendButtonText?: string
  submitButtonText?: string
  verifyButtonText?: string
  otpBadge?: string
  otpTitle?: string
  otpDesc?: string
  beforeSendOtp?: (email: string) => Promise<void | boolean>
  sendOtpFn?: (email: string) => Promise<void>
  verifyOtpFn?: (email: string, code: string) => Promise<any>
  onSuccess?: (result: { email: string; token?: string }) => void | Promise<void>
  onClose?: () => void
}

export function useOtpModal() {
  const isOpen = useState<boolean>('facto_otp_modal_open', () => false)
  const config = useState<OtpModalConfig>('facto_otp_modal_config', () => ({}))

  function open(options: OtpModalConfig = {}) {
    config.value = options
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    if (config.value.onClose) {
      try {
        config.value.onClose()
      } catch (err) {
        console.error(err)
      }
    }
    config.value = {}
  }

  return {
    isOpen: computed(() => isOpen.value),
    config: computed(() => config.value),
    open,
    close
  }
}

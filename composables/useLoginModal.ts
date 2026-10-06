import { useOtpModal, type OtpModalConfig } from './useOtpModal'

export function useLoginModal() {
  const { isOpen, open: openOtp, close } = useOtpModal()

  const open = (customOptions: Partial<OtpModalConfig> = {}) => {
    openOtp({
      mode: 'login',
      ...customOptions
    })
  }

  return {
    isOpen,
    open,
    close
  }
}

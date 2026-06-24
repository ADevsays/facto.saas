export const useAddSaasModal = () => {
  const isOpen = useState<boolean>('add-saas-modal-open', () => false)
  const prefillData = useState<Record<string, any> | null>('add-saas-modal-prefill', () => null)

  const open = (data?: Record<string, any> | Event) => {
    prefillData.value = (data instanceof Event) ? null : (data || null)
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    prefillData.value = null
  }

  return {
    isOpen,
    prefillData,
    open,
    close
  }
}

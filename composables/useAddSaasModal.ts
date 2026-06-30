export const useAddSaasModal = () => {
  const isOpen = useState<boolean>('add-saas-modal-open', () => false)
  const prefillData = useState<Record<string, any> | null>('add-saas-modal-prefill', () => null)
  const editMode = useState<boolean>('add-saas-modal-edit-mode', () => false)
  const fromClaimModal = useState<boolean>('add-saas-modal-from-claim', () => false)

  const open = (data?: Record<string, any> | Event, isEditMode = false, fromClaim = false) => {
    prefillData.value = (data instanceof Event) ? null : (data || null)
    editMode.value = isEditMode
    fromClaimModal.value = fromClaim
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    prefillData.value = null
    editMode.value = false
    fromClaimModal.value = false
  }

  return {
    isOpen,
    prefillData,
    editMode,
    fromClaimModal,
    open,
    close
  }
}


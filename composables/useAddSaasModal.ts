export const useAddSaasModal = () => {
  const isOpen = useState<boolean>('add-saas-modal-open', () => false)

  const open = () => { isOpen.value = true }
  const close = () => { isOpen.value = false }

  return {
    isOpen,
    open,
    close
  }
}

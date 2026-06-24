export const useAddAdModal = () => {
  const isOpen = useState<boolean>('add-ad-modal-open', () => false)
  const mode = useState<'sale' | 'setup'>('add-ad-modal-mode', () => 'sale')

  const open = () => {
    mode.value = 'sale'
    isOpen.value = true
  }

  const openForSetup = () => {
    mode.value = 'setup'
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    mode.value = 'sale'
  }

  return {
    isOpen,
    mode,
    open,
    openForSetup,
    close
  }
}

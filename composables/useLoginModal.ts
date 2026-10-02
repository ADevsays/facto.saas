import { computed } from 'vue'

export function useLoginModal() {
  const isOpen = useState<boolean>('facto_login_modal_open', () => false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen: computed(() => isOpen.value),
    open,
    close
  }
}

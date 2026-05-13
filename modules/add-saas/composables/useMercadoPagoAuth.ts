export function useMercadoPagoAuth(onSuccess: (mrr: number) => void) {
  const isMpConnecting = ref(false)
  const error = ref('')

  async function openMpAuth() {
    isMpConnecting.value = true
    error.value = ''
    
    try {
      const { url } = await $fetch<{ url: string }>('/api/auth/mercadopago/url')
      
      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      
      const popup = window.open(
        url, 
        'MPAuth', 
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      )

      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup)
          if (isMpConnecting.value) {
            isMpConnecting.value = false
          }
        }
      }, 1000)
    } catch (e: any) {
      error.value = 'No se pudo iniciar la conexión con Mercado Pago.'
      isMpConnecting.value = false
      setTimeout(() => { error.value = '' }, 5000)
    }
  }

  // Handle message listener
  if (process.client) {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MP_AUTH_SUCCESS') {
        onSuccess(event.data.mrr)
        isMpConnecting.value = false
      }
    }
    
    onMounted(() => {
      window.addEventListener('message', handleMessage)
    })

    onUnmounted(() => {
      window.removeEventListener('message', handleMessage)
    })
  }

  return {
    isMpConnecting,
    mpError: error,
    openMpAuth
  }
}

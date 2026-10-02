import { ref, watch, onMounted } from 'vue'
import type { Invoice, InvoiceAppData, InvoiceProfile } from '../types'

const STORAGE_KEY = 'facto_invoices_app'

function getDefaults(): InvoiceAppData {
  return {
    profile: {
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentInfo: ''
    },
    invoices: [],
    nextNumber: 1,
    currency: 'USD',
    taxRate: 0
  }
}

export function useInvoices() {
  const data = ref<InvoiceAppData>(getDefaults())
  const view = ref<'list' | 'editor'>('list')
  const editingInvoice = ref<Invoice | null>(null)
  const previewInvoice = ref<Invoice | null>(null)
  const showSettings = ref(false)
  const toastMessage = ref<string | null>(null)

  const loadData = () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        data.value = JSON.parse(raw)
      } else {
        data.value = getDefaults()
      }
    } catch {
      data.value = getDefaults()
    }
  }

  const saveData = (newData: InvoiceAppData) => {
    data.value = newData
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      } catch (err) {
        console.error('Failed to save invoices to localStorage', err)
      }
    }
  }

  const showToast = (msg: string) => {
    toastMessage.value = msg
    setTimeout(() => {
      if (toastMessage.value === msg) {
        toastMessage.value = null
      }
    }, 3000)
  }

  const handleNewInvoice = () => {
    editingInvoice.value = null
    view.value = 'editor'
  }

  const handleEditInvoice = (invoice: Invoice) => {
    editingInvoice.value = invoice
    view.value = 'editor'
  }

  const handleSaveInvoice = (invoice: Invoice) => {
    const existingIndex = data.value.invoices.findIndex(i => i.id === invoice.id)
    let invoices: Invoice[]
    let nextNum = data.value.nextNumber

    if (existingIndex >= 0) {
      invoices = [...data.value.invoices]
      invoices[existingIndex] = invoice
    } else {
      invoices = [...data.value.invoices, invoice]
      nextNum = data.value.nextNumber + 1
    }

    saveData({
      ...data.value,
      invoices,
      nextNumber: nextNum
    })

    view.value = 'list'
    editingInvoice.value = null
    showToast(existingIndex >= 0 ? 'Factura actualizada' : 'Factura guardada')
  }

  const handleDeleteInvoice = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar esta factura?')) return
    const filtered = data.value.invoices.filter(i => i.id !== id)
    saveData({
      ...data.value,
      invoices: filtered
    })
    showToast('Factura eliminada')
  }

  const handleSettingsSave = (settings: { profile: InvoiceProfile; currency: string; taxRate: number }) => {
    saveData({
      ...data.value,
      profile: settings.profile,
      currency: settings.currency,
      taxRate: settings.taxRate
    })
    showToast('Configuración guardada')
  }

  onMounted(() => {
    loadData()
  })

  return {
    data,
    view,
    editingInvoice,
    previewInvoice,
    showSettings,
    toastMessage,
    handleNewInvoice,
    handleEditInvoice,
    handleSaveInvoice,
    handleDeleteInvoice,
    handleSettingsSave,
    showToast
  }
}

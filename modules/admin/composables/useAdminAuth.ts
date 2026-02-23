const SESSION_KEY = 'facto_admin_key'

const adminKey = ref('')

export function useAdminAuth() {
    const isAuthenticated = computed(() => adminKey.value.length > 0)

    const init = () => {
        if (import.meta.client) {
            adminKey.value = localStorage.getItem(SESSION_KEY) ?? ''
        }
    }

    const login = (key: string) => {
        adminKey.value = key.trim()
        localStorage.setItem(SESSION_KEY, adminKey.value)
    }

    const logout = () => {
        adminKey.value = ''
        localStorage.removeItem(SESSION_KEY)
    }

    const getHeaders = () => ({ 'x-admin-key': adminKey.value })

    return { isAuthenticated, init, login, logout, getHeaders }
}

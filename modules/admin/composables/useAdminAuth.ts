const SESSION_KEY = 'facto_admin_key'

const adminKey = ref('')

export function useAdminAuth() {
    const isAuthenticated = computed(() => adminKey.value.length > 0)

    const init = () => {
        if (import.meta.client) {
            adminKey.value = sessionStorage.getItem(SESSION_KEY) ?? ''
        }
    }

    const login = (key: string) => {
        adminKey.value = key.trim()
        sessionStorage.setItem(SESSION_KEY, adminKey.value)
    }

    const logout = () => {
        adminKey.value = ''
        sessionStorage.removeItem(SESSION_KEY)
    }

    const getHeaders = () => ({ 'x-admin-key': adminKey.value })

    return { isAuthenticated, init, login, logout, getHeaders }
}

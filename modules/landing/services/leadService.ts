export async function submitLead(payload: {
    email: string
    startupUrl: string
    gateway: string
    motivation: string
}) {
    await $fetch('/api/beta/submit', {
        method: 'POST',
        body: payload,
    })
}

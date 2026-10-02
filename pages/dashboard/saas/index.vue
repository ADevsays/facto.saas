<script setup lang="ts">
import { onMounted } from 'vue'
import { useFounderSession } from '~/composables/useFounderSession'

const localePath = useLocalePath()
const router = useRouter()
const { startups, checkSession } = useFounderSession()

onMounted(async () => {
  await checkSession(true)
  if (startups.value.length > 0) {
    router.replace(localePath(`/dashboard/saas/${startups.value[0].slug}`))
  } else {
    router.replace(localePath('/dashboard/startups'))
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] flex items-center justify-center">
    <span class="w-6 h-6 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></span>
  </div>
</template>

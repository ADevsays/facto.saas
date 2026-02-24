import Clarity from '@microsoft/clarity'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const projectId = config.public.clarityProjectId as string

  if (projectId) {
    Clarity.init(projectId);
    if (process.dev) {
      console.log('🚀 Microsoft Clarity initialized with ID:', projectId);
    }
  } else {
    console.warn('⚠️ Microsoft Clarity Project ID not found. Check CLARITY_PROJECT_ID in runtimeConfig.')
  }
})

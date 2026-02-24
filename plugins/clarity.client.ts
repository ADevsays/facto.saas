import Clarity from '@microsoft/clarity'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const projectId = config.public.clarityProjectId as string

  if (projectId) {
    Clarity.init(projectId);
    console.log('Microsoft ', );
  } else {
    console.warn('Microsoft Clarity Project ID not found in runtimeConfig. Please add CLARITY_PROJECT_ID to your .env file.')
  }
})

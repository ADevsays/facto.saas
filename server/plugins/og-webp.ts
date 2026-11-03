import { useRuntimeConfig } from 'nitropack/runtime'
import { fetchWebpAsPngDataUrl } from '~/server/utils/og-webp'

const MAX_MEMORY_ENTRIES = 128
const convertedImages = new Map<string, Promise<string | null>>()

function getCachedConversion(sourceUrl: string): Promise<string | null> {
  const cached = convertedImages.get(sourceUrl)
  if (cached) return cached

  if (convertedImages.size >= MAX_MEMORY_ENTRIES) {
    const oldestKey = convertedImages.keys().next().value
    if (oldestKey) convertedImages.delete(oldestKey)
  }

  const conversion = fetchWebpAsPngDataUrl(sourceUrl)
    .catch(() => null)
    .then((result) => {
      if (!result) convertedImages.delete(sourceUrl)
      return result
    })
  convertedImages.set(sourceUrl, conversion)
  return conversion
}

async function replaceStoredWebpSources(node: any, storageOrigin: string): Promise<void> {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    await Promise.all(node.map(child => replaceStoredWebpSources(child, storageOrigin)))
    return
  }

  if (node.type === 'img' && typeof node.props?.src === 'string') {
    const sourceUrl = node.props.src
    if (sourceUrl.startsWith(storageOrigin)) {
      const compatibleSource = await getCachedConversion(sourceUrl)
      if (compatibleSource) node.props.src = compatibleSource
    }
  }

  const children = node.props?.children
  if (Array.isArray(children)) {
    await Promise.all(children.map(child => replaceStoredWebpSources(child, storageOrigin)))
  } else if (children) {
    await replaceStoredWebpSources(children, storageOrigin)
  }
}

export default function (nitroApp: any) {
  nitroApp.hooks.hook('nuxt-og-image:satori:vnodes', async (vnodes: any, renderEvent: any) => {
    const config = useRuntimeConfig(renderEvent.e)
    const supabaseUrl = String(config.supabaseUrl || '').replace(/\/$/, '')
    if (!supabaseUrl) return

    const storageOrigin = `${supabaseUrl}/storage/v1/object/public/`
    await replaceStoredWebpSources(vnodes, storageOrigin)
  })
}

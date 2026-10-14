import { hash } from 'ohash'

export default function (nitroApp: any) {
  nitroApp.hooks.hook('request', (event: any) => {
    const originalFetch = event.$fetch
    if (!originalFetch) return

    event.$fetch = (req: any, init?: any) => {
      if (typeof req === 'string' && req.startsWith('/__nuxt_island/')) {
        const queryIndex = req.indexOf('?')
        const queryStr = queryIndex !== -1 ? req.slice(queryIndex) : ''
        const pathWithoutQuery = queryIndex !== -1 ? req.slice(0, queryIndex) : req

        const cleanPath = pathWithoutQuery.slice('/__nuxt_island/'.length).replace(/\.json$/, '')
        const parts = cleanPath.split('_')
        if (parts.length > 1) {
          const incomingHash = parts.pop()
          const componentName = parts.join('_')
          const props = init?.params?.props || (init?.query?.props as string) || '{}'

          let parsed: any
          try {
            parsed = typeof props === 'string' ? JSON.parse(props) : props
          } catch {
            parsed = props
          }

          const clientContext = {}
          const expectedHash = hash([componentName, parsed, clientContext, undefined]).replace(/[-_]/g, '')
          const newPath = `/__nuxt_island/${componentName}_${expectedHash}.json${queryStr}`
          return originalFetch(newPath, init)
        }
      }
      return originalFetch(req, init)
    }
  })
}

const MAX_INLINE_LOGO_LENGTH = 32 * 1024

export function getPublicLogoUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  return value.startsWith('data:') && value.length > MAX_INLINE_LOGO_LENGTH ? null : value
}

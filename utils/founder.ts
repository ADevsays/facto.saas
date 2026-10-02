export function getFounderSlug(name?: string | null): string {
  if (!name) return ''
  return slugify(name)
}

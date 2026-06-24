export type GemType = 'gem-amethyst' | 'gem-emerald' | 'gem-sapphire' | 'gem-ruby' | 'gem-quartz'

export const GEMS: GemType[] = [
  'gem-amethyst',
  'gem-emerald',
  'gem-sapphire',
  'gem-ruby',
  'gem-quartz'
]

export const GEM_COLORS: Record<GemType, string> = {
  'gem-amethyst': '#a78bfa',
  'gem-emerald': '#34d399',
  'gem-sapphire': '#22d3ee',
  'gem-ruby': '#fb7185',
  'gem-quartz': '#fbbf24'
}

export function getGemClass(categorySlug: string | null | undefined): GemType {
  if (!categorySlug) return 'gem-quartz'
  
  const slug = categorySlug.toLowerCase()
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % GEMS.length
  return GEMS[index]
}

export function getGemColor(categorySlug: string | null | undefined): string {
  const gem = getGemClass(categorySlug)
  return GEM_COLORS[gem]
}

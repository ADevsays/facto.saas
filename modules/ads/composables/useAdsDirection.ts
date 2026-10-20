const LAST_DIRECTION_KEY = 'facto_ads_last_direction'

let directionForPageLoad: number | null = null

/** Keeps top and bottom ad bands aligned, then alternates on the next visit. */
export function useAdsDirection() {
  function getDirection() {
    if (directionForPageLoad !== null) return directionForPageLoad

    try {
      const previousDirection = localStorage.getItem(LAST_DIRECTION_KEY)
      const nextDirection = previousDirection === 'left' ? 'right' : 'left'

      localStorage.setItem(LAST_DIRECTION_KEY, nextDirection)
      directionForPageLoad = nextDirection === 'left' ? 1 : -1
    } catch {
      directionForPageLoad = 1
    }

    return directionForPageLoad
  }

  return { getDirection }
}

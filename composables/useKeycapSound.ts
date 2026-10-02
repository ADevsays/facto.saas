const KEYCAP_SOUNDS = [
  '/sounds/keycaps/key-1.mp3',
  '/sounds/keycaps/key-2.mp3',
  '/sounds/keycaps/key-3.mp3',
  '/sounds/keycaps/key-4.mp3',
  '/sounds/keycaps/key-5.mp3',
  '/sounds/keycaps/key-6.mp3',
  '/sounds/keycaps/key-7.mp3'
]

let currentIndex = 0

export const useKeycapSound = () => {
  const playNextKeySound = () => {
    if (typeof window === 'undefined' || KEYCAP_SOUNDS.length === 0) return

    try {
      const soundSrc = KEYCAP_SOUNDS[currentIndex]
      currentIndex = (currentIndex + 1) % KEYCAP_SOUNDS.length

      const audio = new Audio(soundSrc)
      audio.volume = 0.75
      audio.play().catch(() => {})
    } catch (_) {}
  }

  return {
    playNextKeySound
  }
}

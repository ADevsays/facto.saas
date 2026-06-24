import { ref, watch, onUnmounted, nextTick, type WatchSource } from 'vue'

export function useReveal(dependencies: WatchSource<any>[]) {
  const containerRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  function initObserver() {
    if (observer) observer.disconnect()

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    })

    nextTick(() => {
      const cards = containerRef.value?.querySelectorAll('.reveal-card')
      cards?.forEach((card, index) => {
        if (index < 3) {
          card.classList.add('is-visible')
        } else {
          observer?.observe(card)
        }
      })
    })
  }

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  if (dependencies && dependencies.length > 0) {
    watch(dependencies, () => {
      initObserver()
    })
  }

  return {
    containerRef,
    initObserver
  }
}

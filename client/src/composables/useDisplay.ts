import { ref, onMounted, onUnmounted } from 'vue'
export type SSROptions =
  | boolean
  | {
      clientWidth: number
      clientHeight?: number
    }

export const IN_BROWSER = typeof window !== 'undefined'

export function useDisplay(maxWidth = 768) {
  const isMobile = ref(window.innerWidth < maxWidth)
  const containerMaxW =
    'xl:max-w-[480px] xl:mx-auto lg:max-w-[480px] lg:mx-auto md:max-w-[480px] md:mx-auto sm:max-w-[480px] sm:mx-auto xs:max-w-[480px] xs:mx-auto'
  const desktopMaxHeight =
    'xl:max-h-[720px] xl:mx-auto lg:max-h-[720px] lg:mx-auto md:max-h-[720px] md:mx-auto sm:max-h-[720px] sm:mx-auto xs:max-h-[720px] xs:mx-auto'
  const desktopMinHeight =
    'xl:min-h-[720px] xl:mx-auto lg:min-h-[720px] lg:mx-auto md:min-h-[720px] md:mx-auto sm:min-h-[720px] sm:mx-auto xs:min-h-[720px] xs:mx-auto'

  const handleResize = () => {
    isMobile.value = window.innerWidth < maxWidth
  }
  function getClientWidth(ssr?: SSROptions) {
    return IN_BROWSER && !ssr
      ? window.innerWidth
      : (typeof ssr === 'object' && ssr.clientWidth) || 0
  }
  onMounted(() => {
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check on mount
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isMobile,
    containerMaxW,
    getClientWidth,
    desktopMaxHeight,
    desktopMinHeight,
  }
}

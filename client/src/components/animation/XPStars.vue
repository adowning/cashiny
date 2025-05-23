<template>
  <div ref="animationContainerRef" class="animation-overlay"></div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  // Assuming your Pinia store is set up like this:
  // import { useUserStore } from '@/stores/userStore'; // Adjust path as needed

  // --- Mock Pinia Store for Standalone Demonstrability ---
  // Replace this with your actual Pinia store import
  const useUserStore = () => {
    const store = ref({ totalXp: 0 })
    // Helper to simulate XP increase for testing without actual Pinia
    ;(window as any).increaseXp = (amount: number = 10) => {
      store.value.totalXp += amount
      console.log('Mock XP increased to:', store.value.totalXp)
    }
    console.warn(
      'Using MOCK Pinia store. Replace with your actual store. ' +
        'You can trigger animation for testing by calling `increaseXp()` in the console.'
    )
    return store.value
  }
  // --- End Mock Pinia Store ---

  const userStore = useUserStore()

  interface Point {
    x: number
    y: number
  }

  const props = defineProps<{
    from: Point
    to: Point
  }>()

  const NUM_STARS = 5
  // Ensure these paths are correct relative to your `public` directory
  const STAR_IMAGE_URL =
    '/images/animation/slots2___shared___levelUp___xpAnim___assets___star01.png'
  const PARTICLE_IMAGE_URL =
    '/images/animation/slots2___shared___levelUp___xpAnim___assets___particle.png'

  const animationContainerRef = ref<HTMLDivElement | null>(null)
  let animationFrameId: number | null = null

  interface SpellElementData {
    domElement: HTMLDivElement
    startTime: number
    duration: number
    amplitude: number
    frequency: number
    initialOffsetX: number // Random offset from props.from.x for this element
    initialOffsetY: number // Random offset from props.from.y for this element
    type: 'star' | 'particle'
    actualWidth: number
    isBlinkingParticle: boolean
    blinkRate: number
    blinkVisibleDuration: number
    // Path properties pre-calculated for this element's animation
    pathDX: number
    pathDY: number
    pathLength: number
    normalizedPathDX: number
    normalizedPathDY: number
    perpDX: number
    perpDY: number
  }
  const activeElements = ref<SpellElementData[]>([])

  // Pre-calculate path vectors when props change (or on mount)
  let mainPathParams = {
    pathDX: 0,
    pathDY: 0,
    pathLength: 0,
    normalizedPathDX: 0,
    normalizedPathDY: 0,
    perpDX: 0,
    perpDY: 0,
  }

  function calculateMainPathParameters() {
    const dx = props.to.x - props.from.x
    const dy = props.to.y - props.from.y
    const length = Math.sqrt(dx * dx + dy * dy) || 1 // Avoid division by zero

    mainPathParams = {
      pathDX: dx,
      pathDY: dy,
      pathLength: length,
      normalizedPathDX: dx / length,
      normalizedPathDY: dy / length,
      perpDX: -dy / length, // Perpendicular vector component
      perpDY: dx / length, // Perpendicular vector component
    }
  }

  onMounted(() => {
    calculateMainPathParameters()
  })

  watch(
    () => [props.from, props.to],
    () => {
      calculateMainPathParameters()
    },
    { deep: true }
  )

  function createSpellElement(
    type: 'star' | 'particle',
    delay = 0,
    spawnOffsetX: number, // Offset relative to props.from.x
    spawnOffsetY: number // Offset relative to props.from.y
  ) {
    if (!animationContainerRef.value) return

    const element = document.createElement('div')
    element.classList.add('spell-element')

    const imageUrl = type === 'star' ? STAR_IMAGE_URL : PARTICLE_IMAGE_URL
    const fallbackColor = type === 'star' ? 'gold' : 'yellow'

    const baseMaxWidth = type === 'star' ? 50 : 15
    const baseMaxHeight = type === 'star' ? 50 : 15

    const scale = Math.random() * 0.4 + 0.6 // 60% to 100% of max size
    const actualWidth = baseMaxWidth * scale
    const actualHeight = baseMaxHeight * scale

    const fallbackSVG =
      type === 'star'
        ? `<svg viewBox="0 0 24 24" width="${actualWidth * 0.6}" height="${actualHeight * 0.6}" fill="black" style="margin:auto;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
        : `<svg viewBox="0 0 10 10" width="${actualWidth * 0.8}" height="${actualHeight * 0.8}" fill="black" style="margin:auto;"><circle cx="5" cy="5" r="4.5"/></svg>`

    element.classList.add(type === 'star' ? 'star-style' : 'particle-style') // Use specific classes for base size

    const img = new Image()
    img.onload = () => {
      element.style.backgroundImage = `url(${imageUrl})`
      element.innerHTML = ''
    }
    img.onerror = () => {
      console.error(`Failed to load image: ${imageUrl}. Applying SVG fallback.`)
      element.style.backgroundImage = 'none'
      element.style.backgroundColor = fallbackColor
      element.innerHTML = fallbackSVG
    }
    img.src = imageUrl

    element.style.width = `${actualWidth}px`
    element.style.height = `${actualHeight}px`

    // Position element at the starting point + its unique spawn offset
    element.style.left = `${props.from.x + spawnOffsetX}px`
    element.style.top = `${props.from.y + spawnOffsetY}px`
    element.style.opacity = '1'

    animationContainerRef.value.appendChild(element)

    const startTime = performance.now() + delay
    const baseDuration = type === 'star' ? 1700 + Math.random() * 600 : 1750 + Math.random() * 650
    const duration = baseDuration / 2

    const amplitude = 12 + Math.random() * 18
    const frequency = 0.0055 + Math.random() * 0.003

    let isBlinkingParticle = false
    let blinkRate = 0
    let blinkVisibleDuration = 0
    if (type === 'particle' && Math.random() < 0.4) {
      isBlinkingParticle = true
      blinkRate = 230 + Math.random() * 230
      blinkVisibleDuration = blinkRate * (0.35 + Math.random() * 0.3)
    }

    activeElements.value.push({
      domElement: element,
      startTime,
      duration,
      amplitude,
      frequency,
      initialOffsetX: spawnOffsetX, // Store the element's specific offset from props.from
      initialOffsetY: spawnOffsetY,
      type,
      actualWidth,
      isBlinkingParticle,
      blinkRate,
      blinkVisibleDuration,
      ...mainPathParams, // Spread pre-calculated path parameters
    })
  }

  function animateSpell(timestamp: number) {
    let allAnimationsComplete = true

    for (let i = activeElements.value.length - 1; i >= 0; i--) {
      const elData = activeElements.value[i]
      const {
        domElement,
        startTime,
        duration,
        amplitude,
        frequency,
        type,
        isBlinkingParticle,
        blinkRate,
        blinkVisibleDuration,
        normalizedPathDX,
        normalizedPathDY,
        pathLength,
        perpDX,
        perpDY,
      } = elData

      const elapsedTime = timestamp - startTime

      if (elapsedTime < 0) {
        allAnimationsComplete = false
        continue
      }

      const progress = Math.min(elapsedTime / duration, 1)

      // Movement along the main path
      const pathDisplacementX = normalizedPathDX * progress * pathLength
      const pathDisplacementY = normalizedPathDY * progress * pathLength

      // Perpendicular undulation
      const oscillation =
        amplitude * Math.sin(frequency * elapsedTime + (type === 'particle' ? Math.PI / 3.5 : 0))
      const undulationOffsetX = perpDX * oscillation
      const undulationOffsetY = perpDY * oscillation

      // Total transform relative to initial spawn point (props.from + initialOffset)
      // Since style.left/top is already props.from + initialOffset, transform is just path + undulation
      domElement.style.transform = `translateX(${pathDisplacementX + undulationOffsetX}px) translateY(${pathDisplacementY + undulationOffsetY}px)`

      let calculatedOpacity = 1
      if (progress > 0.7) {
        calculatedOpacity = Math.max(0, 1 - (progress - 0.7) / 0.3)
      }

      if (isBlinkingParticle && progress < 0.9) {
        const timeInCycle = elapsedTime % blinkRate
        if (timeInCycle > blinkVisibleDuration) {
          calculatedOpacity = Math.min(calculatedOpacity, 0.1)
        }
      }
      domElement.style.opacity = String(calculatedOpacity)

      if (progress >= 1) {
        if (domElement.parentElement) {
          domElement.parentElement.removeChild(domElement)
        }
        activeElements.value.splice(i, 1)
      } else {
        allAnimationsComplete = false
      }
    }

    if (!allAnimationsComplete) {
      animationFrameId = requestAnimationFrame(animateSpell)
    } else {
      animationFrameId = null
      console.log('Spell animation cycle complete.')
    }
  }

  async function castSpell() {
    console.log('Casting spell animation...')
    if (!animationContainerRef.value) {
      console.warn('Animation container not ready for castSpell')
      return
    }
    // Ensure path parameters are up-to-date, especially if props could change mid-flight (not typical here)
    calculateMainPathParameters()

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    // Clear existing DOM elements
    activeElements.value.forEach((elData) => {
      if (elData.domElement.parentElement) {
        elData.domElement.parentElement.removeChild(elData.domElement)
      }
    })
    activeElements.value = [] // Clear the reactive array

    await nextTick() // Ensure DOM is updated after clearing

    const STAR_CREATION_INTERVAL = 35
    const PARTICLE_DELAY_AFTER_STAR = 20
    const PARTICLE_STAGGER = 8

    for (let i = 0; i < NUM_STARS; i++) {
      const starDelay = i * STAR_CREATION_INTERVAL
      // Spawn stars with a small random offset from props.from
      const starSpawnOffsetX = (Math.random() - 0.5) * 10 // Small spread around from point
      const starSpawnOffsetY = (Math.random() - 0.5) * 10
      createSpellElement('star', starDelay, starSpawnOffsetX, starSpawnOffsetY)

      const numParticlesForThisStar = i < 2 ? 3 : 2

      for (let j = 0; j < numParticlesForThisStar; j++) {
        const particleOverallDelay = starDelay + PARTICLE_DELAY_AFTER_STAR + j * PARTICLE_STAGGER
        // Particles spawn near their star's spawn point, slightly behind
        const particleSpawnOffsetX =
          starSpawnOffsetX + mainPathParams.normalizedPathDX * -5 + (Math.random() - 0.5) * 6 // Spawn slightly "behind" along path
        const particleSpawnOffsetY =
          starSpawnOffsetY + mainPathParams.normalizedPathDY * -5 + (Math.random() - 0.5) * 6

        createSpellElement(
          'particle',
          particleOverallDelay,
          particleSpawnOffsetX,
          particleSpawnOffsetY
        )
      }
    }

    if (activeElements.value.length > 0 && !animationFrameId) {
      console.log('Starting animation loop.')
      animationFrameId = requestAnimationFrame(animateSpell)
    }
  }

  watch(
    () => userStore.totalXp,
    (newXp, oldXp) => {
      if (typeof newXp === 'number' && typeof oldXp === 'number' && newXp > oldXp) {
        console.log(`XP changed from ${oldXp} to ${newXp}, triggering animation.`)
        castSpell()
      }
    }
  )

  onBeforeUnmount(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    // Clean up DOM elements if component is destroyed mid-animation
    activeElements.value.forEach((elData) => {
      if (elData.domElement.parentElement) {
        elData.domElement.parentElement.removeChild(elData.domElement)
      }
    })
    activeElements.value = []
  })
</script>

<style scoped>
  .animation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none; /* Ignore clicks */
    background-color: transparent; /* Transparent background */
    overflow: hidden; /* Should not be necessary if elements are positioned correctly */
    z-index: 9999; /* Ensure it's on top */
  }

  /* These styles are applied via JS, but having classes can be useful.
  The .spell-element is the base for dynamically created divs.
*/
  :global(.spell-element) {
    position: absolute;
    background-size: contain;
    background-repeat: no-repeat;
    will-change: transform, opacity;
    display: flex;
    align-items: center;
    justify-content: center;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: pixelated;
  }

  /* Define base sizes here if not overridden by JS, 
  but JS is setting width/height directly.
  These are more like placeholders or for elements not managed by JS sizing.
*/
  :global(.star-style) {
    /* max-width: 50px; max-height: 50px; */ /* JS sets actual size */
    z-index: 2;
  }

  :global(.particle-style) {
    /* max-width: 15px; max-height: 15px; */ /* JS sets actual size */
    z-index: 1;
  }
</style>

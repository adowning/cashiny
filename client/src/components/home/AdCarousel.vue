<script setup>
  import Autoplay from 'embla-carousel-autoplay'
  import emblaCarouselVue from 'embla-carousel-vue'

  const [emblaRef, emblaApi] = emblaCarouselVue({ loop: false, delay: 5000 }, [Autoplay()])

  const TWEEN_FACTOR_BASE = 0.52
  let tweenFactor = 0
  let tweenNodes = []
  const { height } = useWindowSize()
  const numberWithinRange = (number, min, max) => Math.min(Math.max(number, min), max)

  function setTweenNodes(emblaApi) {
    if (emblaApi) {
      tweenNodes = emblaApi.slideNodes().map((slideNode) => {
        // return slideNode.querySelector('.embla__slide')
        return slideNode
      })
    }
  }

  function setTweenFactor(emblaApi) {
    if (emblaApi) {
      tweenFactor = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
    }
  }

  function tweenScale(emblaApi, eventName) {
    if (emblaApi) {
      const engine = emblaApi.internalEngine()
      const scrollProgress = emblaApi.scrollProgress()
      const slidesInView = emblaApi.slidesInView()
      const isScrollEvent = eventName === 'scroll'
      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress)
                }
              }
            })
          }
          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor)
          const scale = numberWithinRange(tweenValue, 0, 1).toString()
          const tweenNode = tweenNodes[slideIndex]
          tweenNode.style.transform = `scale(${scale})`
        })
      })
    }
  }

  function setupTweenScale(emblaApi) {
    if (emblaApi.value) {
      setTweenNodes(emblaApi.value)
      setTweenFactor(emblaApi.value)
      tweenScale(emblaApi.value)

      emblaApi.value
        .on('reInit', setTweenNodes)
        .on('reInit', setTweenFactor)
        .on('reInit', tweenScale)
        .on('scroll', tweenScale)
        .on('slideFocus', tweenScale)

      return () => {
        tweenNodes.forEach((slide) => slide.removeAttribute('style'))
      }
    }
  }
  onMounted(() => {
    setupTweenScale(emblaApi)
  })
</script>

<template>
  <div
    style="width: 100vw; max-width: 600px; height: 22vh"
    class="justify-start items-start flex grow-0"
  >
    <div v-if="height > 700" id="AdCarousel" class="adcarousel max-w-[700px]">
      <div ref="emblaRef" class="embla">
        <div
          class="embla__container justify-center items-center flex h-[100%] m-auto max-w-[500px]"
        >
          <div class="embla__slide">
            <img src="/images/ads/casinoadfreechips.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoadfreechips.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoadfreechips.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoClubBonusContestV2PCA2023.png" style="height: 100%" />
          </div>
          <div class="embla__slide">
            <img src="/images/ads/casinoSales2024PopUprevamped.png" style="height: 100%" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .adcarousel {
    /* margin-left: 1rem; */
    /* padding-bottom: 1rem; */
    margin: 0 auto;
    /* padding-left: 20px;
  padding-right: 20px; */
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url('/images/ads/promo-dock.png');
    background-size: 90% 50%;
    background-repeat: no-repeat;
    background-position-x: center;
    background-position-y: 80px;

    overflow: hidden;
  }

  .embla {
    overflow: hidden;
    height: 100%;
    align-items: start;
    justify-content: center;
    width: 100%;
    margin: auto;
  }

  .embla__container {
    display: flex;
    width: 100%;
    align-items: start;
    justify-content: center;
  }

  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
    padding-bottom: 39px;
    padding-left: 26px;
    padding-right: 26px;
    /* margin-left: 36px;
  margin-right: 36px; */
  }
</style>

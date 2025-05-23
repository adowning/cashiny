// Path: client/src/stores/imageLoading.store.ts
import { defineStore } from 'pinia'
import { nextTick } from 'vue'

export const useImageLoadingStore = defineStore('imageLoading', {
  state: () => ({
    areImagesLoading: false,
    imagesToLoad: 0,
    imagesLoaded: 0,
    initialScanPerformedOnView: false, // NEW: Tracks if scan has run for the current view
  }),
  actions: {
    resetImageLoadingState() {
      this.areImagesLoading = false
      this.imagesToLoad = 0
      this.imagesLoaded = 0
      this.initialScanPerformedOnView = false // CRITICAL: Reset this on route change
    },
    async trackImagesInView() {
      await nextTick() // Ensure DOM is updated before querying images

      const images = document.querySelectorAll('img')
      const pendingImages = Array.from(images).filter((img) => !img.complete)

      if (pendingImages.length === 0) {
        this.areImagesLoading = false
        this.initialScanPerformedOnView = true // Scan complete, no images loading or all are loaded
        return
      }

      // If we reach here, pending images were found.
      this.areImagesLoading = true
      this.imagesToLoad = pendingImages.length
      this.imagesLoaded = 0
      this.initialScanPerformedOnView = true // Scan complete, images are now being tracked.

      pendingImages.forEach((img) => {
        const onImageLoadOrError = () => {
          this.imagesLoaded++
          if (this.imagesLoaded >= this.imagesToLoad) {
            this.areImagesLoading = false
            // initialScanPerformedOnView remains true; it's about the view's scan initiation.
          }
          // Clean up event listeners
          img.removeEventListener('load', onImageLoadOrError)
          img.removeEventListener('error', onImageLoadOrError)
        }
        img.addEventListener('load', onImageLoadOrError)
        img.addEventListener('error', onImageLoadOrError)
      })
    },
  },
})

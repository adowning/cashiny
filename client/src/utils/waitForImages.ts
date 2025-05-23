export async function _waitForImages() {
  return new Promise((resolve): void => {
    const images = document.querySelectorAll('img')
    const totalImages = images.length
    let loadedImages = 0
    function checkLoaded(img) {
      if (img.target.complete) loadedImages++
      if (loadedImages === totalImages) {
        resolve('done bitch')
      }
    }

    images.forEach((img) => {
      if (img.complete) {
        checkLoaded(img)
      } else {
        img.addEventListener('load', checkLoaded)
        img.addEventListener('error', checkLoaded) // Handle failed image loads
      }
    })
  })
}

// export async function waitForImages() {
//   await _waitForImages()
//   // Your code that needs to run after images are loaded
//   console.log('All images loaded')
// }
// export default {
//   install: (app: App) => {
//     app.config.globalProperties.$waitForImages = (imageElements: any[]) => {
//       const promises: any[] = []

//       imageElements.forEach((img) => {
//         promises.push(
//           new Promise((resolve, reject) => {
//             if (img.complete) {
//               resolve()
//             } else {
//               img.onload = resolve
//               img.onerror = reject
//             }
//           })
//         )
//       })

//       return Promise.all(promises)
//     }
//   },
// }
export const ImageLoaderPlugin = {
  install: (app: App) => {
    const waitForImages = () => {
      //   console.log('wait for images called')
      //   //   app.config.globalProperties.$waitForImages = (imageElements: any[]) => {
      //   let loadedImages = 0
      //   const promises: any[] = []
      //   const imageElements = document.querySelectorAll('img')
      //   const totalImages = imageElements.length
      //   function checkLoaded() {
      //     loadedImages++
      //     if (loadedImages === totalImages) {
      //       resolve()
      //     }
      //   }
      //   imageElements.forEach((img) => {
      //     if (img.complete) {
      //       checkLoaded()
      //     } else {
      //       img.addEventListener('load', checkLoaded)
      //       img.addEventListener('error', checkLoaded) // Handle failed image loads
      //     }
      //   })
      //   imageElements.forEach((img) => {
      //     console.log(img)
      //     promises.push(
      //       new Promise((resolve, reject) => {
      //         if (img.complete) {
      //           console.log('bleh')
      //           resolve('hey bitches')
      //         } else {
      //           img.onload = resolve
      //           img.onerror = reject
      //         }
      //       })
      //     )
      //   })
      //   return Promise.all(promises)
      //   }
    }
    app.provide('waitForImages', _waitForImages)
  },
}

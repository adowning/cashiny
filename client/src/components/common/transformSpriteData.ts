import { SpriteData, AnimationFrameData } from '@cashflow/types'

export // (Include or import transformRawSpriteJsonToSpriteData function here)
function transformRawSpriteJsonToSpriteData(rawData: any, defaultImageName?: string): SpriteData {
  const frameArray: AnimationFrameData[] = []
  if (rawData && rawData.frames && typeof rawData.frames === 'object') {
    for (const filename in rawData.frames) {
      if (Object.prototype.hasOwnProperty.call(rawData.frames, filename)) {
        const frameEntry = rawData.frames[filename]
        frameArray.push({
          filename: filename,
          frame: { ...frameEntry.frame },
          rotated: !!frameEntry.rotated,
          trimmed: !!frameEntry.trimmed,
          spriteSourceSize: { ...frameEntry.spriteSourceSize },
          sourceSize: { ...frameEntry.sourceSize },
        })
      }
    }
  }
  frameArray.sort((a, b) => (a.filename < b.filename ? -1 : 1))
  return {
    frames: frameArray,
    meta: rawData.meta
      ? { ...rawData.meta, image: defaultImageName || rawData.meta?.image }
      : { image: defaultImageName },
  }
}

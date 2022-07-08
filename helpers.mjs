export const qs = term => document.querySelector(term)

export const create = term => document.createElement(term)

export const drawFavicon = async (imageBitmap) => {
  // Yes, we have to create another canvas to render ImageBitmap because this is the only way
  // to get it from the detached offscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext('bitmaprenderer')
  ctx.transferFromImageBitmap(imageBitmap)
  const blob2 = await new Promise((res) => canvas.toBlob(res))

  const link = qs('#favicon')
  link.href = URL.createObjectURL(blob2)
}

export const createOffscreenCanvas = (size) => {
  const destinationCanvas = create('canvas')
  destinationCanvas.width = size
  destinationCanvas.height = size
  const dstContainer = qs('#dst')
  if (dstContainer.firstChild)
    dstContainer.removeChild(dstContainer.firstChild)
  dstContainer.appendChild(destinationCanvas)
  return destinationCanvas.transferControlToOffscreen()
}
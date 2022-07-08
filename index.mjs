import { qs, drawFavicon, createOffscreenCanvas } from './helpers.mjs'
import { initControls } from './controls.mjs'

// Playing around with favicon size and fps can yield different results,
// this combination is somewhat a good balance.
// Updating favicon is kind of slow, but perhaps it can be improved in the future
const FAVICON_SIZE = 64
const FPS = 24

let worker

const startWorker = (stream) => {
  // Create a new destination canvas
  const canvas = createOffscreenCanvas(FAVICON_SIZE)

  if (worker) {
    // Restart worker when source video is replaced
    worker.terminate()
  }

  worker = new Worker('worker.js', { name: 'Video worker' })
  worker.onmessage = (message) => {
    drawFavicon(message.data)
  }

  // Capture animation track for the source stream
  const track = stream.getVideoTracks()[0]
  const mediaProcessor = new MediaStreamTrackProcessor(track)
  const reader = mediaProcessor.readable

  worker.postMessage({
    canvas,
    frameSource: reader,
    fps: FPS
  }, [canvas, reader])
}


const waitForStreamStart = (stream) => {
  const track = stream.getVideoTracks()[0]
  if (!track) {
    setTimeout(() => {
      waitForStreamStart(stream)
    }, 1)
  } else {
    startWorker(stream)
  }
}

const init = () => {
  if (!('VideoFrame' in window)) {
    document.body.innerHTML = '<h1>Sorry, WebCodecs API is not supported in your browser!</h1>'
    return
  }
  const fileInput = qs('#file')
  const video = qs('#video')
  video.width = FAVICON_SIZE
  video.height = FAVICON_SIZE

  fileInput.addEventListener('change', (event) => {
    video.src = URL.createObjectURL(event.currentTarget.files[0])
    // For reference & debugging can be turned on to see the source
    // video.style.display = 'block'
    video.play()
    initControls(video)
    waitForStreamStart(video.captureStream())
  })
}

init()
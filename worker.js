const CODEC = 'avc1.42001E'

const reportError = e => {
  console.error(e.message)
}

const captureAndEncode = (frameSource, cnv, fps, processChunk) => {
  let frameCount = 0

  const encoder = new VideoEncoder({
    output: processChunk,
    error: reportError
  })
  encoder.configure({
    codec: CODEC,
    width: cnv.width,
    height: cnv.height,
    bitrate: 1000000,
    avc: { format: 'annexb' },
    framerate: fps,
    hardwareAcceleration: 'prefer-software'
  })

  let reader = frameSource.getReader()
  const readFrame = async () => {
    const result = await reader.read()
    let frame = result.value

    if (encoder.encodeQueueSize < 2) {
      frameCount++
      const insertKeyframe = false
      // undefined when not playing or something else
      if (frame) {
        encoder.encode(frame, { keyFrame: insertKeyframe })
        frame.close()
      }
    } else {
      // Too many frames in flight, encoder is overwhelmed
      // let's drop this frame.
      console.log('Frame dropped')
      frame.close()
    }

    setTimeout(readFrame, 1)
  }

  readFrame()
}

const startDecodingAndRendering = (cnv) => {
  const ctx = cnv.getContext('2d')
  const readyFrames = []
  let underflow = true

  async function renderFrame() {
    if (readyFrames.length === 0) {
      underflow = true
      return
    }
    let frame = readyFrames.shift()
    underflow = false

    ctx.drawImage(frame, 0, 0)
    // Send OffscreenCanvasImageBitmap to the main thread
    postMessage(cnv.transferToImageBitmap())
    frame.close()

    // Immediately schedule rendering of the next frame
    setTimeout(renderFrame, 0)
  }

  const handleFrame = frame => {
    readyFrames.push(frame)
    if (underflow) {
      underflow = false
      setTimeout(renderFrame, 0)
    }
  }

  return new VideoDecoder({
    output: handleFrame,
    error: reportError
  })
}

const main = (frameSource, canvas, fps) => {
  const decoder = startDecodingAndRendering(canvas)

  function processChunk(chunk, md) {
    let config = md.decoderConfig
    if (config) {
      console.log('Decoder reconfig')
      decoder.configure(config)
    }

    decoder.decode(chunk)
  }

  captureAndEncode(frameSource, canvas, fps, processChunk)
}

self.onmessage = async e => {
  main(e.data.frameSource, e.data.canvas, e.data.fps)
}
import { qs } from './helpers.mjs'
import { ICON_MUTE, ICON_PAUSE, ICON_PLAY, ICON_UNMUTE } from './icons.mjs'



export const initControls = (video) => {
  const controls = qs('#controls')
  const playPauseBtn = qs('#playPause')
  const muteBtn = qs('#mute')
  const label = qs('#label')

  controls.style.display = 'flex'

  label.innerHTML = 'Now playing somewhere up there'
  label.classList.add('active')
  playPauseBtn.innerHTML = ICON_PAUSE
  muteBtn.innerHTML = ICON_UNMUTE

  const playOrPause = () => {
    if (video.paused || video.ended) {
      playPauseBtn.innerHTML = ICON_PAUSE
      video.play()
    }  else {
      playPauseBtn.innerHTML = ICON_PLAY
      video.pause()
    }
  }
  const mute = () => {
    if (video.muted) {
      muteBtn.innerHTML = ICON_UNMUTE
      video.muted = false
    }  else {
      muteBtn.innerHTML = ICON_MUTE
      video.muted = true
    }
  }
  video.addEventListener('ended', () => controls.style.display = 'none');
  playPauseBtn.addEventListener('click', playOrPause)
  muteBtn.addEventListener('click', mute)
}
const SRC = "/audio/sucess/sucess.mp3"

let element: HTMLAudioElement | null = null

function audio(): HTMLAudioElement {
  if (!element) {
    element = new Audio(SRC)
    element.volume = 0.5
    element.preload = "auto"
  }
  return element
}

// Mobile browsers only grant playback to an element that has been started from
// inside a real tap. A transfer takes seconds to confirm, so by the time the
// success screen mounts the gesture has expired and play() is refused --
// priming during the tap is what carries the permission across that gap.
//
// Muted because play() resolves only once audio is already coming out, so an
// unmuted prime chirps on the Send button and again on the success screen.
export function primeSuccessChime() {
  const a = audio()
  a.muted = true
  a.play()
    .then(() => {
      a.pause()
      a.currentTime = 0
      a.muted = false
    })
    .catch(() => {
      // Nothing is unlocked, so the success screen simply stays silent.
      a.muted = false
    })
}

export function playSuccessChime() {
  const a = audio()
  // A prime still settling would otherwise unmute after this call, leaving the
  // success chime playing silently.
  a.muted = false
  a.currentTime = 0
  void a.play().catch(() => {})
}

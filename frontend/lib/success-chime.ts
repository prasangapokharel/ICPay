const SRC = "/audio/sucess/sucess.mp3"

let element: HTMLAudioElement | null = null
let unlocked = false

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
// Stays muted throughout, and is never unmuted from the promise: some browsers
// resolve play() while the element is still rolling, so unmuting there let the
// prime become audible on the button and again on the success screen.
export function primeSuccessChime() {
  if (unlocked) return
  const a = audio()
  a.muted = true
  a.play()
    .then(() => {
      a.pause()
      a.currentTime = 0
      unlocked = true
    })
    .catch(() => {
      // Nothing is unlocked, so the success screen simply stays silent.
    })
}

export function playSuccessChime() {
  const a = audio()
  // Stopped first: a prime still settling would otherwise keep rolling under
  // this one, which is the doubled chime.
  a.pause()
  a.muted = false
  a.currentTime = 0
  void a.play().catch(() => {})
}

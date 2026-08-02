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
export function primeSuccessChime() {
  const a = audio()
  a.play()
    .then(() => {
      a.pause()
      a.currentTime = 0
    })
    .catch(() => {
      // Nothing is unlocked, so the success screen simply stays silent.
    })
}

export function playSuccessChime() {
  const a = audio()
  a.currentTime = 0
  void a.play().catch(() => {})
}

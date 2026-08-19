const SUCCESS_SRC = "/audio/sucess/sucess.mp3"
const LOGIN_SRC = "/audio/sucess/login.mp3"

export const SOUND_PREF_KEY = "icpay:sound"

const elements = new Map<string, HTMLAudioElement>()
const unlocked = new Set<string>()

// Absent means on: the setting only ever records a deliberate opt-out, so a
// fresh install and a cleared storage both land on the default rather than
// silently muting.
export function soundEnabled(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(SOUND_PREF_KEY) !== "off"
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(SOUND_PREF_KEY, on ? "on" : "off")
  listeners.forEach((l) => l())
}

const listeners = new Set<() => void>()

// The `storage` event only fires in *other* tabs, so the local set above
// notifies by hand -- without it the toggle would not move until a reload.
export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function audio(src: string): HTMLAudioElement {
  let element = elements.get(src)
  if (!element) {
    element = new Audio(src)
    element.volume = 0.5
    element.preload = "auto"
    elements.set(src, element)
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
function prime(src: string) {
  if (unlocked.has(src) || !soundEnabled()) return
  const a = audio(src)
  a.muted = true
  a.play()
    .then(() => {
      a.pause()
      a.currentTime = 0
      unlocked.add(src)
    })
    .catch(() => {
      // Nothing is unlocked, so the success screen simply stays silent.
    })
}

function play(src: string) {
  // Checked here too, not only at prime time: the toggle can be turned off
  // between the tap that primed and the screen that plays.
  if (!soundEnabled()) return
  const a = audio(src)
  // Stopped first: a prime still settling would otherwise keep rolling under
  // this one, which is the doubled chime.
  a.pause()
  a.muted = false
  a.currentTime = 0
  void a.play().catch(() => {})
}

export function primeSuccessChime() {
  prime(SUCCESS_SRC)
}

export function playSuccessChime() {
  play(SUCCESS_SRC)
}

export function primeLoginChime() {
  prime(LOGIN_SRC)
}

export function playLoginChime() {
  play(LOGIN_SRC)
}

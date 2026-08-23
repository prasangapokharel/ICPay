import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribeViewport(onStoreChange: () => void) {
  const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const sync = () => setIsDesktop(window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`).matches)
    const unsubscribe = subscribeViewport(sync)
    sync()
    return unsubscribe
  }, [])

  return isDesktop
}

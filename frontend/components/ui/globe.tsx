"use client"

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react"
import createGlobe, { type COBEOptions } from "cobe"
import { useMotionValue, useSpring } from "motion/react"
import { useTheme } from "next-themes"
import { LocaleFlag } from "@/components/i18n/locale-flag"
import { cn } from "@/lib/ui/utils"

const MOVEMENT_DAMPING = 1400

export interface GlobeCountryNode {
  id: string
  country: string
  name: string
  region: string
  location: [number, number] // [lat, lon]
  size: number
  color?: [number, number, number]
  nodes?: number
  latency?: string
}

export const DEFAULT_COUNTRY_NODES: GlobeCountryNode[] = [
  {
    id: "us",
    country: "us",
    name: "United States",
    region: "North America (US-East)",
    location: [40.7128, -74.006],
    size: 0.08,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 38,
    latency: "22ms",
  },
  {
    id: "ch",
    country: "ch",
    name: "Switzerland",
    region: "Europe (CH-Zurich)",
    location: [47.3769, 8.5417],
    size: 0.09,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 42,
    latency: "18ms",
  },
  {
    id: "de",
    country: "de",
    name: "Germany",
    region: "Europe (EU-Central)",
    location: [50.1109, 8.6821],
    size: 0.07,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 26,
    latency: "19ms",
  },
  {
    id: "gb",
    country: "gb",
    name: "United Kingdom",
    region: "Europe (UK-South)",
    location: [51.5074, -0.1278],
    size: 0.07,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 18,
    latency: "24ms",
  },
  {
    id: "sg",
    country: "sg",
    name: "Singapore",
    region: "Asia Pacific (AP-East)",
    location: [1.3521, 103.8198],
    size: 0.08,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 22,
    latency: "35ms",
  },
  {
    id: "jp",
    country: "jp",
    name: "Japan",
    region: "Asia Pacific (AP-Northeast)",
    location: [35.6762, 139.6503],
    size: 0.07,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 28,
    latency: "38ms",
  },
  {
    id: "np",
    country: "np",
    name: "Nepal",
    region: "South Asia (SA-North)",
    location: [27.7172, 85.3240],
    size: 0.08,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 14,
    latency: "42ms",
  },
  {
    id: "br",
    country: "br",
    name: "Brazil",
    region: "South America (SA-East)",
    location: [-23.5505, -46.6333],
    size: 0.07,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 16,
    latency: "60ms",
  },
  {
    id: "au",
    country: "au",
    name: "Australia",
    region: "Oceania (OC-East)",
    location: [-33.8688, 151.2093],
    size: 0.07,
    color: [236 / 255, 72 / 255, 153 / 255],
    nodes: 18,
    latency: "55ms",
  },
]

export const DARK_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => { },
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 3.2,
  baseColor: [0.32, 0.32, 0.38],
  markerColor: [236 / 255, 72 / 255, 153 / 255],
  glowColor: [0.18, 0.1, 0.22],
  markers: DEFAULT_COUNTRY_NODES.map((n) => ({
    location: n.location,
    size: n.size,
    color: n.color,
  })),
}

export const LIGHT_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => { },
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 1.8,
  baseColor: [0.9, 0.9, 0.94],
  markerColor: [225 / 255, 29 / 255, 72 / 255],
  glowColor: [0.94, 0.94, 0.98],
  markers: DEFAULT_COUNTRY_NODES.map((n) => ({
    location: n.location,
    size: n.size,
    color: [225 / 255, 29 / 255, 72 / 255],
  })),
}

export function Globe({
  className,
  config,
  countryNodes = DEFAULT_COUNTRY_NODES,
  selectedCountryId,
  onSelectCountry,
}: {
  className?: string
  config?: COBEOptions
  countryNodes?: GlobeCountryNode[]
  selectedCountryId?: string | null
  onSelectCountry?: (node: GlobeCountryNode) => void
}) {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  )

  const isDark = mounted ? resolvedTheme !== "light" : true
  const activeConfig = config ?? (isDark ? DARK_GLOBE_CONFIG : LIGHT_GLOBE_CONFIG)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const targetPhiRef = useRef<number | null>(null)
  const widthRef = useRef(0)
  const pointerInteracting = useRef<number | null>(null)
  const markerRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)
  const currentSelectedId = selectedCountryId !== undefined ? selectedCountryId : internalSelectedId

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const focusCountry = useCallback(
    (node: GlobeCountryNode) => {
      setInternalSelectedId(node.id)
      onSelectCountry?.(node)
      // Mathematical rotation to face target longitude directly
      targetPhiRef.current = -Math.PI / 2 - (node.location[1] * Math.PI) / 180
    },
    [onSelectCountry]
  )

  useEffect(() => {
    if (selectedCountryId) {
      const match = countryNodes.find((n) => n.id === selectedCountryId)
      if (match) {
        targetPhiRef.current = -Math.PI / 2 - (match.location[1] * Math.PI) / 180
      }
    }
  }, [selectedCountryId, countryNodes])

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
    if (value !== null) {
      targetPhiRef.current = null
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth
      }
    }

    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...activeConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        // Smooth transition toward selected target country
        if (targetPhiRef.current !== null) {
          let diff = targetPhiRef.current - phiRef.current
          diff = Math.atan2(Math.sin(diff), Math.cos(diff))
          if (Math.abs(diff) < 0.005) {
            phiRef.current = targetPhiRef.current
            targetPhiRef.current = null
          } else {
            phiRef.current += diff * 0.07
          }
        } else if (!pointerInteracting.current) {
          phiRef.current += 0.004
        }

        const currentPhi = phiRef.current + rs.get()
        state.phi = currentPhi
        state.width = widthRef.current * 2
        state.height = widthRef.current * 2

        // Fast GPU-accelerated projection of country flag markers
        const size = widthRef.current
        if (size > 0 && countryNodes && countryNodes.length > 0) {
          const radius = size * 0.4
          for (const node of countryNodes) {
            const el = markerRefs.current[node.id]
            if (!el) continue

            const [lat, lon] = node.location
            const latRad = (lat * Math.PI) / 180
            const lonRad = (lon * Math.PI) / 180 - Math.PI

            const cosLat = Math.cos(latRad)
            const sinLat = Math.sin(latRad)
            const cosLon = Math.cos(lonRad)
            const sinLon = Math.sin(lonRad)

            const x0 = -cosLat * cosLon
            const y0 = sinLat
            const z0 = cosLat * sinLon

            const x1 = x0 * Math.cos(currentPhi) + z0 * Math.sin(currentPhi)
            const y1 = y0
            const z1 = -x0 * Math.sin(currentPhi) + z0 * Math.cos(currentPhi)

            const x2 = x1
            const y2 = y1 * Math.cos(0.3) - z1 * Math.sin(0.3)
            const z2 = y1 * Math.sin(0.3) + z1 * Math.cos(0.3)

            const sx = size / 2 + x2 * radius
            const sy = size / 2 - y2 * radius

            if (z2 > 0.1) {
              const alpha = Math.min(1, (z2 - 0.1) * 3)
              el.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`
              el.style.opacity = `${alpha}`
              el.style.pointerEvents = "auto"
            } else {
              el.style.opacity = "0"
              el.style.pointerEvents = "none"
            }
          }
        }
      },
    })

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1"
    }, 0)

    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [rs, activeConfig, countryNodes])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto aspect-square w-full max-w-150 select-none",
        className
      )}
    >
      <canvas
        className="size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => {
          if (e.touches[0]) updateMovement(e.touches[0].clientX)
        }}
      />

      {/* Synchronized 3D Overlay Country Flag Nodes */}
      {countryNodes.map((node) => {
        const isSelected = currentSelectedId === node.id

        return (
          <div
            key={node.id}
            ref={(el) => {
              markerRefs.current[node.id] = el
            }}
            className="pointer-events-none absolute left-0 top-0 will-change-transform z-10 transition-opacity duration-150"
            style={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => focusCountry(node)}
              className={cn(
                "group flex items-center gap-1.5 rounded-full border bg-card/95 p-1 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-115 hover:border-primary cursor-pointer",
                isSelected
                  ? "border-primary ring-2 ring-primary/50 scale-110 shadow-primary/20"
                  : "border-border/80 hover:bg-card"
              )}
              title={`${node.name} · ${node.region}`}
            >
              <LocaleFlag
                country={node.country}
                label={node.name}
                size="sm"
                className="size-3.5 rounded-full object-cover shrink-0"
              />
              <span className="hidden font-mono text-[9px] font-medium text-foreground tracking-tight sm:group-hover:inline pr-1">
                {node.country.toUpperCase()}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

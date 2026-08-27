"use client"

import { useEffect } from "react"
import { useLocale } from "@/components/i18n/locale-provider"
import { STORAGE_KEY } from "@/language/config"
import { detectLocaleFromIp } from "@/lib/i18n/detect-locale-from-ip"

export function useAutoLocale() {
  const { setLocale } = useLocale()

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    void detectLocaleFromIp().then((locale) => {
      if (locale) setLocale(locale)
    })
  }, [setLocale])
}

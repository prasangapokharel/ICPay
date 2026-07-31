"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings } from "lucide-react"
import type { SettingsPublic } from "@/services/types"

type SettingsFormProps = {
  settings: SettingsPublic
  onSave: (theme: string, language: string, notifications: boolean) => Promise<string | null>
}

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
]

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export function SettingsForm({ settings, onSave }: SettingsFormProps) {
  const { theme: activeTheme, setTheme: applyTheme } = useTheme()
  const [theme, setTheme] = useState(settings.theme)
  const [language, setLanguage] = useState(settings.language)
  const [notifications, setNotifications] = useState(settings.notifications)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // The applied theme lives in next-themes (localStorage); the canister copy is
  // just the cross-device preference. Reconcile to whatever is actually applied.
  useEffect(() => {
    if (activeTheme) setTheme(activeTheme)
  }, [activeTheme])

  const handleThemeChange = (value: string) => {
    setTheme(value)
    applyTheme(value)
  }

  const handleSave = async () => {
    setError(null)
    setSaved(false)
    setLoading(true)
    const err = await onSave(theme, language, notifications)
    if (err) setError(err)
    else setSaved(true)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings
        </CardTitle>
        <CardDescription>Customize your wallet experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select value={theme} onValueChange={(v) => v && handleThemeChange(v)}>
            <SelectTrigger id="theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
            <SelectTrigger id="language" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Notifications</Label>
            <p className="text-xs text-muted-foreground">Receive transaction notifications</p>
          </div>
          <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {saved && (
          <Alert>
            <AlertDescription>Settings saved successfully</AlertDescription>
          </Alert>
        )}
        <Button className="w-full" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}

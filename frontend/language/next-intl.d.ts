// Makes useTranslations("...") key-checked against the English catalog, so a
// typo or a key removed from en/common.json fails `tsc` instead of rendering
// the raw key string in the UI.
import type en from "./en/common.json"

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en
    Locale: (typeof import("./config"))["LOCALES"][number]["code"]
  }
}

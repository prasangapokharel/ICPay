export const SITE_VERIFICATION = {
  google: "6jnIRWeq6mzEmElP-A7kd2_VRBtz8PAl8vsUnWZSFoc",
  yandex: "5ad19f1b1325ba5b",
} as const

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? ""

export const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim() ?? ""

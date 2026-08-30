export const charityCampaignShellClass = "bg-primary/5 dark:bg-primary/10"

export function isCharityCampaignPath(pathname: string) {
  return pathname.startsWith("/charity/") && pathname !== "/charity"
}

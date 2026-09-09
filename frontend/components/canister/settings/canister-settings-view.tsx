"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  CpuIcon,
  EyeIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { isPremiumHandle } from "@/lib/verified/premiumTick"
import { PremiumLockedCard } from "@/components/shared/premium-gate"
import { CanisterGuideCard } from "./canister-guide-card"
import { CanisterControllersCard } from "./canister-controllers-card"
import { CanisterResourcesCard } from "./canister-resources-card"
import { CanisterVisibilityCard } from "./canister-visibility-card"
import { CanisterLifecycleCard } from "./canister-lifecycle-card"
import type { CanisterStatusView } from "@/services/canister/management"

export function CanisterSettingsView({
  canisterId,
  data,
  isController,
  onRefresh,
}: {
  canisterId: string
  data: CanisterStatusView
  isController: boolean
  onRefresh: () => void
}) {
  const [activeTab, setActiveTab] = useState("controllers")
  const { data: profile } = useOwnProfile()
  const username = profile?.username[0] ?? null
  const isPremium = isPremiumHandle(username)

  return (
    <div className="space-y-5">
      {/* Educational Guide Card */}
      <CanisterGuideCard />

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList variant="line" className="w-full justify-start border-b border-border/40 gap-4 sm:gap-6">
          <TabsTrigger value="controllers" className="gap-1.5 pb-2 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
            <span>Controllers</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5 pb-2 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={CpuIcon} className="size-4" />
            <span>Resources</span>
            {!isPremium && (
              <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] font-semibold text-primary border-primary/30 bg-primary/5">
                PRO
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="visibility" className="gap-1.5 pb-2 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={EyeIcon} className="size-4" />
            <span>Visibility</span>
            {!isPremium && (
              <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] font-semibold text-primary border-primary/30 bg-primary/5">
                PRO
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-1.5 pb-2 text-xs sm:text-sm text-destructive cursor-pointer">
            <HugeiconsIcon icon={Alert02Icon} className="size-4" />
            <span>Lifecycle</span>
          </TabsTrigger>
        </TabsList>

        {/* Controllers */}
        <TabsContent value="controllers" className="space-y-4">
          <CanisterControllersCard
            canisterId={canisterId}
            controllers={data.controllers}
            isController={isController}
            onRefresh={onRefresh}
          />
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          {isPremium ? (
            <CanisterResourcesCard
              canisterId={canisterId}
              data={data}
              isController={isController}
              onRefresh={onRefresh}
            />
          ) : (
            <PremiumLockedCard
              title="Resource & Compute Limits"
              description="Configuring on-chain compute allocation, guaranteed physical RAM reservation, 32-bit Wasm memory limits, and custom freezing protection thresholds is reserved for Premium handle owners (1–4 characters)."
              actionText="Get Premium Handle"
              href="/username"
            />
          )}
        </TabsContent>

        {/* Visibility */}
        <TabsContent value="visibility" className="space-y-4">
          {isPremium ? (
            <CanisterVisibilityCard
              canisterId={canisterId}
              initialLogVisibility={data.logVisibility}
              isController={isController}
              onRefresh={onRefresh}
            />
          ) : (
            <PremiumLockedCard
              title="Canister Log Visibility"
              description="Configuring public log streaming versus controller-only inspection for autonomous on-chain diagnostics is reserved for Premium handle owners (1–4 characters)."
              actionText="Get Premium Handle"
              href="/username"
            />
          )}
        </TabsContent>

        {/* Lifecycle / Danger */}
        <TabsContent value="danger" className="space-y-4">
          <CanisterLifecycleCard
            canisterId={canisterId}
            runStatus={data.runStatus}
            isController={isController}
            onRefresh={onRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

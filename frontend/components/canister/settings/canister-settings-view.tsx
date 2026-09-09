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

  return (
    <div className="space-y-5">
      {/* Educational Guide Card */}
      <CanisterGuideCard />

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 p-1">
          <TabsTrigger value="controllers" className="gap-1.5 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
            <span>Controllers</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={CpuIcon} className="size-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger value="visibility" className="gap-1.5 text-xs sm:text-sm cursor-pointer">
            <HugeiconsIcon icon={EyeIcon} className="size-4" />
            <span>Visibility</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-1.5 text-xs sm:text-sm text-destructive cursor-pointer">
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
          <CanisterResourcesCard
            canisterId={canisterId}
            data={data}
            isController={isController}
            onRefresh={onRefresh}
          />
        </TabsContent>

        {/* Visibility */}
        <TabsContent value="visibility" className="space-y-4">
          <CanisterVisibilityCard
            canisterId={canisterId}
            initialLogVisibility={data.logVisibility}
            isController={isController}
            onRefresh={onRefresh}
          />
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

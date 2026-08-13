"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BucketCodeBlock } from "@/components/bucket/bucket-code-block"
import type { DocsExampleLang } from "@/lib/bucket/docs-examples"

const LANGS: { value: DocsExampleLang; label: string }[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "curl", label: "cURL" },
]

type BucketCodeTabsProps = {
  examples: Record<DocsExampleLang, string>
  defaultLang?: DocsExampleLang
}

export function BucketCodeTabs({ examples, defaultLang = "typescript" }: BucketCodeTabsProps) {
  return (
    <Tabs defaultValue={defaultLang} className="gap-2">
      <TabsList variant="line" className="h-8 w-full justify-start gap-0 border-b bg-transparent p-0">
        {LANGS.map((lang) => (
          <TabsTrigger
            key={lang.value}
            value={lang.value}
            className="h-8 rounded-none px-3 text-xs after:bottom-0"
          >
            {lang.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {LANGS.map((lang) => (
        <TabsContent key={lang.value} value={lang.value} className="mt-0">
          <BucketCodeBlock code={examples[lang.value]} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

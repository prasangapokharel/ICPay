"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon, ArrowUpDownIcon } from "@hugeicons/core-free-icons"
import {
  Markdown,
  Openai,
  Claude,
  ClaudeCode,
  Mcp,
  VisualStudioCode,
} from "@dev.icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { copyText } from "@/lib/wallet/utils"
import { toast } from "sonner"

type BucketDocsCopyMenuProps = {
  markdown: string
  title?: string
}

export function BucketDocsCopyMenu({ markdown, title = "ICBucket Documentation" }: BucketDocsCopyMenuProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPage = async () => {
    await copyText(markdown)
    setCopied(true)
    toast.success("Page copied as Markdown for LLMs")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer")
  }

  const handleOpenChatGPT = async () => {
    const prompt = `Here is the documentation for ${title}:\n\n${markdown}`
    await copyText(prompt)
    toast.success("Prompt copied to clipboard! Opening ChatGPT...")
    const url = `https://chatgpt.com/?q=${encodeURIComponent(`Explain this ICBucket documentation and how to use it:\n\n` + markdown.slice(0, 3000))}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleOpenClaude = async () => {
    const prompt = `Here is the documentation for ${title}:\n\n${markdown}`
    await copyText(prompt)
    toast.success("Prompt copied to clipboard! Opening Claude...")
    const url = `https://claude.ai/new?q=${encodeURIComponent(`Explain this ICBucket documentation and how to use it:\n\n` + markdown.slice(0, 3000))}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleConnectMCP = async () => {
    const mcpConfig = JSON.stringify(
      {
        mcpServers: {
          icbucket: {
            command: "npx",
            args: ["-y", "@icpay/icbucket-mcp"],
          },
        },
      },
      null,
      2
    )
    await copyText(mcpConfig)
    toast.success("MCP server JSON config copied to clipboard!")
  }

  const handleConnectVSCode = async () => {
    const vscodeSnippet = JSON.stringify(
      {
        "mcp.servers": {
          icbucket: {
            command: "npx",
            args: ["-y", "@icpay/icbucket-mcp"],
          },
        },
      },
      null,
      2
    )
    await copyText(vscodeSnippet)
    toast.success("VSCode MCP configuration copied!")
  }

  const handleConnectClaudeCode = async () => {
    const command = "claude mcp add icbucket -- npx -y @icpay/icbucket-mcp"
    await copyText(command)
    toast.success("Claude Code command copied!")
  }

  const handleConnectCodex = async () => {
    const codexConfig = "codex mcp add icbucket npx -y @icpay/icbucket-mcp"
    await copyText(codexConfig)
    toast.success("Codex configuration command copied!")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-border/70 bg-card/80 px-2.5 text-xs font-medium backdrop-blur-xs hover:border-primary/40 hover:bg-accent cursor-pointer transition-all"
          />
        }
      >
        <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5 text-primary" />
        <span>{copied ? "Copied" : "Copy"}</span>
        <HugeiconsIcon icon={ArrowUpDownIcon} className="size-3 text-muted-foreground ml-0.5 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-1.5 rounded-2xl border-border/60 bg-popover/95 backdrop-blur-md shadow-2xl">
        {/* Core Markdown options */}
        <DropdownMenuItem
          onClick={handleCopyPage}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <HugeiconsIcon icon={Copy01Icon} className="size-4 shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">Copy page</span>
            <span className="text-[11px] text-muted-foreground leading-snug">Copy page as Markdown for LLMs</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleViewMarkdown}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <Markdown size={16} className="shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">View as Markdown ↗</span>
            <span className="text-[11px] text-muted-foreground leading-snug">View this page as plain text</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-border/40" />

        {/* AI Chat assistants */}
        <DropdownMenuItem
          onClick={handleOpenChatGPT}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <Openai size={16} className="shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">Open in ChatGPT ↗</span>
            <span className="text-[11px] text-muted-foreground leading-snug">Ask ChatGPT about this page</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleOpenClaude}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <Claude size={16} className="shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">Open in Claude ↗</span>
            <span className="text-[11px] text-muted-foreground leading-snug">Ask Claude about this page</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-border/40" />

        {/* MCP & Tooling Connectors */}
        <DropdownMenuItem
          onClick={handleConnectMCP}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <Mcp size={16} className="shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">Connect with MCP</span>
            <span className="text-[11px] text-muted-foreground leading-snug">Add this MCP to any compatible client</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleConnectVSCode}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <VisualStudioCode size={16} className="shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">Connect to VSCode ↗</span>
            <span className="text-[11px] text-muted-foreground leading-snug">Use this MCP in VSCode</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleConnectClaudeCode}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <ClaudeCode size={16} className="shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">Connect to Claude Code</span>
            <span className="text-[11px] text-muted-foreground leading-snug">Use this MCP in Claude Code</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleConnectCodex}
          className="flex items-start gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <Openai size={16} className="shrink-0 text-primary mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground">Connect to Codex</span>
            <span className="text-[11px] text-muted-foreground leading-snug">Use this MCP in Codex</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

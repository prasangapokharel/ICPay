"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  children: ReactNode
  title?: string
  fallback?: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  private reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">
          {this.props.title ?? "This section failed to load"}
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {this.state.error.message || "An unexpected error occurred."}
        </p>
        <Button type="button" size="sm" onClick={this.reset}>
          Try again
        </Button>
      </div>
    )
  }
}

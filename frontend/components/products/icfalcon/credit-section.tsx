import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function CreditSection() {
  return (
    <section className="border-t px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Architecture & Design</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              ICFalcon framework architecture and implementation designed by
            </p>
            <Link
              href="https://www.prasangapokharel.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-lg font-semibold underline underline-offset-4 hover:text-primary"
            >
              Prasanga Raman Pokharel
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              Four-layer Motoko canister architecture · Internet Computer
              development · Open-source frameworks
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

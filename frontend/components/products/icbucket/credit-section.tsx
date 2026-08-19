import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function CreditSection() {
  return (
    <section className="border-t py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-muted/30">
            <CardContent className="py-6">
              <div className="space-y-1 text-center">
                <h3 className="font-semibold">Architecture & Design</h3>
                <p className="text-sm text-muted-foreground">
                  Designed and developed by{" "}
                  <Link
                    href="https://www.prasangapokharel.com.np"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Prasanga Raman Pokharel
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

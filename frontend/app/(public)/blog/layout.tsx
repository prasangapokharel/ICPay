import { BlogLayoutShell } from "@/components/blog/blog-layout-shell"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogLayoutShell>{children}</BlogLayoutShell>
}

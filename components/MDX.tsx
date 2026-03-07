import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

const mdxComponents = {
  h2: (p: any) => <h2 className="mt-12 text-2xl font-semibold tracking-tight" {...p} />,
  h3: (p: any) => <h3 className="mt-10 text-xl font-semibold tracking-tight" {...p} />,
  p: (p: any) => <p className="mt-4 leading-relaxed text-zinc-200" {...p} />,
  a: (p: any) => <a className="underline underline-offset-4 text-zinc-100 hover:text-white" {...p} />,
  ul: (p: any) => <ul className="mt-4 list-disc pl-6 text-zinc-200 space-y-2" {...p} />,
  ol: (p: any) => <ol className="mt-4 list-decimal pl-6 text-zinc-200 space-y-2" {...p} />,
  code: (p: any) => <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-100" {...p} />,
  pre: (p: any) => (
    <pre
      className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-5 text-sm leading-relaxed"
      {...p}
    />
  ),
  blockquote: (p: any) => (
    <blockquote className="mt-6 border-l border-white/20 pl-4 text-zinc-300" {...p} />
  ),
}

export function MDX({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
        },
      }}
    />
  )
}
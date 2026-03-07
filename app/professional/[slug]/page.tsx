import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { getBySlug, Collection } from "@/lib/content"

// 1. CHANGE THIS FOR EACH FOLDER (e.g., "movies", "travel", "funny")
const COLLECTION: Collection = "professional"

export default async function EntryPage({ params }: { params: { slug: string } }) {
  // 2. Fetch data using the new unified engine
  const item = getBySlug(COLLECTION, params.slug)

  // 3. If the file doesn't exist, trigger a 404
  if (!item) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
      {/* Header / Metadata Section */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-none mb-8">
          {item.frontmatter.title}
        </h1>
        
        <div className="flex flex-wrap gap-8 border-y border-white/10 py-6 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <div>
            <span className="block text-zinc-600 mb-1">Date Published</span>
            <span className="text-zinc-300">{item.frontmatter.date}</span>
          </div>
          <div>
            <span className="block text-zinc-600 mb-1">Read Time</span>
            <span className="text-zinc-300">{item.readingMinutes} MIN</span>
          </div>
          {item.frontmatter.rating && (
            <div>
              <span className="block text-zinc-600 mb-1">Rating</span>
              <span className="text-zinc-300">{item.frontmatter.rating}</span>
            </div>
          )}
        </div>
      </header>

      {/* The Content Body */}
      <article className="prose prose-invert prose-zinc max-w-none 
        prose-headings:uppercase prose-headings:tracking-tighter 
        prose-p:text-zinc-400 prose-p:leading-relaxed
        prose-a:text-white prose-a:no-underline hover:prose-a:text-zinc-300
        prose-code:text-zinc-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded">
        
        <MDXRemote source={item.mdx} />
      </article>

      {/* Technical Footer Tags */}
      <footer className="mt-20 pt-10 border-t border-white/10 flex flex-wrap gap-2">
        {item.tags.map((tag: any) => (
          <span 
            key={tag.slug} 
            className="border border-white/20 px-3 py-1 text-[9px] font-mono text-zinc-500 uppercase tracking-widest"
          >
            SYS.TAG::{tag.name}
          </span>
        ))}
      </footer>
    </main>
  )
}
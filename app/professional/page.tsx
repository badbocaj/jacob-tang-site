import Link from "next/link"
import { getCollection, Collection } from "@/lib/content"

// ONLY CHANGE THESE TWO FOR OTHER PAGES
const TITLE = "Professional"
const FOLDER: Collection = "professional" 

export default function CategoryPage() {
  const items = getCollection(FOLDER)

  return (
    <main className="mx-auto max-w-5xl px-6 pt-32 pb-20">
      <div className="mb-12">
        <h1 className="text-5xl font-bold uppercase tracking-tighter text-white">{TITLE}</h1>
        <div className="h-[1px] w-full bg-white/10 mt-6" />
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <p className="text-zinc-500 font-mono text-sm">No entries found in content/{FOLDER}</p>
        ) : (
          items.map((item) => (
            <Link 
              key={item.slug} 
              href={`/${FOLDER}/${item.slug}`}
              className="group flex flex-col border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold uppercase text-white group-hover:text-zinc-300">
                  {item.frontmatter.title}
                </h2>
                <span className="font-mono text-[10px] text-zinc-500">
                  {item.frontmatter.date}
                </span>
              </div>
              <p className="mt-4 text-zinc-400 leading-relaxed max-w-2xl">
                {item.frontmatter.summary}
              </p>
              
              <div className="mt-6 flex gap-2">
                {item.tags.map((tag: any) => (
                  <span key={tag.slug} className="border border-white/10 px-2 py-1 text-[9px] uppercase font-mono text-zinc-500">
                    {tag.name}
                  </span>
                ))}
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
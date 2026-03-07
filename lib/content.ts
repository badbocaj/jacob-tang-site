import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"

export type Collection = "professional" | "projects" | "travel" | "movies" | "funny"

export function getCollection(collection: Collection) {
  const dir = path.join(process.cwd(), "content", collection)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx"))

  return files.map((file) => {
    const slug = file.replace(".mdx", "")
    const raw = fs.readFileSync(path.join(dir, file), "utf-8")
    const { data, content } = matter(raw)
    
    return {
      slug,
      mdx: content,
      readingMinutes: Math.round(readingTime(content).minutes),
      frontmatter: data,
      // This is the fix for the "red squiggles" - we build the tags here
      tags: data.tags?.map((t: string) => ({ name: t, slug: t.toLowerCase().replace(/ /g, '-') })) || []
    }
  }).sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
}

export function getBySlug(collection: Collection, slug: string) {
  const all = getCollection(collection)
  return all.find(item => item.slug === slug) || null
}
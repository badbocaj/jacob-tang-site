export function slugifyTag(tag: string) {
    return tag.trim().toLowerCase().replace(/\s+/g, "-")
  }
  
  export function formatDate(dateISO: string) {
    const d = new Date(dateISO)
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
  }
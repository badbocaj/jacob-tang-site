export const runtime = "nodejs";

export async function GET() {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Jacob Tang</title>
    <link>https://example.com</link>
    <description>RSS feed</description>
  </channel>
</rss>
`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

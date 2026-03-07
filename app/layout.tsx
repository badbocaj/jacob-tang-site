import "./globals.css"; // THIS IS THE MAGIC LINE
import { Navbar } from "@/components/Navbar"; // <-- Import your Navbar here (adjust the path if yours is different!)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Add it right here on the <html> tag!
    <html lang="en" suppressHydrationWarning>
      {/* bg-black and text-white set your dark mode defaults! */}
      <body className="bg-black text-white antialiased">
        
        {/* 1. Add the Navbar here so it wraps every page */}
        <Navbar />

        {/* 2. Wrap children in a main tag with top padding (pt-24).
          Because your Navbar has 'fixed top-0', it floats above the page.
          Without this padding, the top of your page content would hide underneath the Navbar!
        */}
        <main>
          {children}
        </main>
        
      </body>
    </html>
  );
}
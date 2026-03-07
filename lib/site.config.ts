export const siteConfig = {
    name: "Jacob Tang",
    /** Short quote shown in the top banner (center). */
    heroQuote: "Curious operator. I build to understand.",
    /** Hero background image: put your photo in `public/hero.jpg` (or .png). Leave empty for no image. */
    heroImage: "/hero.jpg",
    title: "Jacob Tang — Curious operator. I build to understand.",
    description:  
      "Engineering portfolio + writing. Systems, structures, testing, manufacturing, and the ideas behind building.",
    url: "https://example.com", // change later
    socials: {
      email: "jdtang@usc.edu",
      github: "https://github.com/badbocaj",
      linkedin: "https://linkedin.com/in/tangjacob",
    },
    metrics: [
      { label: "Projects shipped", value: "20+" },
      { label: "Domains explored", value: "Structures • Testing • Software • DFM" },
      { label: "Bias", value: "Build → Measure → Iterate" },
    ],
    // Optional: force specific featured items to appear first
    featured: {
      projects: ["hpft-joint-iteration", "test-stand-regulator"],
      blog: ["build-log-fast-prototypes", "systems-over-style"],
    },
  } as const
  
// data/travel.ts

export interface TravelEntry {
    id: string;
    title: string;
    location: string;
    date: string;
    excerpt: string;
    journal: string;
    images: string[];
    tags: string[];
  }
  
  export const travelEntries: TravelEntry[] = [
    {
      id: "tokyo-2025",
      title: "Neon & Concrete",
      location: "Tokyo, Japan",
      date: "10.24.2025 - 11.04.2025",
      excerpt: "Navigating the dense layers of Shinjuku. A study in orderly chaos.",
      journal: "The city operates like a perfectly tuned motherboard. Beneath the overwhelming sensory input of neon and moving crowds, there is a rigid, elegant logic to how millions of people traverse this space without colliding. I spent hours simply observing the transit systems, taking notes on the flow states of the metropolis.",
      // To add photos: Create a folder in public/travel/tokyo/ and drop them in.
      images: [
        "/travel/tokyo/1.jpg", 
        "/travel/tokyo/2.jpg",
        "/travel/tokyo/3.jpg",
        "/travel/tokyo/4.jpg",
      ],
      tags: ["URBAN", "SYSTEMS", "TRANSIT"]
    },
    {
      id: "iceland-2024",
      title: "Glacial Topography",
      location: "Vatnajökull, Iceland",
      date: "02.14.2024 - 02.21.2024",
      excerpt: "Documenting the shifting structures of ancient ice.",
      journal: "There is a profound silence here, broken only by the structural cracking of the glacier. Walking on this terrain feels like stepping onto an alien planet. The visual language is entirely reduced to blues, whites, and volcanic blacks. It was a stark reset for my perspective on scale and time.",
      images: [
        "/travel/iceland/1.jpg", 
        "/travel/iceland/2.jpg",
      ],
      tags: ["NATURE", "ISOLATION", "SCALE"]
    }
  ];
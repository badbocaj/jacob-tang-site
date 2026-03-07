// app/travel/page.tsx
import { getCollection, Collection } from "@/lib/content";
import TravelClient from "./TravelClient";
import Particles from "@/components/particles"; // Import your particles!

const FOLDER: Collection = "travel";

export default function TravelTimelinePage() {
  // 1. Fetch data safely on the server
  const items = getCollection(FOLDER);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black flex items-center justify-center">
      
      {/* 2. THE SPACE ENGINE - Locked in the background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Adjust these props based on your specific Particles component setup */}
        <Particles 
          particleCount={250} 
          speed={0.05} 
          particleColors={["#ffffff", "#f59e0b", "#6b7280"]} 
        />
      </div>

      {/* 3. THE INTERACTIVE LAYER - Passes the server data to the client */}
      <TravelClient items={items} />

    </main>
  );
}
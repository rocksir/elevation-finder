import React from "react";
import HeroBackground from "../components/HeroBackground";
import LocationSearch from "../components/LocationSearch";
import AdBanner from "../components/AdBanner";

export default function Index() {
  return (
    <main className="p-6">
      <HeroBackground />
      <h1 className="text-2xl font-bold mb-4">Elevation Finder</h1>
      <LocationSearch onSelect={(q) => console.log("search:", q)} />
      <div className="mt-6">
        <AdBanner />
      </div>
    </main>
  );
}

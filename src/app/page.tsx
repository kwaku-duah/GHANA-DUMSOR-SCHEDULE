// src/app/page.tsx

import regionsData from "@/../public/data/regions.json";
import RegionCard from "@/components/RegionCard";
import { Region } from "@/types";

export default function Home() {
  const regions: Region[] = regionsData.regions;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🇬🇭 Ghana Load Shedding
          </h1>
          <p className="text-gray-500 mt-1">
            Select your region to see today&apos;s schedule
          </p>
        </div>

        {/* 16 Region Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {regions.map((region) => (
            <a key={region.id} href={`/${region.id}`}>
              <RegionCard region={region}  />
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}
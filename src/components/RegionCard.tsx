// src/components/RegionCard.tsx
"use client";

import { Region } from "@/types";

interface Props {
  region: Region;
}

export default function RegionCard({ region }: Props) {
  return (
    <div className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white
      hover:border-green-500 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-800 group-hover:text-green-700">
          {region.name}
        </span>
        <span className="text-gray-400 group-hover:text-green-500 text-sm">→</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">View load shedding schedule</p>
    </div>
  );
}
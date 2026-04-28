// src/components/TownList.tsx

"use client";

import { DaySchedule, TimeSlot } from "@/types";

const SLOT_LABELS: Record<TimeSlot, string> = {
  "12am-6am":  "12:00am – 6:00am",
  "6am-12pm":  "6:00am – 12:00pm",
  "12pm-6pm":  "12:00pm – 6:00pm",
  "6pm-12am":  "6:00pm – 12:00am",
};

const SLOT_ORDER: TimeSlot[] = ["12am-6am", "6am-12pm", "12pm-6pm", "6pm-12am"];

const SLOT_COLORS: Record<TimeSlot, string> = {
  "12am-6am":  "bg-indigo-50 border-indigo-200 text-indigo-700",
  "6am-12pm":  "bg-yellow-50 border-yellow-200 text-yellow-700",
  "12pm-6pm":  "bg-orange-50 border-orange-200 text-orange-700",
  "6pm-12am":  "bg-blue-50  border-blue-200  text-blue-700",
};

interface Props {
  schedule: DaySchedule;
  filterSlot: TimeSlot | null;
  searchQuery: string;
}

export default function TownList({ schedule, filterSlot, searchQuery }: Props) {
  const query = searchQuery.toLowerCase();

  // filter towns by search and active timeslot
  const filtered = schedule.towns.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(query);
    const matchesSlot   = filterSlot ? t.timeSlot === filterSlot : true;
    return matchesSearch && matchesSlot;
  });

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-gray-400 mt-4">
        No towns match your search.
      </p>
    );
  }

  // group filtered towns by timeslot
  const grouped = SLOT_ORDER.reduce<Record<TimeSlot, string[]>>(
    (acc, slot) => {
      acc[slot] = filtered
        .filter((t) => t.timeSlot === slot)
        .map((t) => t.name);
      return acc;
    },
    {} as Record<TimeSlot, string[]>
  );

  return (
    <div className="space-y-4 mt-4">
      {SLOT_ORDER.map((slot) => {
        const towns = grouped[slot];
        if (towns.length === 0) return null;
        return (
          <div key={slot} className={`rounded-xl border p-4 ${SLOT_COLORS[slot]}`}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2">
              🔌 Off {SLOT_LABELS[slot]}
            </p>
            <div className="flex flex-wrap gap-2">
              {towns.map((name) => (
                <span
                  key={name}
                  className="bg-white/70 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
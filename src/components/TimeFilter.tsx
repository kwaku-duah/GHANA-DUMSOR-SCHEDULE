// src/components/TimeFilter.tsx

"use client";

import { TimeSlot } from "@/types";

const TIME_SLOTS: { value: TimeSlot; label: string; hours: string }[] = [
  { value: "12am-6am",  label: "midnight – 6am",  hours: "12:00am – 6:00am" },
  { value: "6am-12pm",  label: "6am – noon",       hours: "6:00am – 12:00pm" },
  { value: "12pm-6pm",  label: "noon – 6pm",       hours: "12:00pm – 6:00pm" },
  { value: "6pm-12am",  label: "6pm – midnight",   hours: "6:00pm – 12:00am" },
];

interface Props {
  selected: TimeSlot | null;
  onChange: (slot: TimeSlot | null) => void;
}

export default function TimeFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_SLOTS.map((slot) => {
        const active = selected === slot.value;
        return (
          <button
            key={slot.value}
            onClick={() => onChange(active ? null : slot.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
              ${active
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600"
              }`}
          >
            {slot.label}
            <span className="ml-1 text-xs opacity-70">{slot.hours}</span>
          </button>
        );
      })}
    </div>
  );
}
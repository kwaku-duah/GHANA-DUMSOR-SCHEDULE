"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import regionsData from "@/../public/data/regions.json";
import SearchBar from "@/components/SearchBar";
import TimeFilter from "@/components/TimeFilter";
import TownList from "@/components/TownList";
import AddTownsModal from "@/components/AddTownsModal";
import { Region, DaySchedule, TimeSlot, ScheduledTown } from "@/types";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

const slotMap: Record<string, TimeSlot> = {
  "12:00am-6:00am": "12am-6am",
  "6:00am-12:00pm": "6am-12pm",
  "12:00pm-6:00pm": "12pm-6pm",
  "6:00pm-12:00am": "6pm-12am",
};

function normalizeSlot(s: string): TimeSlot {
  return slotMap[s] ?? (s as TimeSlot);
}

interface RawSlot {
  timeSlot: string;
  towns: string[];
}

interface RawTownObject {
  name: string;
  timeSlot: string;
}

interface RawSchedule {
  regionId?: string;
  date?: string;
  timeSlot?: string;
  towns?: string[] | RawTownObject[];
  slots?: RawSlot[];
}

function parseSchedule(
  data: RawSchedule,
  regionId: string,
  date: string,
): DaySchedule {
  let towns: ScheduledTown[];

  if (data.slots && data.slots.length > 0) {
    // Multi-slot format: { slots: [{ timeSlot, towns: string[] }] }
    towns = data.slots.flatMap((slot: RawSlot) =>
      slot.towns.map((name: string) => ({
        name,
        timeSlot: normalizeSlot(slot.timeSlot),
      })),
    );
  } else if (
    Array.isArray(data.towns) &&
    data.towns.length > 0 &&
    typeof data.towns[0] === "string"
  ) {
    // Legacy flat format: { timeSlot: string, towns: string[] }
    towns = (data.towns as string[]).map((name) => ({
      name,
      timeSlot: normalizeSlot(data.timeSlot ?? ""),
    }));
  } else {
    // Object format: { towns: [{ name, timeSlot }] }
    towns = ((data.towns ?? []) as RawTownObject[]).map((t) => ({
      name: t.name,
      timeSlot: normalizeSlot(t.timeSlot),
    }));
  }

  return {
    regionId: data.regionId ?? regionId,
    date: data.date ?? date,
    towns,
  };
}

export default function RegionPage() {
  const params = useParams();
  const regionId = params?.regionId as string;

  const region: Region | undefined = (regionsData.regions as Region[]).find(
    (r) => r.id === regionId,
  );

  const today = getTodayDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [search, setSearch] = useState("");
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!regionId) return;

    let cancelled = false;

    async function loadSchedule() {
      setSchedule(null);

      const cached = await Promise.resolve().then(() => {
        try {
          const stored = localStorage.getItem(
            `schedule_${regionId}_${selectedDate}`,
          );
          return stored ? (JSON.parse(stored) as DaySchedule) : null;
        } catch {
          return null;
        }
      });

      if (cancelled) return;

      if (cached) {
        setSchedule(cached);
        return;
      }

      setLoading(true);

      try {
        const r = await fetch(
          `/data/schedules/${regionId}/${selectedDate}.json`,
        );
        if (!r.ok) throw new Error("not found");
        const data = (await r.json()) as RawSchedule;
        if (!cancelled)
          setSchedule(parseSchedule(data, regionId, selectedDate));
      } catch {
        if (!cancelled)
          setSchedule({ regionId, date: selectedDate, towns: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [regionId, selectedDate]);

  const handleSaveTowns = (
    newTowns: { name: string; timeSlot: TimeSlot }[],
  ) => {
    const updated: DaySchedule = {
      regionId,
      date: selectedDate,
      towns: [...(schedule?.towns ?? []), ...newTowns],
    };
    setSchedule(updated);
    try {
      localStorage.setItem(
        `schedule_${regionId}_${selectedDate}`,
        JSON.stringify(updated),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {}
    setShowAddModal(false);
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  if (!regionId) return null;

  if (!region) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Region not found.</p>
          <Link href="/" className="text-green-600 underline mt-2 block">
            ← Back to all regions
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors"
        >
          ← All Regions
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🇬🇭 {region.name}
            </h1>
            <p className="text-sm text-gray-400 mt-1">Load shedding schedule</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={goToPrevDay}
                className="px-2 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm font-medium text-gray-700">
                {selectedDate}
              </span>
              <button
                onClick={goToNextDay}
                className="px-2 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search towns in this region…"
          />
        </div>

        <div className="mb-6">
          <TimeFilter selected={timeSlot} onChange={setTimeSlot} />
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading schedule…</p>
        ) : schedule && schedule.towns.length > 0 ? (
          <TownList
            schedule={schedule}
            filterSlot={timeSlot}
            searchQuery={search}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
            <p className="text-2xl mb-2">📋</p>
            <p className="font-medium">No schedule for this date yet</p>
            <p className="text-sm mt-1">
              No load shedding data available for {region.name} on{" "}
              {selectedDate}.
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddTownsModal
          regionName={region.name}
          onSave={handleSaveTowns}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </main>
  );
}

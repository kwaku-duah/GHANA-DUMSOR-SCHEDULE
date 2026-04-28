"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import regionsData from "@/../public/data/regions.json";
import SearchBar from "@/components/SearchBar";
import TimeFilter from "@/components/TimeFilter";
import TownList from "@/components/TownList";
import AddTownsModal from "@/components/AddTownsModal";
import { Region, DaySchedule, TimeSlot } from "@/types";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function RegionPage() {
  const params = useParams();
  const regionId = params?.regionId as string;

  const region: Region | undefined = (regionsData.regions as Region[]).find(
    (r) => r.id === regionId
  );

  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [search, setSearch] = useState("");
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = getTodayDate();

  useEffect(() => {
    if (!regionId) return;
    setLoading(true);

    try {
      const stored = localStorage.getItem(`schedule_${regionId}_${today}`);
      if (stored) {
        setSchedule(JSON.parse(stored));
        setLoading(false);
        return;
      }
    } catch (_) {}

    fetch(`/data/schedules/${regionId}/${today}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        let normalized: DaySchedule;
        if (data.towns.length > 0 && typeof data.towns[0] === "string") {
          normalized = {
            regionId: data.regionId,
            date: data.date,
            towns: (data.towns as string[]).map((name) => ({
              name,
              timeSlot: data.timeSlot as TimeSlot,
            })),
          };
        } else {
          normalized = data as DaySchedule;
        }
        setSchedule(normalized);
      })
      .catch(() => {
        setSchedule({ regionId, date: today, towns: [] });
      })
      .finally(() => setLoading(false));
  }, [regionId, today]);

  const handleSaveTowns = (newTowns: { name: string; timeSlot: TimeSlot }[]) => {
    const updated: DaySchedule = {
      regionId,
      date: today,
      towns: [...(schedule?.towns ?? []), ...newTowns],
    };
    setSchedule(updated);
    try {
      localStorage.setItem(`schedule_${regionId}_${today}`, JSON.stringify(updated));
    } catch (_) {}
    setShowAddModal(false);
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
            <p className="text-sm text-gray-400 mt-1">
              Load shedding schedule · {today}
            </p>
          </div>
          {/* <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            + Add Towns
          </button> */}
        </div>

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search towns in this region…" />
        </div>

        <div className="mb-6">
          <TimeFilter selected={timeSlot} onChange={setTimeSlot} />
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading schedule…</p>
        ) : schedule && schedule.towns.length > 0 ? (
          <TownList schedule={schedule} filterSlot={timeSlot} searchQuery={search} />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
            <p className="text-2xl mb-2">📋</p>
            <p className="font-medium">No schedule for today yet</p>
            <p className="text-sm mt-1">
              Use &quot;+ Add Towns&quot; to add load shedding info for {region.name}
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
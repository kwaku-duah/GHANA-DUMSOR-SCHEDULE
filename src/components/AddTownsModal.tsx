"use client";

import { useState } from "react";
import { TimeSlot } from "@/types";

const TIME_SLOTS: { value: TimeSlot; label: string }[] = [
  { value: "12am-6am", label: "12:00am – 6:00am (midnight to dawn)" },
  { value: "6am-12pm", label: "6:00am – 12:00pm (morning)" },
  { value: "12pm-6pm", label: "12:00pm – 6:00pm (afternoon)" },
  { value: "6pm-12am", label: "6:00pm – 12:00am (evening)" },
];

interface Props {
  regionName: string;
  onSave: (towns: { name: string; timeSlot: TimeSlot }[]) => void;
  onClose: () => void;
}

export default function AddTownsModal({ regionName, onSave, onClose }: Props) {
  const [townsText, setTownsText] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    const names = townsText
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (names.length === 0) {
      setError("Please enter at least one town name.");
      return;
    }
    onSave(names.map((name) => ({ name, timeSlot: selectedSlot })));
  };

  const preview = townsText
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Add Towns — {regionName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Off-power time slot
          </label>
          <div className="space-y-2">
            {TIME_SLOTS.map((slot) => (
              <label
                key={slot.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSlot === slot.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <input
                  type="radio"
                  name="timeslot"
                  value={slot.value}
                  checked={selectedSlot === slot.value}
                  onChange={() => setSelectedSlot(slot.value)}
                  className="accent-green-600"
                />
                <span className="text-sm text-gray-800">{slot.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Town names{" "}
            <span className="text-gray-400 font-normal">
              (separate by comma or new line)
            </span>
          </label>
          <textarea
            value={townsText}
            onChange={(e) => {
              setTownsText(e.target.value);
              setError("");
            }}
            rows={5}
            placeholder={"Accra Central, Adabraka\nLabone\nOsu, Ridge"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {preview.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">
              Preview — {preview.length} town{preview.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-1">
              {preview.map((t, i) => (
                <span
                  key={i}
                  className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Save Towns
          </button>
        </div>
      </div>
    </div>
  );
}
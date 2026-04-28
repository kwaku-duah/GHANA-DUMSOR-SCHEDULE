// src/types/index.ts

export type TimeSlot =
  | "12am-6am"
  | "6am-12pm"
  | "12pm-6pm"
  | "6pm-12am";

export interface Region {
  id: string;
  name: string;
}

export interface ScheduledTown {
  name: string;
  timeSlot: TimeSlot;
}

export interface DaySchedule {
  regionId: string;
  date: string;           // "YYYY-MM-DD"
  towns: ScheduledTown[];
}
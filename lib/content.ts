import rawStops from "@/data/stops.json";
import { BusStop } from "@/types/stop";

const stops = rawStops as BusStop[];

export function getAllStops(): BusStop[] {
  return stops;
}

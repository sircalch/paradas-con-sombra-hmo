import { BusStop } from "@/types/stop";

export const STOPS_OVERRIDE_STORAGE_KEY = "hmo_stops_override_v1";
export const STOPS_OVERRIDE_EVENT = "hmo-stops-override-updated";

function isBusStop(value: unknown): value is BusStop {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.latitude === "number" &&
    typeof record.longitude === "number" &&
    typeof record.colonia === "string" &&
    typeof record.hasShade === "boolean" &&
    typeof record.hasRoof === "boolean" &&
    typeof record.hasBench === "boolean" &&
    typeof record.hasLighting === "boolean" &&
    (record.heatRisk === "bajo" ||
      record.heatRisk === "medio" ||
      record.heatRisk === "alto") &&
    typeof record.comments === "string" &&
    typeof record.updatedAt === "string"
  );
}

function parseStops(value: unknown): BusStop[] {
  if (!Array.isArray(value)) {
    throw new Error("El JSON debe ser un arreglo de paradas.");
  }

  if (!value.every((item) => isBusStop(item))) {
    throw new Error("El JSON contiene paradas con estructura invalida.");
  }

  return value;
}

export function parseStopsInput(rawText: string): BusStop[] {
  const parsed = JSON.parse(rawText) as unknown;
  return parseStops(parsed);
}

export function readStopsOverride(): BusStop[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STOPS_OVERRIDE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return parseStops(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStopsOverride(stops: BusStop[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STOPS_OVERRIDE_STORAGE_KEY,
    JSON.stringify(stops),
  );
  window.dispatchEvent(new CustomEvent(STOPS_OVERRIDE_EVENT));
}

export function clearStopsOverride(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STOPS_OVERRIDE_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(STOPS_OVERRIDE_EVENT));
}

export function subscribeStopsOverride(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STOPS_OVERRIDE_STORAGE_KEY) {
      return;
    }
    onChange();
  };

  const handleCustom = () => {
    onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STOPS_OVERRIDE_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STOPS_OVERRIDE_EVENT, handleCustom);
  };
}

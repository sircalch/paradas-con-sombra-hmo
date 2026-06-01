import { NextRequest } from "next/server";

import rawStops from "@/data/stops.json";
import { calculateHeatRisk } from "@/lib/risk-score";
import { BusStop, HeatRiskLevel } from "@/types/stop";

const fallbackStops = rawStops as BusStop[];

type StopsSource = "supabase" | "seed";

type StopsQuery = {
  q: string;
  shadeOnly: boolean;
  roofOnly: boolean;
  benchOnly: boolean;
  lightingOnly: boolean;
  risk: "all" | HeatRiskLevel;
  limit: number | null;
};

function isHeatRisk(value: unknown): value is HeatRiskLevel {
  return value === "bajo" || value === "medio" || value === "alto";
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (value.toLowerCase() === "true" || value === "1") {
      return true;
    }
    if (value.toLowerCase() === "false" || value === "0") {
      return false;
    }
  }
  return null;
}

function pick(
  record: Record<string, unknown>,
  candidates: string[],
): unknown {
  for (const key of candidates) {
    if (key in record) {
      return record[key];
    }
  }
  return undefined;
}

function normalizeStop(record: unknown): BusStop | null {
  if (!record || typeof record !== "object") {
    return null;
  }

  const source = record as Record<string, unknown>;
  const id = asString(pick(source, ["id", "stop_id"]));
  const name = asString(pick(source, ["name", "stop_name"]));
  const latitude = asNumber(pick(source, ["latitude", "lat"]));
  const longitude = asNumber(pick(source, ["longitude", "lng", "lon"]));
  const colonia = asString(pick(source, ["colonia", "neighborhood"])) ?? "Sin colonia";
  const hasShade = asBoolean(pick(source, ["hasShade", "has_shade"])) ?? false;
  const hasRoof = asBoolean(pick(source, ["hasRoof", "has_roof"])) ?? false;
  const hasBench = asBoolean(pick(source, ["hasBench", "has_bench"])) ?? false;
  const hasLighting =
    asBoolean(pick(source, ["hasLighting", "has_lighting"])) ?? false;
  const comments =
    asString(pick(source, ["comments", "notes", "description"])) ??
    "Sin comentarios.";
  const updatedAt =
    asString(pick(source, ["updatedAt", "updated_at", "updated"])) ??
    new Date().toISOString();

  if (!id || !name || latitude === null || longitude === null) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  const providedRisk = pick(source, ["heatRisk", "heat_risk"]);
  const risk = isHeatRisk(providedRisk)
    ? providedRisk
    : calculateHeatRisk({
        id,
        name,
        latitude,
        longitude,
        colonia,
        hasShade,
        hasRoof,
        hasBench,
        hasLighting,
        heatRisk: "medio",
        comments,
        updatedAt,
      });

  return {
    id,
    name,
    latitude,
    longitude,
    colonia,
    hasShade,
    hasRoof,
    hasBench,
    hasLighting,
    heatRisk: risk,
    comments,
    updatedAt,
  };
}

async function loadStopsFromSupabase(): Promise<BusStop[] | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_STOPS_TABLE ?? "bus_stops";

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  try {
    const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
    endpoint.searchParams.set("select", "*");

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      return null;
    }

    const normalized = payload
      .map((item) => normalizeStop(item))
      .filter((item): item is BusStop => item !== null);

    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

function parseBooleanParam(value: string | null): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

function parseRisk(value: string | null): "all" | HeatRiskLevel {
  if (value === "bajo" || value === "medio" || value === "alto") {
    return value;
  }
  return "all";
}

function parseLimit(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.min(Math.floor(parsed), 500);
}

function parseQuery(request: NextRequest): StopsQuery {
  const params = request.nextUrl.searchParams;

  return {
    q: (params.get("q") ?? "").trim().toLowerCase(),
    shadeOnly: parseBooleanParam(params.get("shadeOnly")),
    roofOnly: parseBooleanParam(params.get("roofOnly")),
    benchOnly: parseBooleanParam(params.get("benchOnly")),
    lightingOnly: parseBooleanParam(params.get("lightingOnly")),
    risk: parseRisk(params.get("risk")),
    limit: parseLimit(params.get("limit")),
  };
}

function applyFilters(stops: BusStop[], query: StopsQuery): BusStop[] {
  let filtered = stops.filter((stop) => {
    if (query.shadeOnly && !stop.hasShade) return false;
    if (query.roofOnly && !stop.hasRoof) return false;
    if (query.benchOnly && !stop.hasBench) return false;
    if (query.lightingOnly && !stop.hasLighting) return false;
    if (query.risk !== "all" && stop.heatRisk !== query.risk) return false;

    if (query.q) {
      const searchable = `${stop.name} ${stop.colonia}`.toLowerCase();
      if (!searchable.includes(query.q)) return false;
    }

    return true;
  });

  filtered = filtered.sort((a, b) => {
    const updatedDiff =
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (Number.isFinite(updatedDiff) && updatedDiff !== 0) {
      return updatedDiff;
    }
    return a.name.localeCompare(b.name, "es");
  });

  if (query.limit) {
    return filtered.slice(0, query.limit);
  }

  return filtered;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = parseQuery(request);

  const supabaseStops = await loadStopsFromSupabase();
  const source: StopsSource = supabaseStops ? "supabase" : "seed";
  const stops = supabaseStops ?? fallbackStops;
  const filteredStops = applyFilters(stops, query);

  return Response.json({
    source,
    count: filteredStops.length,
    total: stops.length,
    stops: filteredStops,
    generatedAt: new Date().toISOString(),
  });
}

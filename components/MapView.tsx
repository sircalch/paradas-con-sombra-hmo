"use client";

import type { Feature, FeatureCollection, Point } from "geojson";
import {
  CloudDownload,
  Download,
  ListFilter,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";

import { FilterBar } from "@/components/FilterBar";
import { LegendPanel } from "@/components/LegendPanel";
import { StopDetailPanel } from "@/components/StopDetailPanel";
import { StopListPanel } from "@/components/StopListPanel";
import { HERMOSILLO_CENTER, HERMOSILLO_DEFAULT_ZOOM, MAP_STYLE_URL } from "@/lib/map";
import { getDominantRisk } from "@/lib/risk-score";
import {
  readStopsOverride,
  subscribeStopsOverride,
} from "@/lib/stops-override";
import { BusStop, StopFilters } from "@/types/stop";

type MapViewProps = {
  stops: BusStop[];
};

type StopFeatureProps = {
  id: string;
  heatRisk: "bajo" | "medio" | "alto";
};

const INITIAL_FILTERS: StopFilters = {
  shadeOnly: false,
  roofOnly: false,
  benchOnly: false,
  lightingOnly: false,
  risk: "all",
};

function toFeatureCollection(stops: BusStop[]): FeatureCollection<Point, StopFeatureProps> {
  const features: Feature<Point, StopFeatureProps>[] = stops.map((stop) => ({
    type: "Feature",
    properties: {
      id: stop.id,
      heatRisk: getDominantRisk(stop),
    },
    geometry: {
      type: "Point",
      coordinates: [stop.longitude, stop.latitude],
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
}

function toCsvValue(value: string | number | boolean): string {
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "si" : "no";
  }

  const normalized = String(value).replaceAll('"', '""');
  return `"${normalized}"`;
}

function exportStopsAsCsv(stops: BusStop[]) {
  const header = [
    "id",
    "nombre",
    "colonia",
    "latitud",
    "longitud",
    "riesgo_calor",
    "sombra",
    "techo",
    "banca",
    "iluminacion",
    "comentarios",
    "actualizado",
  ];

  const rows = stops.map((stop) => [
    stop.id,
    stop.name,
    stop.colonia,
    stop.latitude,
    stop.longitude,
    stop.heatRisk,
    stop.hasShade,
    stop.hasRoof,
    stop.hasBench,
    stop.hasLighting,
    stop.comments,
    stop.updatedAt,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => toCsvValue(value)).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-");

  link.href = url;
  link.download = `paradas_hmo_${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function MapView({ stops }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [filters, setFilters] = useState<StopFilters>(INITIAL_FILTERS);
  const [listQuery, setListQuery] = useState("");
  const [remoteStops, setRemoteStops] = useState(stops);
  const [activeStops, setActiveStops] = useState(stops);
  const [hasLocalOverride, setHasLocalOverride] = useState(false);
  const [apiSource, setApiSource] = useState<"seed" | "supabase">("seed");
  const [isLoadingRemote, setIsLoadingRemote] = useState(true);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(stops[0]?.id ?? null);

  const loadStopsFromApi = async () => {
    setIsLoadingRemote(true);
    setRemoteError(null);

    try {
      const response = await fetch("/api/stops", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("No se pudo obtener dataset remoto.");
      }

      const payload = (await response.json()) as {
        source?: "seed" | "supabase";
        stops?: BusStop[];
      };

      if (!Array.isArray(payload.stops)) {
        throw new Error("Respuesta de dataset invalida.");
      }

      setRemoteStops(payload.stops);
      setApiSource(payload.source === "supabase" ? "supabase" : "seed");
    } catch {
      setRemoteError("No se pudo sincronizar el dataset remoto.");
      setRemoteStops(stops);
      setApiSource("seed");
    } finally {
      setIsLoadingRemote(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStopsFromApi();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const syncStops = () => {
      const override = readStopsOverride();
      if (override) {
        setActiveStops(override);
        setHasLocalOverride(true);
        return;
      }

      setActiveStops(remoteStops);
      setHasLocalOverride(false);
    };

    syncStops();
    return subscribeStopsOverride(syncStops);
  }, [remoteStops]);

  const filteredStops = useMemo(() => {
    return activeStops.filter((stop) => {
      const dominantRisk = getDominantRisk(stop);

      if (filters.shadeOnly && !stop.hasShade) return false;
      if (filters.roofOnly && !stop.hasRoof) return false;
      if (filters.benchOnly && !stop.hasBench) return false;
      if (filters.lightingOnly && !stop.hasLighting) return false;
      if (filters.risk !== "all" && dominantRisk !== filters.risk) return false;
      return true;
    });
  }, [activeStops, filters]);

  const visibleStops = useMemo(() => {
    const trimmed = listQuery.trim().toLowerCase();
    if (!trimmed) {
      return filteredStops;
    }

    return filteredStops.filter((stop) => {
      const name = stop.name.toLowerCase();
      const colonia = stop.colonia.toLowerCase();
      return name.includes(trimmed) || colonia.includes(trimmed);
    });
  }, [filteredStops, listQuery]);

  const effectiveSelectedStopId = useMemo(() => {
    if (visibleStops.length === 0) {
      return null;
    }

    const exists = visibleStops.some((stop) => stop.id === selectedStopId);
    return exists ? selectedStopId : visibleStops[0].id;
  }, [visibleStops, selectedStopId]);

  const selectedStop = useMemo(() => {
    if (visibleStops.length === 0) {
      return null;
    }

    return (
      visibleStops.find((stop) => stop.id === effectiveSelectedStopId) ?? visibleStops[0]
    );
  }, [visibleStops, effectiveSelectedStopId]);

  const metrics = useMemo(() => {
    if (visibleStops.length === 0) {
      return {
        highRisk: 0,
        withShade: 0,
        avgCoverage: 0,
      };
    }

    const highRisk = visibleStops.filter((stop) => stop.heatRisk === "alto").length;
    const withShade = visibleStops.filter((stop) => stop.hasShade).length;
    const avgCoverage =
      visibleStops.reduce((acc, stop) => {
        const score = [
          stop.hasShade,
          stop.hasRoof,
          stop.hasBench,
          stop.hasLighting,
        ].filter(Boolean).length;
        return acc + score;
      }, 0) / visibleStops.length;

    return {
      highRisk,
      withShade,
      avgCoverage: Number(avgCoverage.toFixed(1)),
    };
  }, [visibleStops]);

  useEffect(() => {
    let disposed = false;
    let currentMap: MapLibreMap | null = null;

    const initializeMap = async () => {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      const maplibregl = (await import("maplibre-gl")).default;
      if (disposed || !mapContainerRef.current) {
        return;
      }

      currentMap = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE_URL,
        center: HERMOSILLO_CENTER,
        zoom: HERMOSILLO_DEFAULT_ZOOM,
      });

      mapRef.current = currentMap;
      currentMap.addControl(new maplibregl.NavigationControl(), "top-right");

      currentMap.on("load", () => {
        if (!currentMap) {
          return;
        }

        const firstStop = stops[0] ?? null;

        currentMap.addSource("stops-source", {
          type: "geojson",
          data: toFeatureCollection(stops),
        });

        currentMap.addSource("selected-stop-source", {
          type: "geojson",
          data: firstStop ? toFeatureCollection([firstStop]) : toFeatureCollection([]),
        });

        currentMap.addLayer({
          id: "stops-circles",
          type: "circle",
          source: "stops-source",
          paint: {
            "circle-radius": 7,
            "circle-color": [
              "match",
              ["get", "heatRisk"],
              "bajo",
              "#047857",
              "medio",
              "#b45309",
              "#b91c1c",
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });

        currentMap.addLayer({
          id: "selected-stop-ring",
          type: "circle",
          source: "selected-stop-source",
          paint: {
            "circle-radius": 12,
            "circle-color": "rgba(0, 0, 0, 0)",
            "circle-stroke-color": "#0f172a",
            "circle-stroke-width": 3,
          },
        });

        currentMap.on("click", "stops-circles", (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id === "string") {
            setSelectedStopId(id);
          }
        });

        currentMap.on("mouseenter", "stops-circles", () => {
          if (!currentMap) return;
          currentMap.getCanvas().style.cursor = "pointer";
        });

        currentMap.on("mouseleave", "stops-circles", () => {
          if (!currentMap) return;
          currentMap.getCanvas().style.cursor = "";
        });

        setMapReady(true);
      });
    };

    initializeMap();

    return () => {
      disposed = true;
      setMapReady(false);
      if (currentMap) {
        currentMap.remove();
      }
      mapRef.current = null;
    };
  }, [stops]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const source = map.getSource("stops-source") as GeoJSONSource | undefined;
    if (source) {
      source.setData(toFeatureCollection(visibleStops));
    }
  }, [mapReady, visibleStops]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const selectedSource = map.getSource("selected-stop-source") as
      | GeoJSONSource
      | undefined;
    if (selectedSource) {
      selectedSource.setData(
        selectedStop ? toFeatureCollection([selectedStop]) : toFeatureCollection([]),
      );
    }

    if (selectedStop) {
      map.flyTo({
        center: [selectedStop.longitude, selectedStop.latitude],
        zoom: Math.max(map.getZoom(), 13),
        duration: 600,
      });
    }
  }, [mapReady, selectedStop]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <FilterBar filters={filters} onChange={setFilters} />
        <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <article className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Riesgo alto
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {metrics.highRisk}
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Con sombra
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {metrics.withShade}
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Cobertura media
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {metrics.avgCoverage}/4
              </p>
            </article>
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CloudDownload className="h-4 w-4" aria-hidden="true" />
              Dataset: {hasLocalOverride ? "local (admin)" : apiSource}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="inline-flex min-h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                Limpiar filtros
              </button>
              <button
                type="button"
                onClick={() => exportStopsAsCsv(visibleStops)}
                disabled={visibleStops.length === 0}
                className="inline-flex min-h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={() => void loadStopsFromApi()}
                className="inline-flex min-h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Actualizar
              </button>
            </div>
          </div>
          <label className="block text-sm text-slate-700">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Search className="h-4 w-4" aria-hidden="true" />
              Buscar parada o colonia
            </span>
            <input
              type="search"
              value={listQuery}
              onChange={(event) => setListQuery(event.target.value)}
              placeholder="Ejemplo: Morelos, Centro, Colosio"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </label>
          {isLoadingRemote ? (
            <p className="mt-2 text-xs text-slate-500">Sincronizando dataset remoto...</p>
          ) : null}
          {remoteError ? (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
              {remoteError}
            </p>
          ) : null}
        </section>
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div
            ref={mapContainerRef}
            className="h-[600px] w-full"
            aria-label="Mapa de paradas"
          />
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <ListFilter className="h-4 w-4" aria-hidden="true" />
              Paradas visibles
            </h2>
            <p className="text-2xl font-semibold text-slate-900">
              {visibleStops.length}
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Total en dataset: {activeStops.length}. Coincidencias por filtros/busqueda:{" "}
            {visibleStops.length}.
          </p>
          {hasLocalOverride ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              Dataset local activo (admin)
            </p>
          ) : null}
        </section>
        <StopListPanel
          stops={visibleStops}
          selectedStopId={effectiveSelectedStopId}
          onSelect={setSelectedStopId}
        />
        <StopDetailPanel stop={selectedStop} />
        <LegendPanel />
      </div>
    </div>
  );
}

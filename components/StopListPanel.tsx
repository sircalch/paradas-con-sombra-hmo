"use client";

import { ArrowDownAz, Building2, Flame, SquareChartGantt } from "lucide-react";
import { useMemo, useState } from "react";

import { HeatRiskBadge } from "@/components/HeatRiskBadge";
import { BusStop } from "@/types/stop";

type StopListPanelProps = {
  stops: BusStop[];
  selectedStopId: string | null;
  onSelect: (stopId: string) => void;
};

type StopSort = "risk-desc" | "coverage-desc" | "updated-desc" | "name-asc";

const RISK_WEIGHT: Record<BusStop["heatRisk"], number> = {
  bajo: 1,
  medio: 2,
  alto: 3,
};

function facilityScore(stop: BusStop): number {
  return [stop.hasShade, stop.hasRoof, stop.hasBench, stop.hasLighting].filter(Boolean)
    .length;
}

export function StopListPanel({
  stops,
  selectedStopId,
  onSelect,
}: StopListPanelProps) {
  const [sortBy, setSortBy] = useState<StopSort>("risk-desc");

  const orderedStops = useMemo(() => {
    const next = [...stops];

    next.sort((a, b) => {
      if (sortBy === "coverage-desc") {
        return facilityScore(b) - facilityScore(a);
      }

      if (sortBy === "updated-desc") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }

      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name, "es");
      }

      const riskDiff = RISK_WEIGHT[b.heatRisk] - RISK_WEIGHT[a.heatRisk];
      if (riskDiff !== 0) {
        return riskDiff;
      }
      return facilityScore(b) - facilityScore(a);
    });

    return next;
  }, [stops, sortBy]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-4 py-3">
        <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <SquareChartGantt className="h-4 w-4" aria-hidden="true" />
          Lista de paradas
        </h2>
        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Orden
          <span className="relative mt-1.5 block">
            <ArrowDownAz
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as StopSort)}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm font-semibold text-slate-900"
            >
              <option value="risk-desc">Riesgo alto primero</option>
              <option value="coverage-desc">Cobertura alta primero</option>
              <option value="updated-desc">Mas recientes primero</option>
              <option value="name-asc">Nombre A-Z</option>
            </select>
          </span>
        </label>
      </header>
      {orderedStops.length === 0 ? (
        <p className="px-4 py-4 text-sm text-slate-600">
          No hay paradas que coincidan con los filtros actuales.
        </p>
      ) : null}
      <ul className="max-h-[360px] divide-y divide-slate-200 overflow-auto">
        {orderedStops.map((stop) => {
          const selected = stop.id === selectedStopId;

          return (
            <li key={stop.id}>
              <button
                type="button"
                onClick={() => onSelect(stop.id)}
                className={`w-full px-4 py-3 text-left transition ${
                  selected
                    ? "border-l-4 border-l-teal-600 bg-teal-50"
                    : "border-l-4 border-l-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{stop.name}</p>
                  <HeatRiskBadge stop={stop} />
                </div>
                <p className="mt-1 text-xs text-slate-600">{stop.colonia}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Cobertura: {facilityScore(stop)}/4
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-600">
                  <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                  Riesgo: {stop.heatRisk}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

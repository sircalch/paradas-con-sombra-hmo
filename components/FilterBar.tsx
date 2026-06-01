import { Lamp, Shield, Sun, Umbrella } from "lucide-react";

import { StopFilters } from "@/types/stop";

type FilterBarProps = {
  filters: StopFilters;
  onChange: (next: StopFilters) => void;
};

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggleClass = (enabled: boolean) =>
    enabled
      ? "border-teal-700 bg-teal-700 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50";

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Filtros
      </h2>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={filters.shadeOnly}
          onClick={() => onChange({ ...filters, shadeOnly: !filters.shadeOnly })}
          className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold transition ${toggleClass(filters.shadeOnly)}`}
        >
          <Sun className="h-4 w-4" aria-hidden="true" />
          Con sombra
        </button>
        <button
          type="button"
          aria-pressed={filters.roofOnly}
          onClick={() => onChange({ ...filters, roofOnly: !filters.roofOnly })}
          className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold transition ${toggleClass(filters.roofOnly)}`}
        >
          <Umbrella className="h-4 w-4" aria-hidden="true" />
          Con techo
        </button>
        <button
          type="button"
          aria-pressed={filters.benchOnly}
          onClick={() => onChange({ ...filters, benchOnly: !filters.benchOnly })}
          className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold transition ${toggleClass(filters.benchOnly)}`}
        >
          <Shield className="h-4 w-4" aria-hidden="true" />
          Con banca
        </button>
        <button
          type="button"
          aria-pressed={filters.lightingOnly}
          onClick={() =>
            onChange({ ...filters, lightingOnly: !filters.lightingOnly })
          }
          className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold transition ${toggleClass(filters.lightingOnly)}`}
        >
          <Lamp className="h-4 w-4" aria-hidden="true" />
          Con iluminacion
        </button>
      </div>

      <label className="mt-4 block text-sm text-slate-700">
        Nivel de riesgo por calor
        <select
          value={filters.risk}
          onChange={(event) =>
            onChange({
              ...filters,
              risk: event.target.value as StopFilters["risk"],
            })
          }
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="all">Todos</option>
          <option value="bajo">Bajo</option>
          <option value="medio">Medio</option>
          <option value="alto">Alto</option>
        </select>
      </label>
    </section>
  );
}

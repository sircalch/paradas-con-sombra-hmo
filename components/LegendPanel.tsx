import { ThermometerSun } from "lucide-react";

export function LegendPanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <ThermometerSun className="h-4 w-4" aria-hidden="true" />
        Leyenda
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-700" />
          Riesgo bajo de calor
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-600" />
          Riesgo medio de calor
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-700" />
          Riesgo alto de calor
        </li>
      </ul>
    </section>
  );
}

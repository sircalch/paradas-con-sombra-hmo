import { ExternalLink, Map, MessageSquare } from "lucide-react";
import Link from "next/link";

import { MapView } from "@/components/MapView";
import { getAllStops } from "@/lib/content";

export default function MapPage() {
  const stops = getAllStops();
  const nowLabel = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Mapa
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Paradas con Sombra HMO
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Vista operativa de paradas con filtros por cobertura y riesgo de calor.
            </p>
          </div>
          <Link
            href="/contribuir"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Contribuir parada
          </Link>
        </header>

        <section className="mb-5 rounded-md border border-slate-300 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-sm text-slate-700">
              <Map className="h-4 w-4" aria-hidden="true" />
              Fuente base: OpenStreetMap + dataset comunitario (seed/supabase).
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Corte: {nowLabel}
            </p>
          </div>
          <a
            href="https://www.openstreetmap.org/"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-slate-700 underline"
          >
            Ver mapa base en OpenStreetMap
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </section>

        <MapView stops={stops} />
      </main>
    </div>
  );
}

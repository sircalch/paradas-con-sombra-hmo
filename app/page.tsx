import { ExternalLink, Map, MessageSquare, ShieldCheck, SunMedium } from "lucide-react";
import Link from "next/link";

import { getAllStops } from "@/lib/content";

export default function Home() {
  const stops = getAllStops();
  const highRisk = stops.filter((stop) => stop.heatRisk === "alto").length;
  const withShade = stops.filter((stop) => stop.hasShade).length;
  const withRoof = stops.filter((stop) => stop.hasRoof).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Monitoreo comunitario
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Paradas con Sombra HMO
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Mapa operativo para identificar paradas con mejores condiciones de confort
            termico y seguridad peatonal.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Paradas registradas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{stops.length}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Riesgo alto
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{highRisk}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Con sombra
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{withShade}</p>
            </article>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mapa"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              Abrir mapa
            </Link>
            <Link
              href="/contribuir"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Sugerir parada
            </Link>
          </div>

          <section className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fuentes base para el mapa
            </h2>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <a
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 underline"
              >
                OpenStreetMap
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://wiki.openstreetmap.org/wiki/Overpass_API"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 underline"
              >
                Overpass API
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </section>
        </section>

        <section className="space-y-3">
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
              Cobertura de infraestructura
            </h2>
            <div className="mt-3 grid gap-2">
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                Con sombra: <span className="font-semibold text-slate-900">{withShade}</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                Con techo: <span className="font-semibold text-slate-900">{withRoof}</span>
              </p>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <SunMedium className="h-4 w-4 text-slate-500" aria-hidden="true" />
              Alcance actual
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                Mapa de puntos con filtros por cobertura.
              </li>
              <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                Etiqueta de riesgo por calor para priorizacion.
              </li>
              <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                Formulario ciudadano para sugerencias.
              </li>
            </ul>
            <Link
              href="/mapa"
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Ir al modulo operativo
            </Link>
          </article>
        </section>
      </main>
    </div>
  );
}

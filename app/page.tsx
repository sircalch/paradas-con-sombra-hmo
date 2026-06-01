import { ExternalLink, Map, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            HMO Util
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Paradas con Sombra HMO
          </h1>
          <p className="mt-4 max-w-2xl text-slate-700">
            Mapa comunitario para ubicar paradas de transporte con mejores
            condiciones de sombra, techo, banca e iluminacion.
          </p>
          <section className="mt-6 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <Map className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-900">Mapa operativo</p>
              <p className="mt-1 text-xs text-slate-700">
                Vista de paradas filtrables en una sola pantalla.
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <ShieldCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-900">Riesgo por calor</p>
              <p className="mt-1 text-xs text-slate-700">
                Indicador bajo, medio o alto por parada.
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <MessageSquare className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-900">Participacion</p>
              <p className="mt-1 text-xs text-slate-700">
                Sugerencias comunitarias para actualizar puntos.
              </p>
            </article>
          </section>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mapa"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              Abrir mapa
            </Link>
            <Link
              href="/contribuir"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Sugerir parada
            </Link>
          </div>
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fuentes base para el mapa
            </p>
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
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-slate-900">Incluye</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-md border border-slate-200 p-3">
              Mapa interactivo con marcadores de paradas.
            </li>
            <li className="rounded-md border border-slate-200 p-3">
              Filtros por sombra, techo, banca e iluminacion.
            </li>
            <li className="rounded-md border border-slate-200 p-3">
              Panel de detalle y nivel de riesgo por calor.
            </li>
          </ul>
          <Link
            href="/acerca"
            className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Acerca del proyecto
          </Link>
        </section>
      </main>
    </div>
  );
}

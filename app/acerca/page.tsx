import { ExternalLink, Map } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Acerca
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Paradas con Sombra HMO
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Herramienta local para visualizar paradas de transporte con
            indicadores de confort y riesgo por calor en Hermosillo.
          </p>

          <h2 className="mt-6 text-xl font-semibold text-slate-900">
            Alcance del MVP
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Mapa base con marcadores por parada.</li>
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Filtros por sombra, techo, banca e iluminacion.</li>
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Detalle de cada parada con nivel de riesgo.</li>
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Formulario de sugerencia comunitaria.</li>
          </ul>

          <div className="mt-8">
            <Link
              href="/mapa"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              Abrir mapa
            </Link>
          </div>

          <section className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Referencias de producto
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>
                <a
                  href="https://support.google.com/maps/?hl=en"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-slate-800 underline"
                >
                  Patron de lista + mapa (Google Maps)
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://wiki.openstreetmap.org/wiki/Overpass_API"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-slate-800 underline"
                >
                  Extraccion de datos geograficos (Overpass API)
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </section>
        </section>
      </main>
    </div>
  );
}

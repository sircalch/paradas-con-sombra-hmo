import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <main className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Ruta no encontrada
        </h1>
        <p className="mt-3 text-sm text-slate-700">
          Revisa el enlace o vuelve al mapa principal.
        </p>
        <Link
          href="/mapa"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Ir al mapa
        </Link>
      </main>
    </div>
  );
}

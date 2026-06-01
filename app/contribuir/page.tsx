import Link from "next/link";

import { SuggestStopForm } from "@/components/SuggestStopForm";

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <SuggestStopForm />

        <div className="mt-6">
          <Link
            href="/mapa"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            Volver al mapa
          </Link>
        </div>
      </main>
    </div>
  );
}

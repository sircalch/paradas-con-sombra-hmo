"use client";

import {
  CheckCheck,
  Copy,
  Database,
  RefreshCw,
  RotateCcw,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import rawStops from "@/data/stops.json";
import {
  clearStopsOverride,
  parseStopsInput,
  readStopsOverride,
  writeStopsOverride,
} from "@/lib/stops-override";
import { BusStop } from "@/types/stop";

const baseStops = rawStops as BusStop[];

function stringifyStops(stops: BusStop[]): string {
  return JSON.stringify(stops, null, 2);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Error inesperado al procesar el JSON.";
}

export default function StopsAdminPage() {
  const [jsonText, setJsonText] = useState(() => {
    const override = readStopsOverride();
    return stringifyStops(override ?? baseStops);
  });
  const [statusMessage, setStatusMessage] = useState(
    "Panel listo. Valida antes de guardar cambios.",
  );
  const [statusTone, setStatusTone] = useState<"ok" | "error" | "info">("info");

  const parsedSummary = useMemo(() => {
    try {
      const parsed = parseStopsInput(jsonText);
      const highRisk = parsed.filter((stop) => stop.heatRisk === "alto").length;

      return {
        isValid: true,
        count: parsed.length,
        highRisk,
        error: "",
      };
    } catch (error) {
      return {
        isValid: false,
        count: 0,
        highRisk: 0,
        error: toErrorMessage(error),
      };
    }
  }, [jsonText]);

  const statusClass =
    statusTone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : statusTone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  const validateJson = () => {
    if (!parsedSummary.isValid) {
      setStatusTone("error");
      setStatusMessage(parsedSummary.error);
      return;
    }

    setStatusTone("ok");
    setStatusMessage(
      `JSON valido. ${parsedSummary.count} paradas, ${parsedSummary.highRisk} de riesgo alto.`,
    );
  };

  const saveToLocalDataset = () => {
    try {
      const parsed = parseStopsInput(jsonText);
      writeStopsOverride(parsed);
      setStatusTone("ok");
      setStatusMessage(
        `Dataset local guardado. ${parsed.length} paradas visibles en el mapa.`,
      );
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(toErrorMessage(error));
    }
  };

  const resetToBase = () => {
    clearStopsOverride();
    setJsonText(stringifyStops(baseStops));
    setStatusTone("info");
    setStatusMessage(
      "Override local eliminado. Se restauro el dataset base del proyecto.",
    );
  };

  const reloadCurrentDataset = () => {
    const override = readStopsOverride();
    setJsonText(stringifyStops(override ?? baseStops));
    setStatusTone("info");
    setStatusMessage(
      override
        ? "Dataset local recargado desde localStorage."
        : "No hay override local. Se mostro el dataset base.",
    );
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setStatusTone("ok");
      setStatusMessage("JSON copiado al portapapeles.");
    } catch {
      setStatusTone("error");
      setStatusMessage("No se pudo copiar el JSON en este navegador.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Admin local
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Editor de paradas (JSON)
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-700">
              Cambia paradas sin backend. Este panel guarda en localStorage y se
              refleja en el mapa.
            </p>
          </div>
          <Link
            href="/mapa"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Ir al mapa
          </Link>
        </header>

        <section className="mb-5 grid gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Database className="h-4 w-4" aria-hidden="true" />
              Estado
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {parsedSummary.isValid ? "JSON valido" : "JSON invalido"}
            </p>
          </article>
          <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Paradas
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {parsedSummary.isValid ? parsedSummary.count : "--"}
            </p>
          </article>
          <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Riesgo alto
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {parsedSummary.isValid ? parsedSummary.highRisk : "--"}
            </p>
          </article>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={validateJson}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Validar
            </button>
            <button
              type="button"
              onClick={saveToLocalDataset}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Guardar en local
            </button>
            <button
              type="button"
              onClick={reloadCurrentDataset}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Recargar dataset actual
            </button>
            <button
              type="button"
              onClick={resetToBase}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restaurar base
            </button>
            <button
              type="button"
              onClick={copyJson}
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar JSON
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            spellCheck={false}
            className="h-[560px] w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-300"
          />

          <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${statusClass}`}>
            {statusMessage}
          </p>
        </section>
      </main>
    </div>
  );
}

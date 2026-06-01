"use client";

import { useState } from "react";

type FormState = {
  name: string;
  colonia: string;
  latitude: string;
  longitude: string;
  hasShade: boolean;
  hasRoof: boolean;
  hasBench: boolean;
  hasLighting: boolean;
  comments: string;
};

const initialState: FormState = {
  name: "",
  colonia: "",
  latitude: "",
  longitude: "",
  hasShade: false,
  hasRoof: false,
  hasBench: false,
  hasLighting: false,
  comments: "",
};

export function SuggestStopForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageTone, setMessageTone] = useState<"ok" | "error" | "info">("info");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setMessageTone("error");
      setMessage("Coordenadas invalidas. Verifica latitud y longitud.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/stops/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          colonia: form.colonia,
          latitude,
          longitude,
          hasShade: form.hasShade,
          hasRoof: form.hasRoof,
          hasBench: form.hasBench,
          hasLighting: form.hasLighting,
          comments: form.comments,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        storage?: "supabase" | "memory";
        suggestionId?: string;
      };

      if (!response.ok || !payload.ok) {
        setMessageTone("error");
        setMessage(payload.error ?? "No se pudo registrar la sugerencia.");
        return;
      }

      setForm(initialState);
      setMessageTone("ok");
      setMessage(
        `Sugerencia enviada (${payload.storage ?? "memory"}). Folio: ${payload.suggestionId ?? "N/A"}`,
      );
    } catch {
      setMessageTone("error");
      setMessage("No se pudo registrar la sugerencia en este momento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageClass =
    messageTone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : messageTone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6"
    >
      <h1 className="text-2xl font-semibold text-slate-900">Sugerir parada</h1>
      <p className="mt-2 text-sm text-slate-700">
        Comparte una parada con datos minimos para revision comunitaria.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Nombre o referencia
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Colonia
          <input
            required
            value={form.colonia}
            onChange={(event) =>
              setForm({ ...form, colonia: event.target.value })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Latitud
          <input
            required
            value={form.latitude}
            onChange={(event) =>
              setForm({ ...form, latitude: event.target.value })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Longitud
          <input
            required
            value={form.longitude}
            onChange={(event) =>
              setForm({ ...form, longitude: event.target.value })
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.hasShade}
            onChange={(event) =>
              setForm({ ...form, hasShade: event.target.checked })
            }
          />
          Tiene sombra
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.hasRoof}
            onChange={(event) => setForm({ ...form, hasRoof: event.target.checked })}
          />
          Tiene techo
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.hasBench}
            onChange={(event) =>
              setForm({ ...form, hasBench: event.target.checked })
            }
          />
          Tiene banca
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.hasLighting}
            onChange={(event) =>
              setForm({ ...form, hasLighting: event.target.checked })
            }
          />
          Tiene iluminacion
        </label>
      </div>

      <label className="mt-4 block text-sm text-slate-700">
        Comentarios
        <textarea
          rows={4}
          value={form.comments}
          onChange={(event) => setForm({ ...form, comments: event.target.value })}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        {isSubmitting ? "Enviando..." : "Enviar sugerencia"}
      </button>

      {message ? (
        <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${messageClass}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { CircleCheck, CircleX, CloudSun, Clock3, Droplets, Wind } from "lucide-react";
import { useEffect, useState } from "react";

import { HeatRiskBadge } from "@/components/HeatRiskBadge";
import { BusStop } from "@/types/stop";

type StopDetailPanelProps = {
  stop: BusStop | null;
};

function boolLabel(value: boolean): string {
  return value ? "Si" : "No";
}

function featureClass(value: boolean): string {
  return value
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

export function StopDetailPanel({ stop }: StopDetailPanelProps) {
  const [weather, setWeather] = useState<{
    temperatureC: number | null;
    apparentTemperatureC: number | null;
    humidityPercent: number | null;
    windSpeedKmh: number | null;
    weatherLabel: string | null;
    observedAt: string | null;
  } | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!stop) {
      return;
    }

    let isActive = true;

    const loadWeather = async () => {
      setWeatherStatus("loading");
      try {
        const response = await fetch(
          `/api/stops/weather?lat=${stop.latitude}&lon=${stop.longitude}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error("No se pudo consultar clima.");
        }

        const payload = (await response.json()) as {
          ok?: boolean;
          weather?: {
            observedAt?: string | null;
            temperatureC?: number | null;
            apparentTemperatureC?: number | null;
            humidityPercent?: number | null;
            windSpeedKmh?: number | null;
            weatherLabel?: string | null;
          };
        };

        if (!isActive || !payload.weather) {
          return;
        }

        setWeather({
          observedAt: payload.weather.observedAt ?? null,
          temperatureC: payload.weather.temperatureC ?? null,
          apparentTemperatureC: payload.weather.apparentTemperatureC ?? null,
          humidityPercent: payload.weather.humidityPercent ?? null,
          windSpeedKmh: payload.weather.windSpeedKmh ?? null,
          weatherLabel: payload.weather.weatherLabel ?? null,
        });
        setWeatherStatus("idle");
      } catch {
        if (!isActive) {
          return;
        }
        setWeatherStatus("error");
        setWeather(null);
      }
    };

    void loadWeather();

    return () => {
      isActive = false;
    };
  }, [stop]);

  if (!stop) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Detalle de parada
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Selecciona un marcador para ver la informacion de la parada.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{stop.name}</h2>
        <HeatRiskBadge stop={stop} />
      </div>
      <p className="mt-1 text-sm text-slate-600">{stop.colonia}</p>

      <section className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <CloudSun className="h-4 w-4" aria-hidden="true" />
          Clima actual (referencia)
        </p>
        {weatherStatus === "loading" ? (
          <p className="mt-2 text-sm text-slate-600">Consultando condiciones actuales...</p>
        ) : null}
        {weatherStatus === "error" ? (
          <p className="mt-2 text-sm text-slate-600">
            No fue posible recuperar clima en este momento.
          </p>
        ) : null}
        {weather ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <p className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700">
              Temp: <span className="font-semibold">{weather.temperatureC ?? "--"} C</span>
            </p>
            <p className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700">
              Sensacion:{" "}
              <span className="font-semibold">
                {weather.apparentTemperatureC ?? "--"} C
              </span>
            </p>
            <p className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700">
              <Droplets className="h-4 w-4 text-slate-500" aria-hidden="true" />
              Humedad: <span className="font-semibold">{weather.humidityPercent ?? "--"}%</span>
            </p>
            <p className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700">
              <Wind className="h-4 w-4 text-slate-500" aria-hidden="true" />
              Viento: <span className="font-semibold">{weather.windSpeedKmh ?? "--"} km/h</span>
            </p>
            <p className="sm:col-span-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700">
              Condicion: <span className="font-semibold">{weather.weatherLabel ?? "Variable"}</span>
            </p>
          </div>
        ) : null}
      </section>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${featureClass(stop.hasShade)}`}
        >
          {stop.hasShade ? (
            <CircleCheck className="mr-1 inline h-4 w-4" aria-hidden="true" />
          ) : (
            <CircleX className="mr-1 inline h-4 w-4" aria-hidden="true" />
          )}
          Sombra: {boolLabel(stop.hasShade)}
        </div>
        <div
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${featureClass(stop.hasRoof)}`}
        >
          {stop.hasRoof ? (
            <CircleCheck className="mr-1 inline h-4 w-4" aria-hidden="true" />
          ) : (
            <CircleX className="mr-1 inline h-4 w-4" aria-hidden="true" />
          )}
          Techo: {boolLabel(stop.hasRoof)}
        </div>
        <div
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${featureClass(stop.hasBench)}`}
        >
          {stop.hasBench ? (
            <CircleCheck className="mr-1 inline h-4 w-4" aria-hidden="true" />
          ) : (
            <CircleX className="mr-1 inline h-4 w-4" aria-hidden="true" />
          )}
          Banca: {boolLabel(stop.hasBench)}
        </div>
        <div
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${featureClass(stop.hasLighting)}`}
        >
          {stop.hasLighting ? (
            <CircleCheck className="mr-1 inline h-4 w-4" aria-hidden="true" />
          ) : (
            <CircleX className="mr-1 inline h-4 w-4" aria-hidden="true" />
          )}
          Iluminacion: {boolLabel(stop.hasLighting)}
        </div>
      </div>

      <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        {stop.comments}
      </p>
      <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Clock3 className="h-4 w-4" aria-hidden="true" />
        Actualizado: {stop.updatedAt}
      </p>
    </section>
  );
}

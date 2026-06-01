import { NextRequest } from "next/server";

function parseCoordinate(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function weatherCodeLabel(code: number): string {
  if (code === 0) return "Despejado";
  if ([1, 2, 3].includes(code)) return "Nublado parcial";
  if ([45, 48].includes(code)) return "Niebla";
  if ([51, 53, 55, 56, 57].includes(code)) return "Llovizna";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Lluvia";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Nieve";
  if ([95, 96, 99].includes(code)) return "Tormenta";
  return "Variable";
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const lat = parseCoordinate(request.nextUrl.searchParams.get("lat"));
  const lon = parseCoordinate(request.nextUrl.searchParams.get("lon"));

  if (lat === null || lon === null) {
    return Response.json(
      { ok: false, error: "Latitud y longitud son requeridas." },
      { status: 400 },
    );
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return Response.json(
      { ok: false, error: "Coordenadas fuera de rango valido." },
      { status: 400 },
    );
  }

  try {
    const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
    endpoint.searchParams.set("latitude", lat.toString());
    endpoint.searchParams.set("longitude", lon.toString());
    endpoint.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    );
    endpoint.searchParams.set("timezone", "auto");

    const response = await fetch(endpoint.toString(), { cache: "no-store" });
    if (!response.ok) {
      return Response.json(
        { ok: false, error: "No se pudo consultar el clima actual." },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      current?: {
        time?: string;
        temperature_2m?: number;
        apparent_temperature?: number;
        relative_humidity_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
    };

    const current = payload.current;
    if (!current) {
      return Response.json(
        { ok: false, error: "Respuesta de clima incompleta." },
        { status: 502 },
      );
    }

    const weatherCode = current.weather_code ?? -1;

    return Response.json({
      ok: true,
      weather: {
        observedAt: current.time ?? null,
        temperatureC: current.temperature_2m ?? null,
        apparentTemperatureC: current.apparent_temperature ?? null,
        humidityPercent: current.relative_humidity_2m ?? null,
        windSpeedKmh: current.wind_speed_10m ?? null,
        weatherCode,
        weatherLabel: weatherCodeLabel(weatherCode),
      },
      source: "open-meteo",
    });
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo consultar el clima actual." },
      { status: 502 },
    );
  }
}

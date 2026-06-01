import { NextRequest } from "next/server";

type StopSuggestionInput = {
  name: string;
  colonia: string;
  latitude: number;
  longitude: number;
  hasShade: boolean;
  hasRoof: boolean;
  hasBench: boolean;
  hasLighting: boolean;
  comments: string;
};

type StopSuggestionRecord = StopSuggestionInput & {
  id: string;
  createdAt: string;
  status: "pending";
};

const memorySuggestions: StopSuggestionRecord[] = [];

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return false;
}

function validateInput(raw: unknown): { ok: true; value: StopSuggestionInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "El cuerpo de la solicitud no es valido." };
  }

  const payload = raw as Record<string, unknown>;

  const name = asString(payload.name);
  const colonia = asString(payload.colonia);
  const latitude = asNumber(payload.latitude);
  const longitude = asNumber(payload.longitude);
  const comments = asString(payload.comments);

  if (name.length < 3) {
    return { ok: false, error: "El nombre de la parada debe tener al menos 3 caracteres." };
  }

  if (colonia.length < 2) {
    return { ok: false, error: "La colonia es obligatoria." };
  }

  if (latitude === null || longitude === null) {
    return { ok: false, error: "Latitud y longitud son obligatorias." };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { ok: false, error: "Coordenadas fuera de rango valido." };
  }

  return {
    ok: true,
    value: {
      name,
      colonia,
      latitude,
      longitude,
      hasShade: asBoolean(payload.hasShade),
      hasRoof: asBoolean(payload.hasRoof),
      hasBench: asBoolean(payload.hasBench),
      hasLighting: asBoolean(payload.hasLighting),
      comments: comments.length > 0 ? comments : "Sin comentarios.",
    },
  };
}

async function persistToSupabase(
  suggestion: StopSuggestionRecord,
): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_STOP_SUGGESTIONS_TABLE ?? "stop_suggestions";

  if (!supabaseUrl || !serviceRoleKey) {
    return false;
  }

  try {
    const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        {
          external_id: suggestion.id,
          name: suggestion.name,
          colonia: suggestion.colonia,
          latitude: suggestion.latitude,
          longitude: suggestion.longitude,
          has_shade: suggestion.hasShade,
          has_roof: suggestion.hasRoof,
          has_bench: suggestion.hasBench,
          has_lighting: suggestion.hasLighting,
          comments: suggestion.comments,
          status: suggestion.status,
          submitted_at: suggestion.createdAt,
        },
      ]),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    storage: "memory",
    count: memorySuggestions.length,
    suggestions: memorySuggestions.slice(-30).reverse(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = validateInput(body);
    if (!parsed.ok) {
      return Response.json(
        { ok: false, error: parsed.error },
        { status: 400 },
      );
    }

    const suggestion: StopSuggestionRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "pending",
      ...parsed.value,
    };

    const storedInSupabase = await persistToSupabase(suggestion);
    if (!storedInSupabase) {
      memorySuggestions.push(suggestion);
    }

    return Response.json({
      ok: true,
      suggestionId: suggestion.id,
      storage: storedInSupabase ? "supabase" : "memory",
      message:
        "Sugerencia registrada. El equipo puede revisarla y publicarla despues de validar.",
    });
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo procesar la solicitud." },
      { status: 400 },
    );
  }
}

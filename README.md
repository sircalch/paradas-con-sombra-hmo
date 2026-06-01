## Paradas con Sombra HMO

Mapa local para visualizar condiciones de paradas de transporte en Hermosillo.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- MapLibre GL
- JSON local

### Funciones MVP

- Mapa interactivo de paradas
- Filtros por sombra, techo, banca e iluminacion
- Nivel de riesgo por calor
- Panel de detalle de parada
- Formulario para sugerir parada
- API interna para dataset, sugerencias y clima

### Estructura principal

```txt
app/
  page.tsx
  mapa/page.tsx
  contribuir/page.tsx
  acerca/page.tsx
components/
  MapView.tsx
  FilterBar.tsx
  StopDetailPanel.tsx
  HeatRiskBadge.tsx
  LegendPanel.tsx
  SuggestStopForm.tsx
data/
  stops.json
lib/
  map.ts
  risk-score.ts
  content.ts
types/
  stop.ts
```

### Ejecutar local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000` o el puerto disponible.

### Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`

### API interna (App Router)

- `GET /api/stops` lista paradas con filtros (`q`, `risk`, `shadeOnly`, `roofOnly`, `benchOnly`, `lightingOnly`, `limit`)
- `POST /api/stops/suggestions` registra sugerencias desde `/contribuir`
- `GET /api/stops/suggestions` (solo interno con auth basica)
- `GET /api/stops/weather?lat=..&lon=..` obtiene clima actual via Open-Meteo

### Persistencia opcional (Supabase)

Si defines estas variables de entorno, la API toma/guarda datos en Supabase.  
Si no existen, usa dataset local `data/stops.json` y fallback en memoria para sugerencias.

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STOPS_TABLE` (opcional, default: `bus_stops`)
- `SUPABASE_STOP_SUGGESTIONS_TABLE` (opcional, default: `stop_suggestions`)

Schema sugerido: `supabase/schema.sql`

### Seguridad de rutas internas

Las rutas `/acerca` y `/admin/*` estan protegidas con HTTP Basic Auth en `proxy.ts`.

- `INTERNAL_ROUTE_USER`
- `INTERNAL_ROUTE_PASSWORD`
- `NEXT_PUBLIC_SHOW_INTERNAL_NAV` (opcional, `true` para mostrar links internos en el menu)

### Deploy

Recomendado en Vercel.

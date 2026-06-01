create table if not exists public.bus_stops (
  id text primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  colonia text not null,
  has_shade boolean not null default false,
  has_roof boolean not null default false,
  has_bench boolean not null default false,
  has_lighting boolean not null default false,
  heat_risk text not null check (heat_risk in ('bajo', 'medio', 'alto')),
  comments text not null default 'Sin comentarios.',
  updated_at timestamptz not null default now()
);

create table if not exists public.stop_suggestions (
  id bigserial primary key,
  external_id text not null unique,
  name text not null,
  colonia text not null,
  latitude double precision not null,
  longitude double precision not null,
  has_shade boolean not null default false,
  has_roof boolean not null default false,
  has_bench boolean not null default false,
  has_lighting boolean not null default false,
  comments text not null default 'Sin comentarios.',
  status text not null default 'pending',
  submitted_at timestamptz not null default now()
);

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Parking spots table (crowdsourced)
create table if not exists parking_spots (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz not null default now(),
  latitude            double precision not null,
  longitude           double precision not null,
  address             text,
  is_free             boolean not null default false,
  cost_per_hour       decimal(10, 2),
  time_limit_minutes  integer,
  restrictions        text,
  notes               text,
  upvotes             integer not null default 0,
  downvotes           integer not null default 0
);

-- Index for bounding-box geo queries
create index if not exists parking_spots_lat_lng_idx
  on parking_spots (latitude, longitude);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table parking_spots enable row level security;

-- Public: anyone can read spots
create policy "public_read_parking_spots"
  on parking_spots for select
  using (true);

-- Public: anyone can report a new spot (crowdsourced)
create policy "public_insert_parking_spots"
  on parking_spots for insert
  with check (true);

-- Public: anyone can vote (upvotes/downvotes columns only)
create policy "public_update_votes"
  on parking_spots for update
  using (true)
  with check (true);

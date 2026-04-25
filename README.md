# Can I Park Here? 🅿️

A mobile-first web application that leverages a user's location and **crowdsourced community data** to show street-by-street parking information — including whether parking is free and how much it costs.

---

## Features

- 📍 **Geolocation** — automatically detects your position using the browser's Geolocation API
- 🗺️ **Interactive map** — OpenStreetMap/Leaflet map centred on your location with colour-coded parking markers
  - 🟢 Green pin = free parking
  - 🔴 Red pin = paid parking
- 💬 **Crowdsourced data** — community members report spots with cost, time limits, and restrictions
- 👍 **Voting** — upvote / downvote spot accuracy
- 📱 **Mobile-first design** — full-screen map with a slide-up bottom panel; works great on phones

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Map | [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security) |
| Testing | Jest + React Testing Library |

---

## Local development

### 1. Clone & install

```bash
npm install
```

### 2. Configure Supabase

Copy the environment template and fill in your Supabase project credentials:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |

### 3. Run the database migration

In the [Supabase SQL editor](https://app.supabase.com), run:

```
supabase/migrations/001_create_parking_spots.sql
```

This creates the `parking_spots` table and enables Row Level Security with public read/insert/vote policies.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | ESLint |

---

## API

### `GET /api/parking-spots?lat=&lng=&radius=`

Returns parking spots within the bounding box defined by `radius` (default `0.05` degrees ≈ ~5 km).

### `POST /api/parking-spots`

Report a new parking spot. Body:

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main St",
  "is_free": false,
  "cost_per_hour": 2.50,
  "time_limit_minutes": 120,
  "restrictions": "No parking 7-9am Mon-Fri",
  "notes": "Meter on the corner"
}
```

### `PATCH /api/parking-spots/:id`

Cast a vote on a spot. Body: `{ "vote": "up" | "down" }`.

---

## Project structure

```
src/
  app/
    page.tsx                    # Main page (map + bottom panel)
    layout.tsx                  # Root layout with metadata
    api/
      parking-spots/
        route.ts                # GET + POST
        [id]/route.ts           # PATCH (votes)
  components/
    ParkingMap.tsx              # Leaflet map (client-only)
    ParkingInfoCard.tsx         # Spot detail card + voting
    ReportSpotForm.tsx          # Crowdsource report form
  hooks/
    useGeolocation.ts           # Browser Geolocation API hook
  lib/
    supabase.ts                 # Supabase client
    types.ts                    # TypeScript interfaces
  __tests__/                    # Jest tests
supabase/
  migrations/
    001_create_parking_spots.sql
```


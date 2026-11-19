AVELA INTEGRATION SERVICE
=========================

Avela's integration service for II3160 Tugas 3. It runs outside the set-top box,
on the owner's laptop (decision D-34), and is published as
https://avela-int.stei.fun through a Cloudflare Tunnel.

What it does
------------
1. Environment context (conformist to Open-Meteo). Every 60 minutes it fetches
   the hourly PM2.5 forecast (domain cams_global, two past days and two forecast
   days) for the pilot areas Pekanbaru and Palangka Raya and pushes one snapshot
   per area to the core:
       PUT https://avela.stei.fun/api/v1/internal/areas/{areaId}/snapshot
       header X-API-Key, scope snapshots:write
   Valid time and retrieval time stay separate; a provider gap stays null.
   A failed fetch pushes nothing, so the core keeps serving its last snapshot
   and marks it stale after 2 hours.

2. Anticorruption layer for Veriqu (Katalog Produk). Translates Veriqu's
   products into Avela's protective-product items (name, category, rating
   summary, link) and keeps only masks and air purifiers.

3. Anticorruption layer for FlowGanic (Koordinasi Distribusi Sampah).
   Translates FlowGanic's managed waste volume per RW or kelurahan code into a
   recap per Avela pilot area and waste type. A code outside the agreed mapping
   is dropped, never guessed.

Endpoints (called by the Avela app)
-----------------------------------
GET /health                  liveness, push job on or off, last push result
GET /guidance/products       Veriqu protective products
GET /areas/{areaId}/waste    FlowGanic waste recap for pekanbaru or palangka-raya

The partner endpoints always answer 200 with this envelope:

    {"source": "Veriqu", "retrievedAt": "2026-11-20T02:00:00Z",
     "freshness": "fresh", "isMock": false, "data": [...]}

freshness is fresh, stale (the partner failed; this is the last good answer),
or unavailable (no good answer yet; data is null). Every upstream call gives up
after 10 seconds. Each partner call is logged with its result and duration;
these log lines are the request evidence for the README and the video.

Agreements and mocks
--------------------
Veriqu and FlowGanic are the two groups named in Avela's DDD paper. Until each
signs a written contract (endpoints, data format, call limit, contact), its
adapter reads a fictional fixture in fixtures/ and every answer carries
isMock: true; the app shows "Data contoh (mock)". To switch to the live
service set VERIQU_BASE_URL and VERIQU_API_KEY, or FLOWGANIC_BASE_URL,
FLOWGANIC_API_KEY and FLOWGANIC_AREA_CODES, in .env. If the partner's real
schema differs from the fixture, only translate() in app/veriqu.py or
app/flowganic.py changes.

No resident data is ever sent to a partner.

Run
---
Requirements: Python 3.12+, uv, Git Bash.

    cd services/integration
    uv venv .venv && uv pip install --python .venv/Scripts/python.exe -r requirements-dev.txt
    cp .env.example .env          # fill in AVELA_SNAPSHOT_KEY
    set -a; . ./.env; set +a
    .venv/Scripts/python.exe -m uvicorn app.main:app --port 8100

One push without the server:  .venv/Scripts/python.exe -m app.openmeteo
Tests:                         .venv/Scripts/python.exe -m pytest -q

If Windows Smart App Control blocks a DLL in the new .venv (ImportError: "An
Application Control policy has blocked this file"), run the same commands with
the core's environment, which pins the same versions:
../core/.venv/Scripts/python.exe -m uvicorn app.main:app --port 8100

Public URL
----------
Create the hostname avela-int.stei.fun -> http://localhost:8100 in the class
Cloudflare account (only Avela's own tunnel; log out afterwards), then run on
the laptop:

    cloudflared tunnel --no-autoupdate run --token <TUNNEL_TOKEN_FOR_AVELA_INT>

Keep the token in .env or a password manager, never in Git. When the laptop is
off, the app shows partner sections as unavailable and the core keeps serving
the last snapshot with its age.

Data and attribution
--------------------
PM2.5: Open-Meteo Air Quality API, CAMS global model (about 45 km). It is a
regional model forecast, not a sensor reading. Free tier: under 10,000 calls a
day; this job makes 48 a day.

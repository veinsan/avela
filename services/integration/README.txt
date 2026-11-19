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

Endpoints
---------
GET /health    liveness, whether the push job is on, and the last push result

Every upstream call gives up after 10 seconds.

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

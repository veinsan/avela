# Avela

A mobile companion that helps residents in wildfire-smoke areas read the smoke forecast for their area, report symptoms from home, and get a reviewed follow-up from facility staff.

Coursework for II3160 Teknologi Sistem Terintegrasi and II3140 Pengembangan Aplikasi Web & Mobile, Institut Teknologi Bandung, 2026. Team: Mishael Gilland (18224005) and Riantama Putra (18224061).

## Problem Solved

During a smoke episode, residents get an air-quality number without a next step. When symptoms start, they decide alone whether to travel to a clinic through the smoke. Avela lets them send a report first, shows staff the smoke conditions around the time the symptoms began, and tells the resident plainly whether anyone has reviewed the report yet.

## Key Features

- Pick Pekanbaru or Palangka Raya from a list (no location permission) and read the hourly PM2.5 forecast with its source, age, an ISPU reference category, and the number of reports from the area in the last 7 days.
- Protection guidance from Kementerian Kesehatan publications, protective products from Veriqu's catalogue, and an emergency screen (119, 112) that works signed out and offline.
- Submit a symptom report; a retried submit never creates a duplicate. Each report freezes the area's forecast PM2.5 from symptom onset to submission as its exposure context.
- Follow a report's state and timeline, answer staff questions, and see an update marker when something changes.
- Staff, in the same app, claim a report, ask for more information, respond with a disposition, close it, and publish an examination result; a correction becomes a new version.
- A simulated facility directory with services and opening schedule, and FlowGanic's managed waste recap for the area.
- A public API for other groups: smoke advisory, an anonymous area health signal that hides counts from 1 to 4, and guidance, each behind its own scoped key.

Veriqu and FlowGanic are the partner groups in the DDD paper ([docs/Makalah_DDD.docx](docs/Makalah_DDD.docx)). Until their contracts are signed, their adapters run on fixtures and the app labels that data "Data contoh (mock)". All accounts, staff, facilities, and cases are fictional. Avela does not diagnose and is not a clinical service. Progress is in [docs/TODO.md](docs/TODO.md).

## Screenshot or Demo

The core runs on the class set-top box behind `https://avela.stei.fun/api/`; interactive documentation is at [avela.stei.fun/api/docs](https://avela.stei.fun/api/docs). App screenshots and the video come with the release APK (A-14, A-15).

## Repository Layout

| Path | What it is | Docs |
| --- | --- | --- |
| `services/core` | Core microservice: FastAPI and SQLite, deployed on the STB | [README](services/core/README.md), also exported as `README.pdf` |
| `services/integration` | Integration service off the STB: Open-Meteo push job, Veriqu and FlowGanic adapters | [README.txt](services/integration/README.txt) |
| `apps/mobile` | React Native (Expo SDK 58) app for residents and staff | [README](apps/mobile/README.md) |
| `infra/stb` | Docker Compose, Nginx gateway with rate limits, Cloudflare Tunnel | [Deploy on the STB](services/core/README.md#deploy-on-the-stb) |
| `docs` | PRD, architecture, decisions, design, tests, testing report | [docs/README.md](docs/README.md) |
| `scripts/md2pdf.py` | Exports a Markdown deliverable to PDF | Usage in the file |

## Tech Stack and Rationale

- **FastAPI and SQLite** for the core service: small enough for the set-top box (256 MB, 0.5 CPU) and validated at the API boundary.
- **Docker, Nginx, Cloudflare Tunnel** to run the core on the STB behind a rate-limited public HTTPS URL without opening a port.
- **A separate integration service** outside the STB for Open-Meteo and the peer APIs, so the STB runs only the core and no key ships in the app.
- **React Native with Expo**, React Navigation, and Jest for the Android app, as the course requires.

## Installation and Setup

Prerequisites: Python 3.12 or newer, [uv](https://docs.astral.sh/uv/), Node.js 20 or newer, and Git Bash on Windows.

1. Core service:

   ```bash
   cd services/core
   uv venv .venv && uv pip install --python .venv/Scripts/python.exe -r requirements-dev.txt
   export AVELA_JWT_SECRET=$(python -c "import secrets;print(secrets.token_urlsafe(48))")
   export AVELA_DEMO_PASSWORD=choose-a-demo-password
   .venv/Scripts/python.exe -m app.seed
   .venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 0.0.0.0
   ```

   Open `http://127.0.0.1:8000/api/docs`.

2. Integration service (optional locally): follow [services/integration/README.txt](services/integration/README.txt).

3. App:

   ```bash
   cd apps/mobile
   npm install
   EXPO_PUBLIC_API_URL=http://<laptop-ip>:8000 npx expo start
   ```

4. Tests: `pytest -q` in each service (26 core, 15 integration) and `npm test` in `apps/mobile` (25). Results are in [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md).

Demo accounts are `warga1`, `warga2`, `petugas1`, and `petugas2`, with the password from `AVELA_DEMO_PASSWORD`. Other groups get a key and the `uji-mitra` test account as described in [Getting Access](services/core/README.md#getting-access).

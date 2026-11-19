# Avela

A mobile companion that helps residents in wildfire-smoke areas read the smoke forecast for their area, report symptoms from home, and get a reviewed follow-up from facility staff.

Coursework for II3160 Teknologi Sistem Terintegrasi and II3140 Pengembangan Aplikasi Web & Mobile, Institut Teknologi Bandung, 2026. Team: Mishael Gilland (18224005) and Riantama Putra (18224061).

## Problem Solved

During a smoke episode, residents get an air-quality number without a next step. When symptoms start, they decide alone whether to travel to a clinic through the smoke. Avela lets them send a report first, shows staff the smoke conditions around the time the symptoms began, and tells the resident plainly whether anyone has reviewed the report yet.

## Key Features

Available now, in the core API:

- Sign in as a resident or as facility staff.
- Submit a symptom report; a retried submit never creates a duplicate.
- Follow a report's state and timeline.
- Staff claim a report, ask for more information, publish a response, and close it.
- Staff publish an examination result that only the report's owner can read.
- List the two pilot areas and read each area's latest pushed PM2.5 snapshot with its age.

Planned for the 13 December release: exposure context on each report, an anonymous area health signal for other groups, a simulated facility directory, versioned examination results, the Android app, and integration with Veriqu (protective products) and FlowGanic (waste recap per area). The domain follows the DDD paper submitted on 16 November, [docs/Makalah_DDD.docx](docs/Makalah_DDD.docx). Progress is in [docs/TODO.md](docs/TODO.md).

All accounts, staff, and cases are fictional. Avela does not diagnose and is not a clinical service.

## Screenshot or Demo

The core runs on the class set-top box behind `https://avela.stei.fun/api/`; interactive documentation is at [avela.stei.fun/api/docs](https://avela.stei.fun/api/docs). No app screenshot exists yet.

## Tech Stack and Rationale

- **FastAPI and SQLite** for the core service: small enough for the set-top box (256 MB, 0.5 CPU) and validated at the API boundary.
- **Docker, Nginx, Cloudflare Tunnel** to run the core on the STB behind a rate-limited public HTTPS URL without opening a port.
- **React Native with Expo** for the Android app, as the course requires.
- **A separate integration service** outside the STB for public and peer APIs, so the STB runs only the core.

## Installation and Setup

Prerequisites: Python 3.12 or newer, [uv](https://docs.astral.sh/uv/), and Git Bash on Windows.

1. Create the environment and install dependencies.

   ```bash
   cd services/core
   uv venv .venv && uv pip install --python .venv/Scripts/python.exe -r requirements-dev.txt
   ```

2. Set the secrets and create the demo accounts.

   ```bash
   export AVELA_JWT_SECRET=$(python -c "import secrets;print(secrets.token_urlsafe(48))")
   export AVELA_DEMO_PASSWORD=choose-a-demo-password
   .venv/Scripts/python.exe -m app.seed
   ```

3. Start the service and open `http://127.0.0.1:8000/api/docs`.

   ```bash
   .venv/Scripts/python.exe -m uvicorn app.main:app --reload
   ```

4. Run the tests.

   ```bash
   .venv/Scripts/python.exe -m pytest -q
   ```

Demo accounts are `warga1`, `warga2`, `petugas1`, and `petugas2`, with the password from `AVELA_DEMO_PASSWORD`. The endpoint list and STB deployment steps are in [services/core/README.md](services/core/README.md). Project documentation starts at [docs/README.md](docs/README.md).

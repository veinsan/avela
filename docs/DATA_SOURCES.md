# Data Sources

**Updated:** 19 November 2026. Providers are chosen (D-13); the requests behind the choice are in [API_RESEARCH.md](API_RESEARCH.md). The Open-Meteo adapter is built (A-07); the partner adapters follow in A-10. Public providers do not count toward the two-group integration requirement.

## Chosen Sources

| Need | Source | Used for | State |
| --- | --- | --- | --- |
| Area PM2.5 forecast | Open-Meteo Air Quality, `cams_global` | Smoke advisory, exposure context | Adapter and hourly push built in `services/integration` (A-07); live fetch checked 19 Nov |
| Protective products | Veriqu's product catalogue | Product recommendations in Panduan | Adapter built on a labelled fixture (D-35); contract pending (Q-03) |
| Managed waste recap | FlowGanic's waste distribution service | Waste section on Beranda | Adapter built on a labelled fixture (D-35); contract and area codes pending (Q-03) |
| Facilities | Avela's simulated facility directory (D-24) | Fasilitas tab | Two facilities seeded with area, services, and schedule (A-30) |
| Guidance | Text written from Kemenkes publications, with sources (D-33) | Panduan, Darurat | Sources read 19 Nov (S-09, S-10) |
| Local weather | BMKG village forecast | Optional weather panel | Stretch; needs verified area codes |

Not used in the MVP: Open-Meteo Geocoding and device location (the resident picks one of two areas from a list, D-25), OpenAQ station observations (only needed for R-01).

## Pilot Areas

| Area ID | Name | Coordinates sent | Grid point returned | Probe result on 10 Nov |
| --- | --- | --- | --- | --- |
| `pekanbaru` | Pekanbaru, Riau | 0.5071, 101.4478 | 0.5, 101.399994 | 48 of 48 hourly PM2.5 values |
| `palangka-raya` | Palangka Raya, Kalimantan Tengah | -2.2096, 113.9213 | -2.199997, 113.899994 | 48 of 48 hourly PM2.5 values |

## Open-Meteo Air Quality

[Documentation](https://open-meteo.com/en/docs/air-quality-api). The global domain is a model forecast at about 45 km resolution. It is not a sensor reading and not a household value, so the app labels it "Prakiraan model" for the area. The 11 km European product does not cover Indonesia.

- Keep the requested coordinates and the returned grid point.
- `generationtime_ms` is server processing time. It is not the model's issue time, which the response does not carry.
- Attribute Open-Meteo and CAMS wherever the value is shown.
- [Free-tier terms](https://open-meteo.com/en/terms): non-commercial use, under 10,000 calls a day, 5,000 an hour, 600 a minute.

Push schedule: one request per area every 60 minutes is 48 calls a day, far inside the limit. The core marks a snapshot stale 2 hours after retrieval. That threshold is an engineering choice about data age, not a health rule.

## PM2.5 Category

The advisory places the 24-hour mean of the forecast in the PM2.5 bands of Permen LHK P.14/2020, Lampiran I (S-08, D-29):

| Category | ISPU | 24-hour PM2.5 (µg/m³) |
| --- | --- | --- |
| Baik | 0-50 | up to 15.5 |
| Sedang | 51-100 | up to 55.4 |
| Tidak Sehat | 101-200 | up to 150.4 |
| Sangat Tidak Sehat | 201-300 | up to 250.4 |
| Berbahaya | above 300 | above 250.4 |

The mean uses the forecast values valid in the 24 hours up to now; with fewer than 18 values the label is null. The app labels it "mengacu ISPU". Do not use US or European AQI names, and do not present the category as an official ISPU reading: ISPU is computed from station measurements, and Avela has a model forecast.

## BMKG Weather (stretch)

[Specification](https://data.bmkg.go.id/prakiraan-cuaca/): three-day village forecasts at three-hour steps, 60 requests a minute per IP, BMKG attribution required. It needs the `adm4` code of a village in each pilot area. The only request run so far used BMKG's own Jakarta example. Weather does not measure PM2.5.

## Partner Data

Veriqu's products and FlowGanic's waste recap are shown with the group's name and the retrieval time. A product recommendation is a catalogue entry, not medical advice. FlowGanic reports by RW or kelurahan; the integration service maps those codes to the two pilot areas with the agreed mapping and drops a code it cannot map. No resident data goes to either group.

## Facilities

Facility data is Avela's own simulated list (D-24), not OpenStreetMap or a public geocoder. A facility's existence in a list says nothing about staffing or capacity; opening status is shown as given, or as unknown. Shared Overpass servers and public Nominatim are not used as an app backend; their policies discourage it.

## Considered and Not Used

| Candidate | Reason |
| --- | --- |
| WAQI / AQICN | [Terms](https://aqicn.org/api/) restrict caching and redistribution; it serves an index, not a concentration. |
| IQAir | Plan limits and coverage not audited; no advantage shown. |
| Public Nominatim | [Policy](https://operations.osmfoundation.org/policies/nominatim/) forbids autocomplete and heavy app use. |
| Infermedica | A symptom checker; Avela's review is done by people. |
| openFDA | US drug data; not relevant to Indonesian care. |
| NASA FIRMS, HYSPLIT, WorldPop | Possible inputs for R-01 only. |

## Remaining Audit (A-02)

1. ISPU breakpoints: read 19 Nov (S-08, D-29).
2. BMKG panel: dropped from the MVP; it stays a stretch item and needs a verified `adm4` code per area.
3. Run the adapter's failure paths: timeout, 429, and a changed schema (T-21, T-23).
4. Confirm attribution text appears on Beranda.

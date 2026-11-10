# API Research Evidence

**Date:** 10 November 2026. **Scope:** Documentation review and four bounded requests, not production integration validation.

## Discovery

Read [public-apis](https://github.com/public-apis/public-apis) and its [raw README](https://raw.githubusercontent.com/public-apis/public-apis/master/README.md). Relevant listings included Open-Meteo, OpenAQ, IQAir, OSM, Nominatim, Infermedica, NHS, and openFDA. Provider-owned documentation was used to assess suitability; BMKG and WAQI were additional comparisons.

Selection criteria: resident-task relevance, Indonesian applicability, provenance, useful time/location metadata, bounded operating cost, permission-compatible fallback, and fit with professional review. No selection was made merely to increase API count.

## Requests Executed

Public URLs without credentials or patient data; re-running returns different current data:

```text
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=0.5071&longitude=101.4478&hourly=pm2_5,pm10&forecast_days=2&domains=cams_global&timezone=GMT
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-2.2096&longitude=113.9213&hourly=pm2_5,pm10&forecast_days=2&domains=cams_global&timezone=GMT
https://geocoding-api.open-meteo.com/v1/search?name=Pekanbaru&count=3&language=id&format=json&countryCode=ID
https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001
```

Python urllib issued one request per URL, with a 20-second timeout and User-Agent Avela-coursework-feasibility-check/0.1. The four independent requests ran concurrently. All returned HTTP 200. No retries, credentials, bulk extraction, or installations were involved.

| Observation | Pekanbaru AQ | Palangka Raya AQ |
| --- | --- | --- |
| Requested coordinates | 0.5071, 101.4478 | -2.2096, 113.9213 |
| Returned grid coordinates | 0.5, 101.399994 | -2.199997, 113.899994 |
| PM2.5 unit | micrograms per cubic metre | micrograms per cubic metre |
| Array length / non-null | 48 / 48 | 48 / 48 |
| First / last valid time, GMT | Nov 10 00:00 / Nov 11 23:00 | Nov 10 00:00 / Nov 11 23:00 |
| Request duration | 0.84 s | 1.84 s |

Place search returned GeoNames ID 1631761, Kota Pekanbaru, country ID, region Riau, coordinates 0.51667, 101.44167. Do not pass this ID as BMKG adm4.

BMKG returned data and lokasi, identified Kemayoran / Jakarta Pusat / DKI Jakarta, timezone Asia/Jakarta, and three nested forecast groups. No assertion about all nested values or pilot coverage was tested.

## Evidence Limits

The checks establish reachability, parsability, key metadata, and basic completeness. Raw bodies were not persisted; this record preserves selected observed metadata, not a reproducible historical dataset. No sampled value is used as a personal health recommendation or claim of current safety.

Not executed: authenticated OpenAQ requests, Overpass extraction, tile requests, hospital calls, symptom-checker calls, patient uploads, outage simulations, long-term polling, station validation, or historical forecast evaluation.

The NHS catalogue URL listed in the directory returned 404 through the research tool. This does not prove all NHS APIs are unavailable.

## Next Evidence

1. Selected pilot's administrative identifier and successful local weather sample.
2. Station inventory, history, and licenses if observations are added.
3. Reviewed facility sample with independent operational verification.
4. Attribution and quota budget for expected usage.
5. Adapter failure-path tests after implementation is authorized.

Recommendations and official sources are in [DATA_SOURCES.md](DATA_SOURCES.md).

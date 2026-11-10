# Data Sources and API Selection

**Reviewed:** 10 November 2026. **Status:** Recommended shortlist with four successful public-endpoint probes; not an implemented integration or completed pilot audit.

Discovery began with [public-apis/public-apis](https://github.com/public-apis/public-apis), particularly Environment, Geocoding, and Health. Provider documentation determines suitability and terms. A directory entry does not guarantee free production use, regional coverage, or clinical suitability. Recommendations remain subject to the final scope gate.

## Recommended Provider Set

| Need | Recommended source | Role in Avela | Evidence and remaining gate |
| --- | --- | --- | --- |
| Regional PM2.5 outlook | Open-Meteo Air Quality, global domain | Environmental home screen and short forecast timeline | Official docs reviewed; two Indonesian city queries succeeded; accuracy and reliability untested |
| Indonesian weather context | BMKG village forecast | Supplementary weather information, not a pollution substitute | Official docs and documented Jakarta example checked; pilot adm4 mapping pending |
| Manual place search | Open-Meteo Geocoding | Select an area when location is unavailable or undesired | Pekanbaru search succeeded; administrative-code crosswalk pending |
| Independent station observations | OpenAQ v3 | Optional comparison and later forecast evaluation | Documentation reviewed; key and pilot station history not obtained |
| Facility coordinates | Peer directory, optionally enriched through bounded OSM/Overpass import | Facility list and optional map | Policy reviewed; no facility query, completeness audit, or operational verification yet |
| Clinical guidance | Reviewed local content from authoritative publications | Versioned protection information | A generic medical API does not replace content review |
| Staff review and examination results | Avela plus contracted student-group services | Private resident-to-staff journey | No public API establishes a hospital partnership or patient-record permission |

This narrows the initial public-data stack to forecast, place search, and optional local weather. Two distinct student-group integrations are still separately required.

## Provider Details

### Open-Meteo Air Quality

[Official documentation](https://open-meteo.com/en/docs/air-quality-api) describes a global atmospheric-composition forecast at approximately 45 km resolution. The 11 km European air-quality product is not the Indonesian PM2.5 resolution. Hourly returned values are not independent hourly sensor measurements. Label this source **Prakiraan model**, retain requested and returned grid coordinates, and avoid household-level exposure claims. Attribute Open-Meteo and CAMS as required.

The [free-service terms](https://open-meteo.com/en/terms) restrict use to non-commercial purposes and require fewer than 10,000 calls/day, 5,000/hour, and 600/minute. Review licensing before commercial launch. Proposed implementation: shared off-STB adapter, duplicate-request coalescing, and source-attributed caching. These engineering choices do not establish a clinical freshness threshold.

### BMKG Weather

[BMKG's specification](https://data.bmkg.go.id/prakiraan-cuaca/) provides three-day village forecasts at three-hour intervals, updated twice daily, with a limit of 60 requests/minute/IP and visible BMKG attribution. Use its adm4 identifier and preserve analysis_date, UTC valid time, units, and weather text. Weather does not measure PM2.5. The successful example was Kemayoran in Jakarta, not a selected Avela pilot.

### Place Search

[Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) returns coordinates, timezone, administrative names, and GeoNames identifiers. Filter to Indonesia and ask users to confirm the intended location. GeoNames IDs and admin4_id are not BMKG administrative codes. Maintain a reviewed crosswalk; if absent, omit the BMKG panel rather than query an unrelated village.

### OpenAQ

[OpenAQ authentication](https://docs.openaq.org/using-the-api/api-key) requires an API key. [Published limits](https://docs.openaq.org/using-the-api/rate-limits) are 60/minute and 2,000/hour for general use. Keep keys server-side and honor quota headers and attribution. Before using observations as ground truth, inspect pilot stations, instrument/source metadata, units, history, missingness, quality flags, and source licenses. No authenticated sample was requested.

### Facility Discovery and Maps

OSM data, Overpass querying, geocoding, and map tiles are separate services. Do not use the main OSM editing API as a facility-search backend. [Public Overpass guidance](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html) discourages reliance on shared instances as an app's production backend. Use a bounded, reviewed directory import for the demo or a suitable provider for scale, with attribution and license compliance.

Queries must consider nodes, ways, and relations and relevant hospital/clinic/healthcare tags. Normalize geometry and deduplicate provider IDs. Facility existence does not prove staffing, beds, consultation availability, or partnership. Keep OSM retrieval time separate from human verification time.

The [public Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/) limits aggregate app traffic to one request/second, requires identification and attribution, and prohibits client-side autocomplete. It is not Avela's default. Do not add it silently as a fallback or periodic location lookup. Tiles require a separate provider/policy choice; list mode remains usable without a map.

## Alternatives Considered

| Candidate | Decision | Reason and evidence |
| --- | --- | --- |
| WAQI/AQICN | Not a default fallback/cache source | [Terms](https://aqicn.org/api/) restrict cached/archive redistribution and paid use; token required. Pollutant AQI is not raw concentration. Public use has notification/agreement conditions. |
| IQAir | Deferred | Listed in the directory, but plan fields, coverage, quotas, and rights were not audited; no demonstrated advantage over the initial set. |
| Public Nominatim | Not selected | Its restrictions are incompatible with an automatic typeahead default. |
| Infermedica | Outside current MVP | [Developer docs](https://developer.infermedica.com/documentation/overview/) describe a different symptom-assessment integration. Access, Indonesian support, and clinical fit are unverified; human review remains the product boundary. |
| openFDA | Not a treatment engine | [Official terms](https://open.fda.gov/terms/) concern FDA datasets, not an Indonesian prescribing service. Public access does not establish patient-specific suitability. |
| NHS Health A-Z directory link | Unresolved | Listed catalogue URL returned 404 in this check; no replacement endpoint or language audit completed. |
| COVID, genetics, nutrition, US provider APIs | Excluded | Their listed purposes do not solve the selected smoke-to-care journey. |
| NASA FIRMS / HYSPLIT / WorldPop | Deferred research | Possible hotspot, transport, or population inputs; not reporting prerequisites. |

WAQI was an additional comparison, not claimed as a currently found directory entry. BMKG supplements the directory with a local authoritative source.

## Observed Endpoint Probes

Read-only checks on 10 November 2026 used an identifying Avela User-Agent, no secrets, and no patient data. One request per endpoint; latency is not an SLA. Full URLs and metadata are in [API_RESEARCH.md](API_RESEARCH.md).

| Probe | Result | Establishes | Does not establish |
| --- | --- | --- | --- |
| Open-Meteo AQ: Pekanbaru | HTTP 200; 48/48 non-null PM2.5 values; 0.84 s | JSON, units, two-day regional series | Accuracy or household precision |
| Open-Meteo AQ: Palangka Raya | HTTP 200; 48/48 non-null values; 1.84 s | Technical availability for second candidate | Pilot selection or forecast skill |
| Geocoding: Pekanbaru | HTTP 200; Indonesian Riau result; 0.79 s | Working manual-place-search candidate | BMKG village-code mapping |
| BMKG Kemayoran example | HTTP 200; three forecast groups; 1.18 s | Documented endpoint returns expected structure | Coverage at either pilot |

Air-quality times span 2026-11-10T00:00 through 2026-11-11T23:00 with GMT requested. generationtime_ms is processing duration, not model issue time. No model issue timestamp was present in the sampled top-level schema; keep it unknown unless obtained from a documented source.

## Cache, Freshness, and Partial Data

Cache permission is provider-specific. Suggested fetch-reuse windows are engineering proposals: air quality 30 minutes, BMKG 60 minutes, place search 24 hours. Recheck permissions before implementation. These windows do not determine whether health information is safe to use.

Keep validAt, retrievedAt, model issue time when known, data kind, resolution, attribution, and freshness separate. Fetching old data again does not make it current. A provider/index change requires explicit labeling; never average unlike AQI values. Do not synthesize uncertainty intervals or wildfire-causation claims from a deterministic PM2.5 series.

## Remaining Audit Before A-02 Is Done

Select the pilot; verify its BMKG code and facilities; check deployment-specific terms; obtain OpenAQ access if needed; inspect station history; define source-aware freshness rules; test timeout/429/schema changes; and implement visible attribution. A-02 remains in progress.

Before custom forecasting, assemble historical observations and as-issued forecasts, define holdouts and a baseline, and prevent future-data leakage. Otherwise retain provider forecasts and defer R-01. No model was trained during this audit.

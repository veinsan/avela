# Data Sources and Feasibility Audit

**Status:** Candidate inventory from prior discussion. No API request, dataset download, coverage check, license audit, or model training was performed during documentation setup.

## Minimum Data for the Current Product Proposal

1. Environmental conditions for a selected area with units, source, valid time, and coverage.
2. Sourced, reviewed protection content.
3. Facility details and honest service availability.
4. Synthetic resident reports, staff responses, and examination results generated for the demo.
5. Two peer-group service contracts that provide useful product data or actions.

Hotspots, population rasters, atmospheric modeling, and custom ML are not prerequisites for a functioning report-to-review vertical slice. Their value depends on the selected environmental/research scope.

## Candidate Inventory

| Source | Candidate use | Feasibility questions | Current status |
| --- | --- | --- | --- |
| [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | Pollutant forecasts | Pilot coverage, forecast issue/valid time, resolution, historical access, attribution, commercial terms | Unverified candidate |
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/) | Hotspots and fire radiative power | Key, quotas, latency, historical access, geographic coverage | Optional candidate |
| [BMKG PM2.5](https://www.bmkg.go.id/kualitas-udara/pm25) | Station observations | Machine-readable access, permissions, station history, missingness | Unverified candidate |
| [BMKG Open Data](https://data.bmkg.go.id/prakiraan-cuaca/) | Weather context | Actual numerical variables, update times, terms and spatial coverage | Unverified candidate |
| [OpenAQ](https://docs.openaq.org/api) | Independent pollution observations | Current API access, station coverage, hourly history, station metadata | Unverified candidate |
| [OpenStreetMap / Overpass](https://overpass-turbo.eu/) | Facility locations | Completeness, attribution, public endpoint policies, freshness | Directory candidate; not proof of operation/capacity |
| [WorldPop](https://api.worldpop.org/v3/documentation) | Population overlays | Product year, resolution, age breakdown, license, download size | Deferred research candidate |
| [NOAA HYSPLIT](https://www.arl.noaa.gov/hysplit/) | Atmospheric transport study | Meteorology input, computational resources, emissions assumptions | Deferred, not an MVP dependency |
| WHO/Kemenkes publications | Guidance content | Exact source, applicability, date, clinical review | Content selection pending |
| Peer group services | Directory, guidance, examination or appointment demo | Named owners and actual contracts | Required groups not identified |

These links identify candidates for later audit; inclusion does not mean they were opened or verified in this task. Prior discussions also considered satellite aerosol/gas products, but they are not necessary for the current product baseline.

## Audit Record Required per Selected Source

Record source URL/version, access method, date tested, request area/time, redacted sample, HTTP result, units, spatial/temporal coverage, latency, missing fields, quota, attribution/license, permitted caching, fallback behavior, and owner. A sample from a different continent or season is not evidence of pilot suitability.

For environmental interpretation, document the chosen index/standard, averaging interval, pollutant, unit, and conversion rules. Do not combine different AQI systems under one unlabeled score. Do not infer that a hotspot caused a measured pollution value without an attribution method.

## Historical Data and Forecasting Gate

Before committing to 6-24-hour prediction:

- Establish observation coverage over a meaningful period and region.
- Identify forecast archives as they were issued, not future-informed reconstructions used as if available in real time.
- Align spatial grids, station coordinates, timezones, and measurement intervals.
- Split train/validation/test chronologically; add spatial holdout only when coverage supports it.
- Define a persistence or provider-forecast baseline.
- Evaluate error, missingness, and the reliability of any uncertainty interval.
- Identify whether the claim is total PM2.5 prediction or wildfire-source attribution; these are different tasks.

If data are insufficient, retain source-attributed provider forecasts or clearly labeled synthetic scenarios. Do not invent a trained model or report accuracy from unavailable ground truth.

## Proposed Fallback Matrix

| Dependency | Fallback | Forbidden interpretation |
| --- | --- | --- |
| Environmental provider | Dated permitted cache or unavailable state | Cached value presented as current |
| Facility availability | Verified directory details with availability unknown | Open/capacity inferred from existence on map |
| Peer service | Contract mock when permitted and labeled | Mock described as live partner integration |
| Staff service | Clear unavailable status and appropriate alternative access information | Report submission described as active medical monitoring |
| Forecast experiment | Existing provider forecast with provenance | Unsupported custom-model performance claims |

## Pilot Selection

Riau and Central Kalimantan were earlier candidates, not selected regions. Choose based on usable source coverage, a plausible resident/facility scenario, and demonstrable integrations. Regional relevance alone does not prove the data support evaluation.

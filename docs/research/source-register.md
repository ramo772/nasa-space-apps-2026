# Research and NASA source register

Every important scientific/data claim must trace to a source. AI summaries are leads, not evidence.

| ID | Question/claim | Original URL | Provider/date | Data format/license | Verified by | Used in feature |
|---|---|---|---|---|---|---|
| DATA-001 | api.nasa.gov: developer keys, authentication and rate limits (1,000 req/h per key across all api.nasa.gov APIs, rolling; DEMO_KEY 30/h and 50/day per IP; X-RateLimit headers) | https://api.nasa.gov/assets/html/authentication.html | NASA / checked 2026-11-01 | JSON over HTTPS; terms not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-002 | APOD: astronomy picture of the day | https://apod.nasa.gov/apod/astropix.html | NASA / checked 2026-11-01 | JSON via api.nasa.gov; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-003 | NeoWs: near-Earth objects by date range, max 7 days per call (400 beyond); response groups objects by date under `near_earth_objects`; `api_key` is echoed in returned links | https://api.nasa.gov | NASA / live check 2026-11-01 | JSON; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-004 | EPIC: whole-Earth imagery by date; empty list on dates without photos (workshop observation, not re-tested) | https://epic.gsfc.nasa.gov | NASA / checked 2026-11-01 | JSON + imagery; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-005 | DONKI: space-weather events such as flares and storms | https://ccmc.gsfc.nasa.gov/tools/DONKI/ | NASA CCMC / checked 2026-11-01 | JSON via api.nasa.gov; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-006 | NASA POWER: historical weather and solar data by lat-lon; `-999` marks missing values | https://power.larc.nasa.gov/docs/services/api/ ; https://power.larc.nasa.gov/docs/tutorials/parameters/ | NASA LaRC / checked 2026-11-01 | JSON/CSV; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-007 | JPL Sentry: impact-risk list for roughly the next 100 years; impact probability, dates, Torino scale 0-10; `des=` for one object | https://ssd-api.jpl.nasa.gov/doc/sentry.html | NASA JPL / checked 2026-11-01 | JSON; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-008 | JPL Small-Body Database: size and orbit of one asteroid or comet, by name or ID | https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html ; https://ssd-api.jpl.nasa.gov/doc/sbdb.html | NASA JPL / checked 2026-11-01 | JSON; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-009 | NASA Exoplanet Archive: confirmed planets, table-style queries | https://exoplanetarchive.ipac.caltech.edu | NASA/IPAC Caltech / checked 2026-11-01 (one transient 525 during checks) | Table/JSON (TAP); licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-010 | NASA Earthdata: bulk satellite datasets, mostly file download, free login | https://www.earthdata.nasa.gov | NASA / checked 2026-11-01 | Files (bulk); licence per dataset, not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-011 | NASA Worldview: browse imagery interactively before committing to a download | https://worldview.earthdata.nasa.gov | NASA / checked 2026-11-01 | Visual tool; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |
| DATA-012 | USGS earthquake API (partner data): times in epoch milliseconds, coordinates as `[lon, lat]` | https://earthquake.usgs.gov/fdsnws/event/1/ | USGS / checked 2026-11-01 | JSON/GeoJSON; licence not checked | AI session (shahndaa) 2026-11-01 | Not yet — reference only |

For each dataset, capture coverage, units, coordinate reference system (if applicable), refresh frequency, missing data, attribution requirements and rate limits when relevant.
If using Perplexity/Manus, open original linked sources and verify them before acceptance.

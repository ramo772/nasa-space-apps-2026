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
| DATA-013 | JPL SBDB Close Approach Data API: upcoming Earth close approaches with calendar date, miss distance in au, relative speed in km/s, and diameter in km when published (`null` when unpublished). No key. | https://ssd-api.jpl.nasa.gov/doc/cad.html | NASA JPL / live check 2026-11-05 (5 rows) | JSON; licence not checked | AI session 2026-11-05 | `game/` voyage prototype. Saved copy: `game/data/fallback-approaches.json` |

| DATA-014 | JPL Horizons API: orbital elements for a named object. TESS (-95) tested with EC, QR, IN, A, AD, PR, Keplerian GM, in km, s, deg; frame Ecliptic of J2000.0. No key | https://ssd-api.jpl.nasa.gov/doc/horizons.html | NASA JPL / live check 2026-11-07 (API v1.2) | JSON; licence not checked | AI session 2026-11-07, raw response | Candidate only — mission-model-proposal.md |
| DATA-015 | JPL astrodynamic parameters: Earth GM 398600.435507 km³/s² (DE440) | https://ssd.jpl.nasa.gov/astro_par.html | NASA JPL / checked 2026-11-07 | Web page; licence not checked | Lead: AI summary, human check pending | Candidate only |
| DATA-016 | NSSDCA Earth Fact Sheet: equatorial radius 6378.137 km; solar irradiance 1361.0 W/m² | https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html | NASA GSFC / page updated 2024-11-15, checked 2026-11-07 | Web page; licence not checked | Lead: AI summary, human check pending | Candidate only |
| DATA-017 | Ideal rocket equation and specific-impulse forms | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/ | NASA Glenn / page updated 2023-11-21, checked 2026-11-07 | Web page; licence not checked | Lead: AI summary, human check pending | Candidate only |
| DATA-018 | Small Spacecraft State of the Art, Ch. 4 In-Space Propulsion: thrust and Isp ranges (Table 4-1), thrust-to-power statement | https://www.nasa.gov/smallsat-institute/sst-soa/in-space_propulsion/ | NASA / dated 2026-05-07, checked 2026-11-07 | Web page and PDF; licence not checked | Lead: AI summary of part of the page, human check pending | Candidate only |
| DATA-019 | Small Spacecraft State of the Art, Ch. 3 Power: specific power, cell efficiency, battery specific energy. Figures not independently verified by NASA | https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/ | NASA / dated 2026-05-07, checked 2026-11-07 | Web page and PDF; licence not checked | Lead: AI summary of part of the page, human check pending | Candidate only |
| DATA-020 | Small Spacecraft State of the Art, Ch. 9 Communications: example links, radios and antennas | https://www.nasa.gov/smallsat-institute/sst-soa/soa-communications/ | NASA / dated 2026-05-18, checked 2026-11-07 | Web page and PDF; licence not checked | Lead: AI summary of part of the page, human check pending | Candidate only |
| DATA-021 | NASA ISAM overview: story framing only; no gameplay dataset on the page | https://www.nasa.gov/isam/ | NASA / updated 2026-10-22, checked 2026-11-07 | Web page; licence not checked | Lead: AI summary, human check pending | Story framing candidate |
| DATA-022 | 2026 ISAM State of Play article: story framing; the linked report was not read | https://www.nasa.gov/humans-in-space/commercial-space/nasas-isam-state-of-play-the-industry-standard-for-space-servicing-assembly-and-manufacturing/ | NASA / 2026-10-29, checked 2026-11-07 | Web page; licence not checked | Lead: AI summary, human check pending | Story framing candidate |
| DATA-023 | SSPICY inspection mission: story framing only; no gameplay parameters | https://www.nasa.gov/centers-and-facilities/ames/nasas-sspicy-mission-to-demonstrate-in-space-inspection-technologies/ | NASA / 2026-10-08, checked 2026-11-07 | Web page; licence not checked | Lead: AI summary, human check pending | Story framing candidate |
| DATA-024 | Orbit facts: Basics of Space Flight Ch. 4 (periapsis and apoapsis change with energy); TESS orbit article (17.0 and 58.7 Earth radii, 13.7 days, downlink at perigee, Van Allen belts) | https://science.nasa.gov/learn/basics-of-space-flight/chapter4-1/ ; https://www.nasa.gov/centers-and-facilities/goddard/new-explorer-mission-chooses-the-just-right-orbit/ | NASA / checked 2026-11-07 | Web pages; licence not checked | Lead: AI summary, human check pending | Candidate only |
| DATA-025 | Basics of Space Flight Ch. 6: received energy diminishes as 1/R² (space loss) | https://science.nasa.gov/learn/basics-of-space-flight/chapter6-1/ | NASA / checked 2026-11-07 | Web page; licence not checked | Lead: AI summary, human check pending | Candidate only |

DATA-014 to DATA-025 are candidates for review, not approved sources. See `docs/research/mission-model-proposal.md`.

## Sources added for the draft rule table

| ID | Question/claim | Original URL | Provider/date | Data format/license | Verified by | Used in feature |
|---|---|---|---|---|---|---|
| DATA-026 | Specific impulse: Isp = F / (ṁ · g₀); g₀ is 9.8 m/s² in metric units | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/specific-impulse/ | NASA Glenn / checked 2026-11-07 | Web page; see licence notes | AI session read original 2026-11-07; human check pending | Draft rule table |
| DATA-027 | NASA media guidelines: acknowledge NASA as the source, imply no endorsement, insignia protected | https://www.nasa.gov/nasa-brand-center/images-and-media/ | NASA / checked 2026-11-07 | Web page | AI session read original 2026-11-07; human check pending | Licence basis |
| DATA-028 | ISS altitude "between 370–460 km"; inclination 51.6° | https://www.nasa.gov/reference/international-space-station/ | NASA / checked 2026-11-07 | Web page; see licence notes | AI session read original 2026-11-07; human check pending | Draft rule table |
| DATA-029 | Vis-viva equation, Equation 2.2, in an Ohio State master's thesis hosted on NASA NTRS. Not a NASA-authored statement. Symbols unclear in extracted text | https://ntrs.nasa.gov/api/citations/20210014171/downloads/Masters_Thesis_Final_Reformatted.pdf | J. R. Clark, Ohio State / checked 2026-11-07 | PDF; licence not checked, cited only | AI session read extracted text 2026-11-07; human check of the printed form pending | Draft rule table |

## Verification pass, 2026-11-07

An AI session read these originals directly and confirmed the claims used by the draft rule table. A person must still sign off before any of them counts as verified, and the Verified by column above is unchanged.

| ID | Confirmed in the original |
|---|---|
| DATA-014 | Orbit elements re-queried from Horizons API v1.2. A state-vector query for the same epoch matches vis-viva to within 10⁻¹³ km/s |
| DATA-015 | Earth GM 398600.435507 km³/s² |
| DATA-016 | Equatorial radius 6378.137 km |
| DATA-017 | Δu = Isp · g₀ · ln(MR), MR = e^(Δu / (Isp · g₀)), MR = full mass / empty mass |
| DATA-018 | Table 4-1 ranges; hydrazine "200–235 seconds"; "below 75 mN/kW"; "hundreds or thousands of hours". **New limit:** the survey covers a "180 kg wet mass limit" |
| DATA-019 | Solar arrays "strongly clustered around ~30 W/kg", maximum 200 W/kg; figures not independently verified by NASA |
| DATA-024 | "periapsis altitude can be lowered by decreasing the spacecraft's energy at apoapsis"; geosynchronous orbit "22,236 miles above the equator"; Van Allen belts "about 621 to 37,282 miles" |

**Not read:** DATA-020 (dropped with Data), DATA-021 to DATA-023 (story framing only), and DATA-025 beyond its inverse-square passage.

### Licence notes (working read, a person must confirm)

- **Space Apps Terms:** every source must be cited, including open ones. Third-party materials must be free or OSI-licensed, with licences documented.
- **NASA content (DATA-027):** generally not subject to US copyright, may be used for educational purposes, and NASA should be acknowledged. The guidelines speak mainly of images and media, not explicitly of data or text.
- **Insignia:** NASA's insignia and logotype are protected. Do not use them or imply endorsement.
- **AI narration:** DATA-027 says attribution directly to NASA is not permitted for information incorporated into a large language model, and it encourages marking AI-generated products. Check this before AI narration cites NASA.
- **JPL:** the JPL Image Use Policy covers images, with the credit line "Courtesy NASA/JPL-Caltech". No terms specific to Horizons data were found.
- **DATA-029:** the thesis is an author's work, so cite it and do not reproduce it.

For each dataset, capture coverage, units, coordinate reference system (if applicable), refresh frequency, missing data, attribution requirements and rate limits when relevant.
If using Perplexity/Manus, open original linked sources and verify them before acceptance.

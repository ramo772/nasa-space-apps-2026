# NASA Spacecraft Mission Design Reference

**Document type:** Research reference and dataset intake guide for the team and its coding agents  
**Last reviewed:** November 7, 2026  
**Scope:** Spacecraft systems, propulsion, stations, environmental hazards, repair logistics, and scientific data intake.

Repo entry points · [Team AI rules](../../AGENTS.md) · [Source register](source-register.md) · [Product brief](../product/challenge-and-mvp.md)

For an encounter, start with [hazards and mission constraints](#17-hazards-by-environment-and-mission-phase). For a repair or upgrade, start with [serviceability and spares](#18-what-can-be-repaired-replaced-assembled-or-manufactured-in-space). For a new source, use [data intake](#21-how-an-agent-should-handle-unfamiliar-or-updated-data) and [worked examples](#22-worked-examples-and-insight-handoff).

---

## 1. Purpose and scope

Use this reference to build evidence-backed decisions for a spacecraft mission-design game. Relate equipment choices and resource budgets to observable mission outcomes. The same engineering relationships apply to a vehicle built before launch, reconfigured at a service point, or operating with a degraded subsystem between stops.

Take approved implementation scope from the product brief, decisions, and current issue. Keep three layers separately traceable: published engineering evidence, project simulation assumptions, and how the experience presents those assumptions. Examples in this reference describe optional scenarios and their expected behavior under stated conditions.

### Before any spacecraft or station task

1. Read the approved issue and identify the mission phase, vehicle configuration, and decision in scope.
2. Open the original NASA or NASA/JPL source. Verify producer, version, units, applicable conditions, and uncertainty. Use section 21 for new records.
3. For vehicle changes, check affected systems and interfaces. For a stop, check what the spacecraft and the facility can both support.
4. Record the evidence, the simulation assumptions, and the expected change in capability separately.

### Definition of done for an evidence-backed scenario

- Every scientific input has a source-register entry. Every synthetic scenario value is labeled as a simulation assumption.
- The agent can explain which system changes, what the player observes, and what carries into the next phase.
- The scenario covers at least one feasible response and its cost, plus the resulting behavior when access, stock, or compatibility is missing where relevant.

---

## 2. The core idea: a spacecraft is not one object

A spacecraft is a system of interconnected subsystems. NASA describes typical structural, thermal, power, telecommunications, data handling, attitude control, propulsion, and payload functions. A failure in one subsystem can force other subsystems to operate differently. [NASA Basics of Space Flight — Onboard Systems](https://science.nasa.gov/learn/basics-of-space-flight/chapter11-1/)

### The hierarchy to keep in mind

| Level | Meaning | Example |
|---|---|---|
| Mission | The complete goal, destination, and duration | Study an asteroid and return data |
| Spacecraft or flight system | Everything that travels in space | The complete probe |
| Bus | The platform and services carrying the payload | Power, communications, computer, control, propulsion |
| Payload | The reason for sending the spacecraft | Camera, radar, or spectrometer |
| Subsystem | A group performing a major function | Electrical power system |
| Assembly | A group of components inside a subsystem | Reaction-wheel assembly |
| Component | An item with a defined function | Battery, valve, Sun sensor |
| Part | A lower-level item inside a component | Connector, resistor, electronic chip |

**Key insight:** there is no single “spacecraft strength” value. A mission balances mass, power, heat, communications, propulsion, precision, reliability, and payload.

---

## 3. What kinds of spacecraft data does NASA publish?

NASA data are not one table. They are families of information, and each family answers a different question.

### 3.1 Mission and spacecraft identity

These records describe the mission name and operator, launch and end dates, destination and orbit, objectives, spacecraft and payload type, and mission status.

Useful official sources:

- [NASA Science Missions](https://science.nasa.gov/missions/) for mission goals and spacecraft descriptions.
- [NSSDCA Master Catalog](https://nssdc.gsfc.nasa.gov/about/about_nmc.html) for spacecraft and experiment records from NASA and other organizations.
- [NASA Technical Reports Server — NTRS](https://ntrs.nasa.gov/) for engineering and design reports.

**Important limitation:** a record in NSSDCA does not mean NASA built that spacecraft. The catalog documents U.S. and international missions, so the operator and mission fields matter.

### 3.2 Mass, dimensions, and configuration

This family includes:

- **Dry mass:** the spacecraft mass without expendable propellant.
- **Wet mass:** mass after propellant and other consumables are added.
- Payload, subsystem, and component mass.
- Dimensions, volume, center of mass, and inertia when published.
- Counts of solar arrays, antennas, engines, wheels, and sensors.

These data explain why a useful addition can hurt a mission. More mass requires more launch capability and propulsion and may change balance and control.

Sources normally include official mission pages, NTRS reports, spacecraft handbooks, and [NASA Small Spacecraft State of the Art 2026](https://www.nasa.gov/smallsat-institute/sst-soa/) tables.

### 3.3 Electrical power and energy

A spacecraft needs instantaneous **power** to operate equipment and stored **energy** when sunlight is unavailable.

Relevant data include:

- Solar-array output at beginning and end of life.
- Battery capacity, state, and cycle count.
- Normal and peak consumption for each device.
- Battery voltage, current, and temperature.
- State of charge, state of health, and aging.
- Eclipse duration, when the spacecraft uses stored energy.
- Remaining power margin after essential systems and payload are active.

**Relationship:** larger arrays can produce more power but add mass, area, and low-orbit drag. A larger battery stores more energy but is heavier, generates heat, and ages with cycling.

Useful sources:

- [NASA Small Spacecraft SoA](https://www.nasa.gov/smallsat-institute/sst-soa/) for general technology and component surveys.
- [NASA Li-ion Battery Aging Dataset](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) for charge, discharge, temperature, capacity, and impedance measurements through end of life.

The NASA Ames battery dataset used commercial Li-ion cells on a ground testbed. It is valuable for learning battery degradation and **remaining useful life**, but it is not telemetry from a particular spacecraft.

### 3.4 Thermal control

Space is not simply “cold.” A spacecraft can heat under sunlight and internal electrical loads, then cool sharply in shadow. In vacuum, there is no surrounding air for convection; heat moves through the structure by conduction and leaves mainly through radiation.

Thermal data include:

- Temperatures measured at different locations.
- Safe minimum and maximum temperature for each component.
- Heat generated by equipment.
- Spacecraft orientation and time in sunlight or eclipse.
- Insulation, coating, radiator, and heat-pipe properties.
- Heater and cooler power.

Passive systems include multi-layer insulation, coatings, radiators, and thermal straps. Active systems include heaters, coolers, and fluid loops. [NASA Small Spacecraft SoA — Thermal Control](https://www.nasa.gov/smallsat-institute/sst-soa/thermal-control/)

**Relationship:** a high-performance device may consume more electricity and generate more heat. Keeping it safe may require a larger radiator or a shorter duty cycle.

### 3.5 Guidance, navigation, and control (GNC) and attitude control (ADCS)

GNC determines where the spacecraft is, plans where it should go, and controls its path or orientation. ADCS focuses on determining and controlling orientation, such as pointing an antenna at Earth.

Possible components include Sun and star sensors, gyroscopes and inertial measurement units, GPS receivers near Earth, reaction wheels, magnetorquers, control thrusters, computers, and estimation/control software.

Important data include pointing knowledge and accuracy, maximum wheel torque and momentum storage, maneuver and settling time, mass and power, redundancy, drift, noise, and error.

When reaction wheels become saturated with momentum, a spacecraft must unload them with magnetorquers or thrusters. Thruster-based unloading consumes propellant, so an attitude-control problem can become a propellant problem.

### 3.6 Communications

Communication is not only “range.” It depends on transmitter power, antenna size and gain, frequency, pointing, distance, noise, and the receiving network.

Relevant data include frequency band, transmitter power, antenna gain and beam width, data rate, distance and light-time delay, onboard storage, contact time, and link margin.

**Relationship:** a faster data link may require more power and more accurate pointing. A high-gain antenna reaches farther but has a narrow beam. Loss of contact does not automatically mean spacecraft loss; the vehicle may be outside a contact window or in safe mode.

### 3.7 Avionics, computing, and flight software

This family covers flight computers, processors, memory, payload data storage, command and data handling, software, clocks, sensor/actuator interfaces, and backup circuits.

Important data include processing and storage capacity, power and mass, radiation tolerance, error and reset rates, internal data interfaces, software version, and in-flight updates.

Radiation can flip a memory bit or disrupt electronics. The newest and fastest processor is not automatically the best spacecraft computer; a slower radiation-tolerant device may be more reliable.

### 3.8 Structures, materials, and mechanisms

The structure carries launch loads and holds equipment in alignment. Mechanisms include anything that deploys or moves, such as arrays, antennas, covers, arms, latches, and hinges.

Relevant data include material type, density and strength, vibration and shock loads, temperature limits and expansion, radiation and atomic-oxygen resistance, outgassing, mechanism cycle count, and qualification tests.

Important NASA sources:

- [MAPTIS](https://maptis.nasa.gov/Features) for material properties and test data, MISSE exposure information, and contamination/outgassing knowledge. Some non-NASA access became restricted or fee-based in January 2026.
- [NASA Outgassing Database](https://etd.gsfc.nasa.gov/capabilities/outgassing-database/) for mass loss and condensable material in vacuum.
- [NASA Materials and Processes Standards](https://standards.nasa.gov/materials-and-processes-parts) for selection and testing requirements.

### 3.9 Scientific payloads

The payload performs the mission: a camera, radar, spectrometer, magnetometer, or sampling instrument.

Its data include mass, power, field of view, resolution, wavelength range, data volume, operating time and temperature, pointing and stability requirements, and protection constraints.

A payload does not operate independently. A higher-resolution camera may require more stability, storage, communication capacity, and power.

---

## 4. Propulsion and propellants: the essential picture

### 4.1 Propellant does not always mean fuel

**Propellant** is matter used by a propulsion system to produce motion. **Fuel** is a material that releases energy in a reaction, but not every propulsion system burns fuel.

- A bipropellant system stores a **fuel and oxidizer** separately.
- A monopropellant decomposes one material through a catalyst.
- A cold-gas system expands compressed gas without combustion.
- Ion or Hall thrusters ionize and electrically accelerate material such as xenon.
- A solar sail uses sunlight pressure without traditional propellant.

Use **propellant** unless the material is specifically a fuel.

### 4.2 Launch propulsion versus in-space propulsion

A **launch vehicle** needs enormous thrust for minutes to rise against gravity and reach the required velocity. **Spacecraft propulsion** operates after separation and may deliver tiny but precise thrust for long periods.

NASA examples:

- The SLS core stage uses four RS-25 engines powered by liquid hydrogen and liquid oxygen and stores 733,000 gallons of these cryogenic propellants. [NASA Space Launch System](https://www.nasa.gov/reference/space-launch-system/)
- The two SLS boosters use solid propellant containing PBAN, ammonium perchlorate, and aluminum powder and operate for roughly two minutes. [NASA SLS Solid Rocket Booster](https://www.nasa.gov/reference/sls-space-launch-system-solid-rocket-booster/)
- Spacecraft already in space may use hydrazine, MMH/NTO, cold gas, xenon electric propulsion, or another system appropriate to the mission.

A launch engine and a small attitude thruster cannot be compared by thrust alone; they perform entirely different jobs.

### 4.3 Major propulsion families

| Type | How it works | Advantage | Cost or limitation |
|---|---|---|---|
| Monopropellant | A material such as hydrazine decomposes through a catalyst | Relatively simple and pulse-capable | Toxic and moderately efficient |
| Bipropellant | Fuel and oxidizer react in the engine | Higher thrust and performance | More tanks, plumbing, valves, and complexity |
| Cold gas | Compressed gas expands through a nozzle | Simple, clean, and precise | Low efficiency and total impulse |
| Solid motor | Fuel and oxidizer are mixed in a solid grain | High thrust and simple storage | Usually cannot be stopped or restarted |
| Electric/ion/Hall | Electrical energy ionizes and accelerates propellant | Very high propellant efficiency | Low thrust and high power/time demand |
| Propellantless | Sail or tether interacts with the environment | No traditional propellant consumption | Weak thrust and environment/control constraints |

NASA's 2026 report classifies small-spacecraft propulsion as chemical, electric, or propellantless and provides performance ranges, device tables, and reference missions. [NASA 2026 In-Space Propulsion](https://www.nasa.gov/smallsat-institute/sst-soa/in-space_propulsion/)

### 4.4 Components of a propulsion system

A propulsion system is more than an engine. It may include:

- One or more propellant tanks and a pressurant tank such as helium.
- Tubes, fittings, isolation and control valves.
- Pressure regulators, filters, pressure and temperature sensors.
- Heaters and propellant-management devices for microgravity.
- Injector, combustion chamber or catalyst bed, and nozzle.
- Main and attitude-control thrusters.
- A power processing unit for electric propulsion.
- Control electronics and software.

NASA JSC specifically describes tank and feed-system design and testing, valves, pressure-fed engines, refueling couplings, transfer lines, and refurbishment or repair of fluid and fuel valves. [NASA JSC Propulsion Subsystems](https://www.nasa.gov/reference/jsc-propulsion-subsystems/)

### 4.5 What propulsion data actually mean

| Data item | Meaning |
|---|---|
| Propellant type | The material or materials used by the system |
| Propellant mass | Amount at a stated time, often launch |
| Tank capacity | Maximum designed volume or mass, not necessarily actual fill |
| Dry/wet mass | Spacecraft mass without/with propellant |
| Thrust | Instantaneous force, normally in newtons |
| Specific impulse (Isp) | Propellant-use efficiency; a higher value is not the same as higher force |
| Total impulse | Force accumulated over operating time |
| Delta-v budget | Total velocity-change capability available for maneuvers |
| Mass flow rate | Propellant mass consumed per second |
| Burn duration | Operating time for a burn or across service life |
| Minimum impulse bit | Smallest controlled impulse a thruster can deliver |
| Tank/line pressure | Storage and feed pressure affecting operation and safety |
| Mixture ratio | Oxidizer-to-fuel ratio in a bipropellant system |
| Restart capability | Whether and how often the system can restart |
| Remaining propellant | An estimate that may be uncertain in microgravity |

### 4.6 A useful real example

Dawn carried about **425 kg of xenon** for ion propulsion and roughly **45.6 kg of hydrazine** for attitude control at launch. Xenon provided weak but efficient long-duration thrust, while hydrazine supported maneuvering and pointing. Exhausting hydrazine ended the mission's ability to control orientation even though the ion system used a different propellant. [NASA Dawn Spacecraft](https://science.nasa.gov/mission/dawn/technology/spacecraft/)

This shows that one spacecraft may carry multiple propellants and that a smaller support-system resource can determine the end of the whole mission.

### 4.7 Where actual fuel and component values come from

1. The official mission page, when it publishes mass, power, propellant, and engine values.
2. NTRS for design, testing, performance, and failure analysis.
3. Small Spacecraft SoA 2026 for surveys of commercial and experimental systems.
4. NASA spacecraft and engine pages, such as Dawn, SLS, and Orion.
5. NASA Launch Services performance resources for launch mass to different trajectories.

**Provenance warning:** the Small Spacecraft SoA is an official NASA report, but some product values come from manufacturers, company statements, and public literature. Their inclusion is not a NASA measurement or endorsement.

---

## 5. Health, faults, repair, and maintenance

### 5.1 The words are not interchangeable

- **Anomaly:** unexpected behavior or a reading that may not prove a fault.
- **Fault:** an undesired state or physical/logical cause that can lead to failure.
- **Failure:** a component or function can no longer perform within requirements.
- **Degradation:** gradual loss of performance, such as declining battery capacity.
- **Maintenance:** action that preserves condition or restores function.
- **Repair:** treatment of a fault through software, replacement, or physical intervention.
- **Servicing:** the broader concept of inspection, repair, refueling, upgrading, or relocation.

### 5.2 What data reveal spacecraft health?

These are often called **engineering telemetry** or state-of-health data:

- Battery and solar-array voltage, current, and temperature.
- Tank and line pressure and temperature.
- Valve position: open, closed, or uncertain.
- Reaction-wheel speed and torque.
- Computer, instrument, and payload temperatures.
- Computer reset count and memory errors.
- Circuit current and breaker state.
- Signal quality and data rate.
- Sensor readings and actuator status.
- Estimated remaining propellant and consumables.
- Spacecraft mode: normal, science, safe, standby, and others.
- Event logs, commands, and execution time.

A single reading rarely tells the whole story. Engineers examine **trends over time**, relationships between several channels, and the expected limits for each operational mode.

### 5.3 How a spacecraft handles a fault

A typical sequence is:

1. **Detect** a reading or behavior outside limits.
2. **Isolate** the suspected region and prevent propagation.
3. **Diagnose** the likely cause from the combined symptoms.
4. **Respond** by shedding a load, switching to backup, resetting, or entering safe mode.
5. **Recover** functions gradually and test them.
6. **Verify** that the spacecraft is stable and the problem is contained.

NASA guidance describes safe mode as a way to preserve vital power, thermal, and communication resources until ground recovery is possible, not as a magical repair. [NASA Fault Detection and Response](https://swehb.nasa.gov/spaces/SWEHBVD/pages/102695798/9.07%2BFault%2BDetection%2Band%2BResponse)

### 5.4 What repair is possible after launch?

For an uncrewed probe or satellite, repair usually does not mean a person replacing a part. Available actions may include:

- Sending new commands or resetting equipment.
- Uploading a software patch or changing operating limits and schedules.
- Disabling a damaged element or switching to a redundant unit or circuit.
- Using an alternate sensor or thruster.
- Changing attitude to manage thermal or power conditions.
- Reducing payload use to preserve essential resources.
- Changing orbit or maneuvering away from a threat.
- Accepting reduced performance to preserve part of the mission.

Physical repair is more practical on a crewed station such as the ISS, where crews can inspect leaks and replace units. Robotic satellite repair requires a servicing spacecraft, robotics, compatible interfaces, and tools.

### 5.5 Maintenance categories

- **Preventive maintenance:** before failure, such as inspecting or replacing an aging item.
- **Corrective maintenance:** after a problem, to restore function.
- **Contingency maintenance:** urgent action for a condition threatening safety or mission survival.
- **Condition-based maintenance:** triggered by measured condition rather than elapsed time alone.

NASA human-systems guidance identifies information maintainers need: procedures, visual aids, power/temperature/pressure state, maintenance history, confirmation of critical steps, and confirmation that function was restored. [NASA Human Systems Integration — Hardware and Equipment](https://www.nasa.gov/reference/9-0-hardware-and-equipment-vol-2/)

### 5.6 NASA sources for failure and repair knowledge

| Source | What it provides | What it does not provide |
|---|---|---|
| [NASA Lessons Learned](https://llis.nasa.gov/) | Real events, causes, and recommendations | Complete telemetry for every mission |
| [NESC Lessons Learned](https://www.nasa.gov/nesc/knowledge-products/lessons-learned/) | Technical cases involving valves, wiring, tanks, leaks, and software | A commercial parts catalog |
| [NTRS](https://ntrs.nasa.gov/) | Test, design, anomaly, reliability, and conference reports | Uniform detail or age across every record |
| [NEPP](https://nepp.nasa.gov/) | EEE part performance, failure modes, reliability, and radiation tests | Every mechanical subsystem |
| [Li-ion Battery Aging](https://data.nasa.gov/dataset/li-ion-battery-aging-datasets) | Battery cycles, temperature, capacity, impedance, and life prediction | Flight telemetry from a spacecraft |
| [MAPTIS](https://maptis.nasa.gov/Features) | Material tests, outgassing, MISSE, and fluid compatibility | Unrestricted free access to all content |
| [NASA Standards](https://standards.nasa.gov/) | Design, test, safety, and fault-tolerance requirements | Measured results in every case |
| [Satellite Servicing](https://technology.nasa.gov/satellite-servicing) | Rendezvous, capture, inspection, repair, and refueling technologies | A failure database for every satellite |

### 5.7 Robotic repair and refueling in orbit

NASA uses **ISAM** for In-Space Servicing, Assembly, and Manufacturing. Servicing can include repair, refueling, relocation, and upgrades. [NASA ISAM overview](https://www.nasa.gov/news-release/nasa-creates-in-space-servicing-assembly-manufacturing-consortium/)

Servicing requires relative navigation, rendezvous and rate matching, safe capture or docking, robotic arms and tools, cameras and force sensors, leak-resistant propellant transfer hardware, and knowledge of the client spacecraft's interfaces.

OSAM-1 developed technologies for this work but was **discontinued in 2024**. Its documentation remains a technical reference, not an active mission. [NASA OSAM-1](https://www.nasa.gov/mission/on-orbit-servicing-assembly-and-manufacturing-1/)

---

## 6. Spacecraft components and their data sources

The best single starting map is [NASA State-of-the-Art of Small Spacecraft Technology 2026](https://www.nasa.gov/smallsat-institute/sst-soa/). Its chapters cover:

1. Complete spacecraft buses and platforms.
2. Power.
3. In-space propulsion.
4. Guidance, navigation, and control.
5. Structures, materials, and mechanisms.
6. Thermal control.
7. Avionics and computing.
8. Communications.
9. Integration, launch, and deployment.
10. Ground systems and mission operations.
11. Identification and tracking.
12. Deorbit systems.

The report explains technologies, selection considerations, maturity, missions, and device tables. It focuses on **small spacecraft up to roughly 180 kg**, so it does not represent every large or crewed spacecraft.

### A useful data card for any component

When the team or an AI agent collects a component from a NASA source, it should understand:

- Function and parent subsystem.
- Mass, volume, operating power, and generated heat.
- Primary performance value and its unit.
- Test environment, service life or cycle count, TRL, and flight heritage.
- Known failure modes and detection methods.
- Redundancy or alternative functions.
- Resources and dependencies on other subsystems.
- Provenance: NASA measurement, mission report, paper, or manufacturer datasheet.

This contextual card is more valuable than copying an unexplained specification table.

---

## 7. Orbit, asteroid, and space-environment data

These data describe **what the spacecraft encounters**, not what the spacecraft is made from.

### 7.1 Asteroids and comets

- **NeoWs:** near-Earth-object discovery and approach records, estimated size, speed, and distance. The hazard flag is a defined astronomical classification, not a direct impact prediction. [NASA Open APIs](https://api.nasa.gov/)
- **JPL Small-Body Database — SBDB:** orbit, physical properties, classification, and uncertainty. [SBDB](https://ssd-api.jpl.nasa.gov/doc/sbdb.html)
- **Close-Approach Data — CAD:** calculated close approaches to planets and the Moon. [CAD](https://ssd-api.jpl.nasa.gov/doc/cad.html)
- **CNEOS Sentry:** future Earth-impact monitoring for known objects. [CNEOS](https://cneos.jpl.nasa.gov/)
- **Mission Design:** theoretical trajectory and opportunity information for reaching small bodies. [JPL Mission Design](https://ssd-api.jpl.nasa.gov/doc/mdesign.html)

Diameter is often **estimated**, an orbit has uncertainty, and calculations change when new observations arrive.

### 7.2 Spacecraft position and trajectory

- **JPL Horizons:** position and velocity of the Sun, planets, moons, asteroids, and selected spacecraft relative to a stated center and time. [Horizons](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- **NAIF SPICE:** precise mission geometry for position, orientation, body shape, time, and instrument field of view. [NASA/JPL NAIF](https://naif.jpl.nasa.gov/naif/about.html)
- **SSCWeb:** orbits for scientific spacecraft near Earth and regions such as the magnetosphere. [NASA SSCWeb](https://sscweb.gsfc.nasa.gov/WebServices/REST/)

A position has no useful meaning without its time, reference body, coordinate system, and unit.

### 7.3 Space weather and environment

- **DONKI:** solar flares, coronal mass ejections, geomagnetic storms, shocks, and energetic particles that can affect electronics, power, navigation, and communications. [NASA DONKI](https://ccmc.gsfc.nasa.gov/DONKI/) · [CCMC service update](https://ccmc.gsfc.nasa.gov/news/major-updates/)
- **CDAWeb/SPDF:** measured fields, particles, and plasma from scientific instruments. [NASA SPDF](https://spdf.gsfc.nasa.gov/)
- **PDS:** planetary-science archives from missions, instruments, and science teams, including some international partner contributions. [NASA PDS](https://pds.nasa.gov/)

DONKI records **events**, while CDAWeb and PDS may contain **scientific measurements**. These are not complete spacecraft health telemetry.

---

## 8. Official-source map by question

| Question | Start here | Why |
|---|---|---|
| What is a spacecraft made of? | NASA Onboard Systems + Small Spacecraft SoA | System explanation followed by technology surveys |
| Mass, power, and propellant for a particular spacecraft? | Official mission page, then NTRS | Values tied to the same vehicle |
| Types of engines and propellants? | 2026 In-Space Propulsion | Current scientific comparison |
| Tank and feed-line components? | JSC Propulsion + NTRS | Fluid-component design and testing |
| How does a battery degrade? | NASA Ames battery dataset | Run-to-failure measurements and life prediction |
| How do electronics fail under radiation? | NEPP/Radhome | Space-electronics test knowledge |
| How is a material selected? | MAPTIS + Outgassing DB + Standards | Properties, tests, and environmental compatibility |
| Real failures and lessons? | LLIS + NESC + NTRS | Causes, outcomes, and recommendations |
| How is spacecraft health monitored? | Mission telemetry documents + fault-management references | Links sensors, limits, and response |
| How can a satellite be repaired or refueled? | NASA ISAM and satellite servicing | Rendezvous, robotics, and transfer technologies |
| Where is an asteroid and what is its risk? | SBDB + CAD + Sentry | Orbit, approach, and uncertainty |
| Where is a spacecraft or planet? | Horizons or SPICE | Time-dependent position and orientation |
| What is the solar environment? | DONKI + CDAWeb | Events and measured conditions |
| What can a launch vehicle carry? | NASA LSP Performance + vehicle page | Payload-to-orbit capability and vehicle specifications |

---

## 9. What is actually NASA data?

### Produced or measured by NASA

Examples include NASA Ames battery testing, reports and tests produced by NASA centers in NTRS, NASA mission instrument data in PDS or CDAWeb, official JPL asteroid calculations, and NASA material/electronics tests in MAPTIS and NEPP.

### Officially hosted but mixed in origin

- PDS can contain international partner data.
- NSSDCA documents NASA and non-NASA missions.
- Small Spacecraft SoA combines NASA information with manufacturer and public literature.
- MAPTIS also includes commercial, government, and international sources.
- OSDR can include results from external repositories when broader search is enabled.

### Listed by NASA but externally sourced

The **TLE API** entry in `api.nasa.gov` points to an external service at `tle.ivanstanojevic.me` and says its records are updated from CelesTrak. Classify that general TLE catalog as external reference material. Use SSCWeb for supported scientific spacecraft and NSSDCA for selected mission records. The alternatives have narrower coverage.

### The provenance rule

Use NASA or NASA/JPL-produced measurements, analyses, models, or documented findings from official sources for new scientific inputs. NASA-authored reports can establish findings about partner hardware when the report supplies the evidence. Keep any vendor or partner values that NASA simply republishes labeled as external reference material. Record who produced the value, which mission, component and time it describes, and its evidence class, units, and uncertainty.

---

## 10. Data that are usually not public

It is unrealistic to expect one public dataset containing everything about every spacecraft. Usually unavailable are:

- Complete real-time engineering telemetry for every satellite.
- Detailed manufacturing CAD for every component.
- Sensitive flight code and operating limits.
- Complete bills of materials, suppliers, and prices for each mission.
- Precise remaining propellant for every active spacecraft.
- Full fault procedures for sensitive or crewed vehicles.
- Proprietary, export-controlled, or security-restricted information.

When a value is missing, do not invent it or combine values from unrelated spacecraft as if they formed one design. Use a sourced scientific range or identify the number as an explicit design assumption.

---

## 11. How an AI agent should use this guide

Any AI agent working on this project should:

1. Model the trade-offs needed for the approved mission decisions at the appropriate level of fidelity.
2. Tie each decision to a real spacecraft concern: mass, power, heat, propulsion, communications, control, reliability, or payload.
3. Avoid calling every propellant a fuel.
4. Distinguish thrust from efficiency and capacity from remaining amount.
5. Separate launch-vehicle propulsion from spacecraft propulsion after launch.
6. Distinguish measured, estimated, predicted, and manufacturer-specified values.
7. Never interpret “Potentially Hazardous Asteroid” as a confirmed collision.
8. Never treat an anomaly as a final failure before diagnosis.
9. Distinguish remote recovery, a redundant path already installed, and physical service requiring access, tools, and qualified personnel or robotic capabilities.
10. State source, mission, unit, and time when using a number.
11. Never turn one vehicle's values into a universal rule for all spacecraft.
12. Keep the same hazard and component rules usable across mission phases and independent of presentation.

### Trace a change to the system it affects

Follow `component → affected budgets and interfaces → mission-phase consequence → observable outcome`. For example, a battery with more usable energy can support a longer eclipse at the same load, provided its voltage, allowable discharge rate and operating temperature fit. For a fixed mass budget, a heavier battery reduces the mass available elsewhere. Section 20 covers the conditions behind common upgrades.

---

## 12. Beginner glossary

| Term | Plain meaning |
|---|---|
| Bus | The spacecraft platform and services carrying the payload |
| Payload | Equipment that accomplishes the mission objective |
| Telemetry | Measurements sent by the spacecraft about itself or its environment |
| Command | An instruction sent to the spacecraft |
| State of health | The condition of systems inferred from measurements and states |
| Safe mode | A simplified mode preserving vital resources while awaiting recovery |
| Redundancy | A backup that can provide a function after a failure |
| Consumable | A resource depleted by use, such as propellant or pressurant gas |
| Propellant | Matter used by a propulsion system to produce motion |
| Fuel | Energy-releasing reactant; not always a synonym for propellant |
| Oxidizer | Reactant allowing fuel to burn without atmospheric oxygen |
| Thrust | Instantaneous propulsive force |
| Specific impulse | A measure of propellant-use efficiency |
| Delta-v | The amount of velocity change a spacecraft can perform |
| Attitude | Spacecraft orientation, not location |
| Orbit | Gravitational path around a body |
| Ephemeris | Position and velocity over time |
| TRL | Technology maturity scale from concept to demonstrated operation |
| EOL | End of life or defined stopping condition |
| RUL | Predicted remaining useful life |
| FDIR | Fault detection, isolation, and recovery |
| ISAM | In-space servicing, assembly, and manufacturing |
| Outgassing | Release of volatile material in vacuum |
| Radiation hardened | Electronics designed to tolerate radiation effects |

---

## 13. Recommended research order

1. Read [NASA Onboard Systems](https://science.nasa.gov/learn/basics-of-space-flight/chapter11-1/) to understand the spacecraft as a system.
2. Use [Small Spacecraft SoA 2026](https://www.nasa.gov/smallsat-institute/sst-soa/) to build a component and trade-off map.
3. Select two or three missions resembling the intended journey and study their official spacecraft pages instead of mixing dozens of missions.
4. Use NTRS for engineering detail missing from public mission pages.
5. Use LLIS, NESC, NEPP, battery, and materials sources to understand failure, degradation, and recovery.
6. Use JPL SSD, Horizons, and SPICE for asteroids and trajectories. Use DONKI and CDAWeb for the space environment.
7. Store the source, mission, unit, date, and measured/estimated/specification status with every number.

---

## 14. Limits of this report

- This is a guide for understanding data and directing research, not a flight-ready spacecraft design.
- There is no single official API containing every spacecraft component, propellant, failure, and repair record.
- Public data are distributed across mission pages, reports, archives, test databases, and standards.
- Some official NASA resources contain manufacturer or partner data; this guide identifies that instead of calling everything NASA-originated.
- Sensitive operational, proprietary, and export-controlled information will not be public.
- Source status was reviewed through November 7, 2026 and can change.

---

## 15. Launch vehicles and spacecraft architecture

Start with the mission phase and required function. A launch vehicle gets a payload to a specified orbit or departure state. The spacecraft then operates in orbit, travels, lands, returns, or performs a combination of those tasks. One stack can contain hardware for several roles.

| Hardware | What it does | Data that establish fit |
|---|---|---|
| Booster or first stage | Supplies ascent thrust and carries early flight loads | Sea-level thrust, burn duration, wet and dry mass, separation event, applicable flight loads |
| Core or upper stage | Adds velocity, inserts a payload into orbit or starts a transfer | Vacuum thrust and specific impulse, restart and coast limits, stage mass, injection conditions |
| Engine and feed system | Produces thrust and brings propellant from the tank to the engine | Fuel and oxidizer, operating pressure, temperature, thrust, mass flow, throttle and restart limits, compatible feed type |
| Fairing, adapter and separation system | Protects and mounts the payload, then releases it | Usable payload envelope, allowable mass and center of gravity, attachment geometry, separation shock |
| Capsule, service module or transfer vehicle | Carries crew or cargo and supplies power, thermal control or in-space propulsion as designed | Crew or payload capacity, consumables, mission duration, power, propulsion, docking and abort provisions where applicable |
| Lander, return capsule or sample vehicle | Operates near or on a surface, or survives atmospheric entry and recovery | Target gravity and terrain, landing loads, descent and ascent requirements, heat-shield and entry envelope, recovery conditions |

Build a phase-by-phase mass ledger. Record the mass attached before and after a stage separates, the propellant available to each phase, and the payload delivered to a specified destination. Payload capacity varies with the launcher configuration, orbit, inclination and injection energy. A launch performance chart is a conditional capacity reference. A verification standard tells you how flight hardware is assessed. Flight reports tell you what happened on a particular flight. [NASA SLS reference](https://www.nasa.gov/reference/space-launch-system/) · [NASA Orion reference](https://www.nasa.gov/reference/orion-spacecraft/) · [NASA Launch Services Program performance site](https://elvperf.ksc.nasa.gov/Pages/Default.aspx) · [NASA Goddard GEVS](https://standards.nasa.gov/standard/GSFC/GSFC-STD-7000)

### Propellant compatibility and storage

| Family or pairing | Typical distinction to preserve |
|---|---|
| Liquid oxygen and RP-1 | RP-1 is a refined kerosene-type rocket fuel. The Saturn V first-stage F-1 is a documented example. Liquid oxygen is the oxidizer and needs cryogenic storage. |
| Liquid oxygen and liquid hydrogen | Both are cryogenic. Hydrogen's low density matters for tank volume. The SLS RS-25 is a documented example. |
| Liquid oxygen and liquid methane | Both require cryogenic management. Track thermal losses, storage duration and transfer status for the specific system. |
| Storable hypergolics | A pair can ignite on contact. The Orion European Service Module uses monomethylhydrazine (MMH) with MON-3. Handling, seals and feed systems are specific to the pair. |
| Solid, hybrid and monopropellant | A solid motor stores a solid grain. A hybrid normally separates a solid fuel from a fluid oxidizer. A chemical monopropellant uses one substance or formulated fluid. Verify restart capability per device. |
| Cold gas and electric | Cold gas uses stored pressure. Ion and Hall systems consume reaction mass such as xenon and require electrical power. Capture thrust, input power and propellant together. |

Treat fuel, oxidizer, reaction mass, and pressurant as separate roles. Store volume separately from mass. Convert between them only with a sourced density for the applicable fluid conditions. Keep tank capacity, loaded propellant, usable propellant, reserve and estimated remaining quantity distinct. For cryogens, track boil-off, cooling power and whether transfer was demonstrated. For a proposed propellant swap, check engine qualification, tanks, feed pressure, materials, seals, thermal controls, interfaces and vehicle mass. [NASA F-1 history](https://ssfl.msfc.nasa.gov/history/programs) · [NASA Orion ESM flight propulsion report](https://ntrs.nasa.gov/citations/20240003648) · [NASA In-Space Propulsion](https://www.nasa.gov/smallsat-institute/sst-soa/in-space_propulsion/) · [NASA Cryogenic Fluid Management](https://www.nasa.gov/space-technology-mission-directorate/tdm/cryogenic-fluid-management-cfm/)

## 16. Space stations, satellites and orbital facilities

Classify an asset along four separate dimensions: its **role**, **orbit**, **physical platform**, and **operating status**. A CubeSat describes a form factor. Communications describes a role. Low Earth orbit describes where it operates. Crew presence may change during a station's mission.

| Asset family | What distinguishes it | Data to look for |
|---|---|---|
| Crewed research station in low Earth orbit | Long-lived habitat and laboratory assembled from modules, such as the ISS | Pressure volumes, crew capacity, ports, truss and solar arrays, cooling loops, robotics, visiting vehicles, power, life support and resupply |
| Crewed cislunar outpost concept | Facility designed around lunar access and limited crew visits. Use Gateway documents as architecture references and verify program status separately. | Reference orbit, propulsion and power element, habitation and logistics modules, docking, radiation environment and mission concept |
| Commercial station or free-flying laboratory | A provider can offer laboratory, habitat or hosted-payload services. Record each project's development stage and actual services. | Operator, crew model, platform status, available power, thermal rejection, cargo and servicing interfaces |
| Orbital depot, service hub or tug | Stores or transfers resources, handles payloads, or moves spacecraft when equipped to do so | Client compatibility, capture method, transferable fluid, storage duration, resupply and support status. Label proposed depots separately from actual stations. |
| Communications, relay or navigation satellite | Connects users, relays data or supplies timing and positioning signals | Frequency, coverage, antenna pointing, bandwidth, clocks and orbit. A constellation is a group of spacecraft, not a spacecraft type. |
| Weather, Earth observation or science satellite | Measures Earth, the Sun, space or astronomical objects | Sensor bands, observation geometry, pointing, revisit, resolution, data generation and downlink |
| Technology demonstration or servicing satellite | Tests a capability or interacts with other spacecraft | Demonstration objective, client interface, relative navigation, operational constraints and verified outcome |

Use LEO, MEO, GEO, polar and Sun-synchronous as orbit descriptors with the center body, inclination, altitude or elements, epoch and frame where relevant. For crewed stations, add environmental control and life support (ECLSS), including cabin atmosphere, CO₂ removal, water, oxygen, waste handling and usable reserves. A docking port establishes a mating interface. Track power, data, crew transfer and propellant transfer as separate capabilities. For international stations and commercial vehicles, keep the partner or operator attribution on each record. [NASA ISS assembly elements](https://www.nasa.gov/international-space-station/international-space-station-assembly-elements/) · [NASA ISS facts](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/) · [NASA ECLSS](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) · [NASA Gateway architecture](https://www.nasa.gov/mission/gateway/) · [NASA Commercial Space](https://www.nasa.gov/humans-in-space/commercial-space/) · [NASA Earth satellite orbit catalog](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/)

## 17. Hazards by environment and mission phase

Record what creates a hazard, when the vehicle is exposed, which systems can be affected, and what evidence supports any mitigation. Exposure, damage, and mission loss are different outcomes.

| Hazard | Useful evidence | How to interpret it |
|---|---|---|
| Orbital debris and conjunctions | Orbit, time of closest approach, miss distance, relative speed, uncertainty, encounter probability where supplied, projected area | NASA ORDEM models debris exposure across an orbital environment. NASA CARA guidance covers individual encounters. An environmental flux is a rate per area and time under stated conditions. An encounter probability applies to a particular screening solution. |
| Natural micrometeoroids | Particle mass or size, speed and direction, environmental flux, shielding geometry and test evidence | NASA MEM estimates the natural meteoroid environment. Shield penetration depends on the particle and the shielding configuration. Earth asteroid close approaches are a separate class of event. |
| Solar particle events, charging and radiation | Event time, region, particle energy or flux, dose at a defined location, component test conditions | DONKI describes events. SPDF offers scientific measurements. NEPP documents how electronics respond under test conditions. Deriving a particular spacecraft's failure rate requires a supported exposure and response model. |
| Eclipse, heating and material degradation | Shadow duration, temperatures, thermal cycles, material and operating limits | Compare exposure with the component's actual configuration. Use outgassing and exposure tests only for the tested material and conditions. |
| Launch, separation, deployment and atmospheric entry | Vibration and shock levels, pressure and temperatures, entry trajectory, heat-shield or separation test results | Each mission phase creates different loads. Keep qualification limits, predicted loads and observed flight conditions distinct. |
| Proximity operations, docking, landing and sampling | Relative position and velocity, sensor visibility, approach constraints, terrain and surface strength | Failure modes include lost tracking, contact outside allowed limits and unstable terrain. NASA's Bennu sampling results describe one measured environment with an unexpectedly loose surface. |
| Internal faults and resource losses | Fault histories, leak trends, power and fluid readings, redundancy, station or vehicle mode | Check which functions remain available, how long reserves last, and whether isolation or substitution was demonstrated. |

[NASA debris models](https://orbitaldebris.jsc.nasa.gov/modeling/) · [NASA Meteoroid Engineering Model](https://www.nasa.gov/meteoroid-environment-office/sporadic-meteoroid-environment/) · [NASA CARA](https://www.nasa.gov/cara/) · [NASA DONKI](https://ccmc.gsfc.nasa.gov/DONKI/) · [NASA NEPP](https://nepp.nasa.gov/) · [NASA Bennu sampling case](https://www.nasa.gov/missions/surprise-again-asteroid-bennu-reveals-its-surface-is-like-a-plastic-ball-pit/)

### 17.1 Meteoroids, meteors, and orbital debris

A **meteoroid** is natural material traveling through space. A **meteor** is the luminous phenomenon during atmospheric entry. A **meteorite** is material that survives entry and reaches a surface. For a spacecraft in vacuum, describe the threat as a meteoroid or micrometeoroid impact. Human-made orbital debris is a separate population. A cataloged asteroid close approach is a separate trajectory event. [NASA Meteors and Meteorites](https://science.nasa.gov/solar-system/meteors-meteorites/)

- **Sporadic background exposure.** Natural small particles create ongoing exposure along a route. NASA MEM estimates the environment for a specified trajectory and particle population. Model flux as an exposure estimate with units, direction, and time coverage. Shield response and component vulnerability need separate evidence or an explicit simulation assumption. [NASA sporadic meteoroid environment](https://www.nasa.gov/meteoroid-environment-office/sporadic-meteoroid-environment/)
- **Elevated stream exposure.** A suitable encounter with a meteoroid stream can anchor a single mission phase. Track its location, exposure window, affected surfaces and feasible operating responses. NASA's shower forecast work for Earth and near-Earth spacecraft describes mitigations such as reorienting exposed equipment or closing optical shutters where supported. Apply forecasts only within their documented coverage. [NASA shower meteoroid environment](https://www.nasa.gov/meteoroid-environment-office/shower-meteoroid-environment/)
- **Trackable debris conjunction.** A predicted close approach involving a tracked object can support a discrete avoidance decision. Compare the encounter with the vehicle's maneuver authority and reserve. Keep this separate from statistical exposure to smaller debris. [NASA CARA](https://www.nasa.gov/cara/) · [NASA Orbital Debris Program Office models](https://orbitaldebris.jsc.nasa.gov/modeling/)

NASA reported a micrometeoroid impact on one of Webb's primary mirror segments in May 2022. The observatory continued to exceed mission performance requirements after the impact. Use this as evidence that damage to an exposed component can leave a spacecraft operational with a measured performance change. Apply the observed result only to that case. [NASA Webb impact report](https://science.nasa.gov/blogs/webb/2022/06/08/webb-engineered-to-endure-micrometeoroid-impacts/)

### 17.2 Select a hazard that can drive a mission phase

An environmental hazard can serve as the main opposition for one phase, recur as a condition across several phases, or combine with an existing fault. Select it by mission fit and the decision it creates.

| Candidate | When it fits | Decision and possible consequence |
|---|---|---|
| Elevated micrometeoroid exposure | The route and timing support an exposure window and a sensitive surface is relevant | Delay or change orientation where feasible. Closing a shutter can protect optics while suspending observations. |
| Tracked orbital debris | An Earth-orbit phase has a defined conjunction and maneuver capability | Compare a delay or avoidance maneuver against propellant reserve and arrival constraints. |
| Solar energetic particles | The route has relevant exposure and the configuration includes susceptible electronics or crew | Use a compatible redundant path, delay a critical operation, or use a supported protective procedure. Track how reduced capability changes the mission. |
| Eclipse or thermal constraint | A phase has limited sunlight, heat rejection or battery margin | Reduce nonessential loads or pause a high-power activity. The remaining energy or cooling margin constrains how long the vehicle can continue. |
| Cascading subsystem failure | One system depends on another, or the recovery path uses a limited resource | Switch to a backup, isolate the fault or seek a compatible spare. Record which function returns and what remains unavailable. |

### 17.3 Agent handoff for a hazard encounter

1. Define the **mission phase, environment and exposure window**. Label the encounter as observed, modeled, or an illustrative scenario.
2. Name the **exposed component and dependency**. Trace the chain from exposure through a plausible failure or degradation to a capability change. Link the source and identify the vehicle-specific assumptions.
3. Specify what the **player can observe before and after** the event, including uncertainty. For an exposure model, use a forecast or sensor summary. Use a tracked conjunction only where the source and scenario support an individual object.
4. Offer feasible **responses and their costs**, such as delaying, pausing a payload, protecting a component, or using a backup. Carry the remaining capability and resource costs into the next phase.
5. Keep a **factual record**, **simulation rules** and **optional presentation** separate. Personification can represent an encounter for the player. The same encounter should remain playable through telemetry and mission controls alone.

**Illustrative test.** In a phase with increased meteoroid exposure, a vehicle with a closable optical shutter can pause observations to reduce exposure of the optics. A vehicle without that mechanism can consider delaying the operation when scheduling permits. If an illustrative impact degrades the instrument, carry that state forward and evaluate whether the next service point can actually restore it. Define any simulated damage rate or severity separately from the NASA exposure evidence.

## 18. What can be repaired, replaced, assembled or manufactured in space?

**Serviceability is a property of a particular configuration.** A station or robotic servicer needs compatible tools, access and operating conditions. A completed experiment supports the capability it actually demonstrated at its tested scale and environment.

| Change | Evidence and checks |
|---|---|
| Reset, update or switch to a backup | Confirm the alternate computer, sensor, bus or safe mode exists. Record which functions return and any remaining limits. Hubble's one-gyro mode is an operational workaround. |
| Replace or upgrade a unit | Look for accessible mounts, compatible power/data/thermal connections, tools and a spare. Hubble servicing missions provide flight examples of instruments, gyros and batteries being replaced. |
| Attach a module or deploy a structure | Confirm mechanical capture, load paths, alignment, power/data links, control authority and test access. The ISS assembly record documents actual elements assembled in orbit. |
| Refuel or replenish coolant | Match the fluid, coupler, pressure, temperature and receiving capacity. RRM3 demonstrated methane storage and robotic hose/tool operations. Its planned cryogenic transfer was prevented by an equipment issue. |
| Use a tug or servicer for reboost | Verify that rendezvous, capture and combined-stack control fit the client and the orbit. Reboost and refueling are different services. |
| Salvage or manufacture a part | Identify prior ownership and condition, material and process, and evidence of inspection and qualification for the new role. Treat a printed prototype, a demonstrated part, and a qualified pressure-bearing or structural part as different records. |
| Rebuild a vehicle from modules | A viable assembled spacecraft requires structural integrity, power and thermal balance, flight control, communications, and propulsion when the mission needs it. Add pressure, life support and emergency provisions for crewed operation. Missing interface or qualification evidence leaves the assembly unverified. |

### A compatibility gate for any proposed rebuild

Record mechanical fit and load paths, mass and center-of-mass shift, electrical supply and connectors, data protocols and command authority, heat rejection, fluid and seal compatibility, orientation and clearance, and which person or robot can safely access the part. Recalculate the affected budgets for the resulting configuration. Store each interface as **compatible**, **incompatible**, or **unknown**, with its evidence. An unknown can remain an explicit game assumption pending verification.

[NASA ISAM and State of Play](https://www.nasa.gov/isam/) · [NASA Hubble servicing missions](https://science.nasa.gov/mission/hubble/observatory/missions-to-hubble/) · [NASA Hubble one-gyro mode](https://science.nasa.gov/mission/hubble/observatory/design/hubble-one-gyro-mode/) · [NASA RRM3 flight results](https://www.nasa.gov/missions/station/nasas-refueling-mission-completes-second-set-of-robotic-tool-operations-in-space/) · [NASA ISAM technical report](https://ntrs.nasa.gov/citations/20250008988) · [NASA architecture and docking standards](https://www.nasa.gov/architecture-standards/) · [NASA materials and manufacturing standards](https://standards.nasa.gov/materials-and-processes-parts)

### 18.1 Model the whole spacecraft at a service point

Carry the vehicle configuration into and out of every stop. Use the applicable categories below as a coverage map. Read sections 3–6 for subsystem definitions and section 15 for launch, transit, landing, and return hardware.

| Vehicle requirement | State or compatibility to track |
|---|---|
| Structure, shielding, and mechanisms | Mounts, load limits, mass distribution, access panels, damage, deployables, and the surfaces protected |
| Propulsion and maneuvering | Installed thrusters, propellant and pressurant types, usable reserves, valves and feed paths, restart limits, and remaining maneuver capability |
| Electrical power and thermal control | Generation, battery energy, electrical interfaces, operating loads, cooling loops, and available heat rejection |
| Navigation, attitude, avionics, and communications | Working sensors, actuators and computers, independent backups, pointing and link capability, and usable navigation modes |
| Payload and storage | Instruments or cargo, mass and volume, restraints, required power, data storage, and any mission function that depends on the payload |
| Crew systems where applicable | Pressurized volume, oxygen, water, carbon dioxide removal, shelter, emergency equipment, and consumable margins |
| Service provisions | Docking or capture interface, reachable equipment, isolation points, compatible transfer couplers, and documented checkouts |

### 18.2 Define what a station can do at a checkpoint

Represent each facility as an asset with an orbit or location, operator, operating state, approach and departure windows, available interfaces, and a list of supported services. An inspection stop, a cargo outpost, a staffed maintenance station, and a propellant depot can share the same checkpoint rules while offering different capabilities.

| Service | Prerequisites to verify |
|---|---|
| Rendezvous, docking, or robotic berthing | Reachable orbit, navigation and control, compatible active/passive hardware or capture system, port availability, and a feasible departure plan |
| Inspection and diagnostics | Sensor coverage, data or physical access, and ability to observe the relevant symptoms without assuming a successful repair |
| Cargo, consumables, or power support | Stock and transfer path for each resource. Check voltage and power limits for an electrical connection, or actual container and handling compatibility for cargo. |
| Module repair, replacement, or upgrade | Accessible hardware, compatible equipment, service crew or robotics, tools, isolation, capacity and a post-service test |
| Propellant or coolant transfer | Supported fluid, compatible transfer interfaces, operating pressure and temperature, receiving capacity, and a capability demonstrated for the relevant configuration |
| Temporary refuge or crew transfer | Pressurized passage or another verified transfer method, available life support and crew capacity, and an applicable operating mode |

For each service, record an evidence-backed capability, a scenario availability state, the vehicle requirements, and the result. Separate a compatible port from compatible power, crew, data, and fluid connections. NASA's ISS reports document direct docking on Dragon missions and robotic capture followed by installation on Cygnus missions. Use those as distinct operational examples. [NASA ISS commercial resupply](https://www.nasa.gov/international-space-station/commercial-resupply/) · [NASA Cygnus mission overview](https://www.nasa.gov/missions/station/nasas-northrop-grumman-crs-24-mission-overview/) · [NASA architecture and interface standards](https://www.nasa.gov/architecture-standards/)

### 18.3 Spare parts and service-point logistics

A spare is useful when it restores a named capability under the conditions of a particular vehicle and service point. The ISS cooling-loop failure in 2010 provides a documented example. The station used its other cooling loop with reduced operations until astronauts replaced the failed pump module with a stored **Orbital Replacement Unit (ORU)**, a module designed to be exchanged on orbit. The NASA OIG also documents cases where unavailable spares and cargo scheduling delayed repairs. [NASA ISS pump failure and recovery](https://ntrs.nasa.gov/citations/20150004079) · [NASA OIG ISS maintenance audit](https://oig.nasa.gov/wp-content/uploads/2024/09/ig-24-020.pdf#page=18)

| Record | What an agent should preserve |
|---|---|
| Failed unit and capability | Affected component and configuration, observed symptoms, fault confidence, operational limits, and available backup |
| Spare and compatibility | Replacement or upgrade, supported variants, interface evidence, condition, mass and volume, and qualification status |
| Supply and location | Onboard stock, stock at a service point, or resupply. Track quantity, arrival window, provenance and whether availability is known. |
| Installation and verification | Required access, tools, service mode, time and resource cost. Verify restored function before updating capability. |
| Mission consequence | Capability restored or still degraded, spare consumed, resources spent, and any effect on the next phase |

Keep an installed backup, a physical spare, and a consumable as separate records. When the original source describes maintenance practice but omits inventory, part prices, or service time, label any game values as project assumptions.

**Illustrative test.** A cooling-loop fault leaves the vehicle on backup cooling and limits high-power work. At the next service point, a compatible pump with confirmed stock and suitable installation access can restore the modeled cooling capacity after a successful check. If the pump is incompatible or unavailable, the vehicle keeps its reduced operating limits and can wait for resupply or revise its plan if the scenario allows. Treat this as an independent fault case. A scenario that links an impact to a cooling failure needs its own supported dependency or a labeled assumption.

### 18.4 Verify the checkpoint transition

1. **Before arrival:** Check whether the current vehicle state can reach, communicate with, and dock at or otherwise access the facility. Carry forward the approach maneuver's propellant, time, and power costs.
2. **At the checkpoint:** Match the requested service to available staff or robotics, inventory, interfaces, and facility operating limits. Track service time and resources. Capture which systems were inspected, restored, upgraded, replenished, or left degraded.
3. **Before departure:** Update the vehicle's mass, power and thermal margins, consumables, operational limits, and available backups as applicable. Recalculate the next leg and explain what now fits within its constraints.
4. **Check the alternate case:** Change one condition such as an occupied port, unavailable service arm, incompatible part, or unavailable resupply. Verify the spacecraft can follow an approved fallback or that the phase reports why departure is blocked. Maintain the same state record across both paths.

## 19. Additional NASA data worth tracking

| Topic | Why it belongs in the mission model | Official starting point |
|---|---|---|
| Station resupply, spares and consumables | A repair depends on spare availability, access, logistics and crew time. A consumable can constrain endurance even while the vehicle is otherwise healthy. | [NASA OIG ISS operations and maintenance audit](https://oig.nasa.gov/wp-content/uploads/2024/09/ig-24-020.pdf) |
| Ground contact and deep-space communication | The mission may have to store data, wait for a link or act without immediate ground input. | [NASA Deep Space Network](https://www.nasa.gov/communicating-with-missions/dsn/) |
| Technology maturity and demonstrations | Distinguish a research objective, ground test, flight demonstration and routine operation. A successful demo may cover only one interface or operation. | [NASA TechPort](https://techport.nasa.gov/) · [NASA Small Spacecraft SoA](https://www.nasa.gov/smallsat-institute/sst-soa/) |
| Small-body surface and mission geometry | Shape, rotation, terrain, lighting and surface properties matter for approach and sampling. | [NASA Planetary Data System](https://pds.nasa.gov/) · [NASA/JPL SPICE](https://naif.jpl.nasa.gov/naif/) |
| Deorbit and end-of-life planning | Reserve, drag, disposal timing and safe operating modes affect the end of a mission. | [NASA Small Spacecraft SoA](https://www.nasa.gov/smallsat-institute/sst-soa/) · [NASA Orbital Debris Program Office](https://orbitaldebris.jsc.nasa.gov/) |

### 19.1 NASA 3D models and visual references

Use the official catalog to find visual references for spacecraft, launch vehicles, and orbital infrastructure. For each selected model, record its mission or hardware variant, asset page, credited creator, file format, and any stated scale or units. Check the individual asset's credit and usage terms before reusing it. The original Ames URL redirects to the current NASA Science catalog. [NASA 3D Resources](https://science.nasa.gov/3d-resources/) · [Original Ames URL](https://nasa3d.arc.nasa.gov/) · [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)

Classify catalog models as visual references. Verify dimensions, mass, interface fit, and operating limits separately against mission specifications or engineering documentation before using those values in the simulation.

## 20. Turn an upgrade claim into a measurable comparison

| Upgrade target | Compare these quantities | Hold constant or disclose |
|---|---|---|
| Faster acceleration or burn | Thrust and vehicle mass at the same point in a maneuver, plus burn duration | Engine operating condition, configuration, trajectory and mass changes |
| Shorter travel time | Departure and arrival dates, total maneuver time, transfer trajectory and arrival conditions | Origin, destination, epoch, flight constraints, required arrival state and propulsion model |
| More maneuver capability | Available delta-v in each phase, usable propellant and specific impulse | Stage and reserve assumptions, propulsion and power limits. Delta-v is change in velocity capability, while travel time comes from the trajectory. |
| Stronger or stiffer structure | Yield or ultimate strength for defined failure criteria, stiffness or deflection under load, fatigue and joint strength | Material form, geometry, load direction, temperature, fabrication and test conditions. Material strength alone cannot establish assembled vehicle strength. |
| Better impact or thermal survival | Shield configuration and tested impact response, temperature limits, heat rejection or thermal margin | Exposure, component layout, test geometry, impact speed, heat source and duration |
| Longer endurance | Usable battery energy and load, propellant or coolant use, degradation, spares and crew consumables where applicable | Duty cycle, power generation, thermal conditions, reserve and maintenance assumptions |
| Greater fault tolerance | Faults the architecture can survive, recovery time and remaining capabilities | Backup compatibility, independent dependencies and common-cause failures |

The ideal rocket equation relates specific impulse and wet-to-dry mass ratio to ideal delta-v. For a single idealized stage, `Δv = g₀ × Isp × ln(m_start / m_end)`. Use the mass immediately before and after the modeled burn with the same attached hardware. For a real transfer, account for trajectory, thrust profile, losses and operational constraints. A larger engine or tank changes the mass ledger and may change other budgets as well. [NASA Glenn ideal rocket equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/) · [NASA In-Space Propulsion](https://www.nasa.gov/smallsat-institute/sst-soa/in-space_propulsion/) · [NASA Goddard GEVS](https://standards.nasa.gov/standard/GSFC/GSFC-STD-7000)

## 21. How an agent should handle unfamiliar or updated data

Use this workflow for an API response, spreadsheet, PDF table, mission fact sheet, standard, historical test, existing project file or modeled output. It describes the information the repo needs to preserve. Follow the approved architecture when choosing where or how to store it.

### 21.1 Verify the source before adapting the project

1. **Start with a question and inspect the current project.** Identify the decision or feature that would consume the data. Read its issue and the relevant source-register entries, contracts and tests. Check for an existing dataset, adapter, normalized field or scenario assumption.
2. **Search official sources.** Start with [NASA Open APIs](https://api.nasa.gov/) where the subject fits. For component, station and launch data, continue through official NASA program and mission pages, NASA technical reports and standards, and NASA/JPL archives. Search for the mission, component model, test condition or report number rather than the general topic alone. Open the actual record, its field definitions or the relevant report table. Search snippets and AI summaries can guide discovery.
3. **Confirm who produced the evidence.** Classify it as NASA or NASA/JPL-produced evidence, external data distributed by NASA, or unverified/external. Preserve the credited producer and original mission or test. Use official NASA evidence for new scientific inputs. Treat a republished vendor value or external feed as a reference lead and look for a NASA-produced measurement, analysis, or alternative. If none is available, record the gap and label any scenario value as an assumption. Check applicable attribution and redistribution terms.
4. **Read a representative slice.** Check variants, missing values, ranges, revisions, dates, method and applicability. For PDF tables, verify row and column labels, footnotes and units against the original page. For telemetry, check flags, gaps, cadence, modes and time basis. For a model, record the version, domain and inputs. Preserve the raw reference or a permitted sample so another person can reproduce the interpretation.

### 21.2 Classify and describe each fact by meaning

Pick a semantic class first: **vehicle or component specification**, **interface**, **flight or lab measurement**, **trajectory state**, **event**, **environment model**, **fault/service case**, **standard or requirement**, or **derived result**. Store the following information when it applies:

| Information | What to capture |
|---|---|
| Entity and identity | Stable official ID when available, name, type, operator, mission, subsystem and specific model or variant. Use qualified IDs so unrelated catalogs cannot collide. |
| Quantity and value | Meaning, original value, original unit, normalized value and unit if conversion is justified, valid range, and definition. Preserve distinctions such as maximum versus nominal, per thruster versus per stage, and operating versus survival limits. |
| Scope and time | Mission phase, configuration, source version, observation or effective time, and retrieval date. For trajectories use epoch, time scale, center and reference frame. |
| Evidence class | Measured, estimated, modeled, predicted, planned, manufacturer specification, engineering requirement, or derived. Separately record test maturity as ground test, flight demonstration, operational heritage, or unknown, with the applicable configuration. |
| Uncertainty and quality | Published bounds, confidence or quality flags. Keep reported zero, missing, not applicable and invalid separate. Do not infer missing values from field names or unrelated vehicles. |
| Provenance and assumptions | Official source URL and precise locator, credited producer, applicable terms, transformation and input IDs, and any explicit scenario assumption. |

### 21.3 Decide whether the new source can replace or extend existing data

| What changed | Agent action |
|---|---|
| Format, field name or unit only | Map it into the existing meaning through a documented adapter or conversion. Preserve raw values, test the conversion and keep current consumers compatible. |
| A known metric is genuinely comparable | Match entity, variant, phase, conditions and evidence class. Add the new source as corroboration or supersede a version with explicit evidence. Keep the older provenance and explain why the preferred value changed. |
| A similar-looking field has a different meaning | Keep separate facts. A tank's rated capacity, loaded mass and estimated remaining amount can coexist. A geometry product and an engineering limit are separate records. |
| A new metric is relevant and supported | Extend the model only where the approved feature consumes it. Use an optional field or a dedicated record when older data cannot supply it. Explain the default behavior and verify both old and new records. |
| A conflict or incomplete record remains | Keep the conflicting values with their conditions and sources. Mark the record incomplete or unresolved. Use an existing approved fallback if applicable and keep any illustrative assumption separately labeled. |
| The dataset is unrelated to the current feature | Register it as a research lead if it fits the project. Record a proposal for any future product change. |

Reconcile by semantics before joining. A value published today can describe a flight decades ago. A newer forecast does not replace a historical measurement. A NASA-hosted PDF and an API can repeat the same underlying observation. Count shared lineage once when weighing independent evidence.

### 21.4 Make the project change within the approved scope

- Trace the insight to a budget, compatibility check, mission condition or player-visible result. Record the baseline, conditions held fixed, change and expected consequence. Say whether the connection is observed, calculated or a design assumption.
- Update [the source register](source-register.md) and the smallest existing data mapping, fixture or calculation needed. Apply repo approval rules for app changes and architecture decisions. When approval is pending, provide a research proposal and a sample mapping for review.
- Verify one original input and one new input at the normal entry point. Where relevant, test a unit conversion, missing or conflicting field, unsupported mode, and the existing fallback for upstream failure. Check that source attribution and uncertainty reach the user-facing result when the feature presents scientific data.
- Report which sources were read, affected files and feature behavior, checks run and any remaining evidence gap. Follow [Team AI rules](../../AGENTS.md) for issue, board and remote changes.

## 22. Worked examples and insight handoff

### A. Two records called fuel are different quantities

NASA's Dawn page gives about **425 kg of xenon at launch** for ion propulsion and about **45.6 kg of hydrazine** associated with attitude control at launch. Keep two records with distinct propellant and subsystem IDs. A later source reporting tank volume or remaining mass belongs alongside them with its own quantity and time. Dawn also illustrates that the ability to point the spacecraft can run out while a different propulsion resource remains. [NASA Dawn spacecraft statistics](https://science.nasa.gov/mission/dawn/technology/spacecraft/)

This example shows the information to preserve. Map it to the project's approved data contract.

```yaml
record_class: spacecraft_specification
entity: NASA Dawn
subsystem: ion propulsion
material: xenon
material_role: reaction_mass
quantity: loaded_propellant_mass
phase: at_launch
value: 425
unit: kg
evidence: published_mission_statistic
source:
  producer: NASA mission team
  url: https://science.nasa.gov/mission/dawn/technology/spacecraft/
  locator: "Spacecraft Statistics / Propellant at launch"
```

### B. Two sources refer to the same asteroid for different reasons

JPL's Small-Body Database describes the object and its orbit solution. Close-Approach Data describes an encounter with a specific body at a particular time. Link by the object's designation and retain both records. Keep the nominal distance and uncertainty distinct. A close approach to Earth cannot be converted into a collision probability for the player's craft without the craft's own trajectory and a suitable encounter model. [NASA/JPL Small-Body Database](https://ssd-api.jpl.nasa.gov/doc/sbdb.html) · [NASA/JPL Close-Approach Data](https://ssd-api.jpl.nasa.gov/doc/cad.html)

### C. A mission announcement and a flight result describe different evidence

For RRM3, register long-duration methane storage and robotic tool and hose operations as demonstrated capabilities under their documented conditions. Keep planned cryogenic transfer as an objective with an outcome indicating it was prevented. A workshop could use the demonstration as evidence for an inspection or connection operation. A generic refueling capability remains a separate assumption until supported for the compatible hardware and fluid. [NASA RRM3 flight update](https://www.nasa.gov/missions/station/nasas-refueling-mission-completes-second-set-of-robotic-tool-operations-in-space/) · [NASA ISAM technical report](https://ntrs.nasa.gov/citations/20250008988)

### D. A component rating changes the upgrade comparison

Suppose a new NASA reference provides an engine's vacuum thrust and the project has a sea-level thrust value for the same engine. Keep the two operating conditions and apply each only where the model needs it. If a candidate thruster raises thrust but also raises vehicle mass or uses more electrical power, compute the acceleration or maneuver-time comparison under the same mission assumptions and surface the affected power and mass budgets. This example specifies the comparison method. Results require values for the actual candidates. [NASA Glenn ideal rocket equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/) · [NASA In-Space Propulsion](https://www.nasa.gov/smallsat-institute/sst-soa/in-space_propulsion/)

### Paste-ready handoff for a new finding

| Prompt | Fill in |
|---|---|
| What question does it answer? | Feature or decision, entity, mission phase |
| Where did it come from? | Official link, report section/table or dataset identifier, credited producer, version/date, attribution |
| What is actually stated? | Quantity, value, units, range, configuration, conditions, evidence class |
| How does it compare with existing data? | Same meaning, conditional variant, new metric, conflict, or gap |
| What is the insight? | Baseline → change → system effect → mission outcome, with assumptions and uncertainty |
| What should change? | Source register entry, approved mapping/calculation/document update or proposal, and compatibility with existing records |
| How was it checked? | Examples inspected, expected results and unresolved questions |


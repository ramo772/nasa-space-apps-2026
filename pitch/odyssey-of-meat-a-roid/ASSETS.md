# Scene assets

Replace a file with the same name, or change the path in `CONFIG.assets` inside `index.html`. Keep frames 16:9 except the team portraits, which can be square. Do not bake in captions, black bars, or a white screenshot edge.

The background score is not a file. After Start, `index.html` synthesizes a bow-string at the wake-up, then an original comedy bed and effects. Do not add music from another film.

The inventor is the human on the right of `assets/reference/ref-crop.png`: wild dark hair, long face, prominent nose, huge eyes, white lab coat. In that group shot, the dark shapes on his cheek are another creature’s fingers. Keep his jaw clean in new poses.

| File | Framing and pose | Used |
|---|---|---|
| `assets/face-asleep.jpg` | Extreme close-up, both eyes closed, coat collar visible, pink-purple light. | 0–4s |
| `assets/face-one.jpg` | Same close-up, one eye open, the other squinting. | ~1–2s |
| `assets/face-awake.jpg` | Same close-up, both eyes wide, small surprised mouth. | ~3–4s |
| `assets/world-wide.jpg` | Wide alien plain. Inventor small on the right, coat and hair readable. Giant planets overhead. | 4–8s, and dim behind the console |
| `assets/look-camera.jpg` | Medium close-up, he stares into the lens. Alien world soft behind him. | 8–11s, and the co-op reaction |
| `assets/device.jpg` | He crouches over a battered handheld with a cyan screen. Full plain behind him. | 11–15s |
| `assets/confident.jpg` | Pointing up with a small proud smile, crumpled rocket-and-house sketch in the other hand. | 15–20s, and the co-op grin |
| `assets/fail-face.jpg` | Comic close-up after a harmless miss. Dust puff, huge eyes, no injury. | 32–36s |
| `assets/capable.jpg` | Calmer, coat sleeves rolled, holding an abstract cyan map. Open sky on the left for titles. | 45–57s |
| `assets/workbench.jpg` | Indoor round lab. Inventor on the right with a pencil. Central console, monitor walls, cables, pink doorway. Quieter floor on the left for the milestone cards. | 57–70s |
| `assets/launch.jpg` | Beside a small homemade flyer with a glass cockpit, short wings, and a roof dome, looking up toward a bright star. | 69–73s |
| `assets/alien-world.png` | Environment plate without the inventor. Spare background. | Not required on screen |
| `assets/narration.mp3` | Optional Egyptian Arabic voice-over, about 85 seconds. | After Start |
| `assets/team-01.jpg` … `team-06.jpg` | Real portraits. Not generated. | 73–85s |

`assets/reference/ref-crop.png`, `ref-face.png`, and `inventor-canonical.jpg` are identity references only. The film does not display the group photo.

Paths, captions, and timings live in the `CONFIG` object at the top of the script in `index.html`.

## Video clips

Character scenes look for local clips in `MEDIA` inside `index.html`. Each entry has `src`, `sceneStart` (master-clock seconds), `duration` (how long it stays on the timeline), and `inPoint` (where to start inside the file). Captions and graphics stay in HTML on top of the video. If a file is missing or will not play, the still plate for that scene remains. A moving still is only a camera move, not a facial or body performance.

Checked 2026-11-04: none of these files are in the folder.

| File | Scene start | Timeline duration | Source in-point | Plays under |
|---|---|---|---|---|
| `assets/clips/wake.mp4` | 0s | 11s | 0s | Waking up, through the wide reveal. Captions stay editable. |
| `assets/clips/plan.mp4` | 11s | 9s | 0s | The star map and the mission plan. |
| `assets/clips/launch.mp4` | 57s | 16s | 0s | Preparing the craft and the launch, through 73s. |

To connect a clip, export a 16:9 file with no baked-in captions, put it at the path above, and reload. To trim the head of a longer file, raise that entry's `inPoint`. Only the clip whose window contains the master time is allowed to play. Pause, seek, and replay move that clip from the master clock.

`assets/narration.mp3` is still optional. `assets/team-01.jpg` through `assets/team-06.jpg` are the six credit portraits. Those portrait files are not in the folder yet. Names in `TEAM` are the six people named in the 2026-11-01 meeting notes. Project titles are not assigned in the repo, so the title line reads "Title pending" until the team fills it.

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
| `assets/confident.jpg` | Excessive confidence, pointing up, crumpled rocket-and-house sketch in the other hand. | 15–20s, and the co-op grin |
| `assets/fail-face.jpg` | Comic close-up after a harmless miss. Dust puff, huge eyes, no injury. | 32–36s |
| `assets/capable.jpg` | Calmer, coat sleeves rolled, holding an abstract cyan map. Open sky on the left for titles. | 45–57s |
| `assets/workbench.jpg` | At the bench on the right, pencil in hand, small lander and blank-looking plans. Open valley on the left. | 57–70s |
| `assets/launch.jpg` | Beside the little lander, looking up toward a bright star. | 69–73s |
| `assets/alien-world.png` | Environment plate without the inventor. Spare background. | Not required on screen |
| `assets/narration.mp3` | Optional Egyptian Arabic voice-over, about 85 seconds. | After Start |
| `assets/team-01.jpg` … `team-06.jpg` | Real portraits. Not generated. | 73–85s |

`assets/reference/ref-crop.png`, `ref-face.png`, and `inventor-canonical.jpg` are identity references only. The film does not display the group photo.

Paths, captions, and timings live in the `CONFIG` object at the top of the script in `index.html`.

const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const match = html.match(/<script>([\s\S]*)<\/script>/);
if (!match) throw new Error("Inline script missing");
new Function(match[1]);

const checks = {
  "JavaScript syntax": true,
  "85-second master duration": /duration:\s*85/.test(html),
  "Six exact scene sections": (html.match(/<section class="scene"/g) || []).length === 6,
  "Storyboard boundaries": [
    '{id:"s1",start:0,end:11}',
    '{id:"s2",start:11,end:20}',
    '{id:"s3",start:20,end:45}',
    '{id:"s4",start:45,end:57}',
    '{id:"s5",start:57,end:73}',
    '{id:"s6",start:73,end:85}'
  ].every(token => html.includes(token)),
  "Six editable team slots": (html.match(/name:"MEMBER/g) || []).length === 6,
  "All seven controls": ["startBtn","playBtn","replayBtn","muteBtn","recordBtn","seek","fullBtn"]
    .every(id => html.includes('id="' + id + '"')),
  "Concept simulation disclaimer": html.includes("ILLUSTRATIVE • NOT ORBITAL PHYSICS"),
  "No NASA logo reference": !/nasa[^<]{0,20}(logo|endorsement)/i.test(html.replace("No NASA logo or endorsement claim is used.",""))
};

const assets = [
  "assets/alien-world.png",
  "assets/inventor-panic.png",
  "assets/inventor-confident.png",
  "assets/visual-reference.png"
];
checks["All included assets exist"] = assets.every(file => fs.existsSync(path.join(__dirname, file)));

let failed = 0;
for (const [name, ok] of Object.entries(checks)) {
  console.log((ok ? "PASS" : "FAIL") + "  " + name);
  if (!ok) failed++;
}
console.log("HTML bytes:", Buffer.byteLength(html));
if (failed) process.exit(1);

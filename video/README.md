# Chat Ships It — demo video

Narrated HyperFrames + Kokoro demo (~68s).

## Rebuild

```bash
cd video
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
# regenerate VO if script.json changed (see generate steps in repo history)
npx --yes hyperframes@0.8.60 render . -o renders/chat-ships-it-demo.mp4
```

Output: `renders/chat-ships-it-demo.mp4`

## v1.1.0 screen-recording demo

1. Record live app clips: `node record-demo.mjs` (Playwright → `assets/screen/*.webm`)
2. Convert/pad: ffmpeg to 1920×1080 mp4 (`01-landing-demo-pad.mp4` …)
3. Generate VO: Kokoro via `script-v2.json` → `assets/vo-v2/`
4. Render: `npx hyperframes@0.8.60 render -o renders/chat-ships-it-demo-v2.mp4 --video-frame-format=png --quality=delivery`

Screen footage is ~75% of the ~89s runtime; title + outro cards bookend the walkthrough.

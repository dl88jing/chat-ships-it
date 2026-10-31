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

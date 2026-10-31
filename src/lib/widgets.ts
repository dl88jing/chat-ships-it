/** Pre-built sandboxed overlay widgets for DEMO_MODE and as Codex templates. */

export type WidgetTemplate = {
  id: string;
  name: string;
  match: RegExp;
  prompt: string;
  credit: string;
  plan: string[];
  diff: { kind: "add" | "del" | "ctx"; text: string }[];
  html: string;
};

const duckHtml = `<!doctype html><html><head><style>
html,body{margin:0;background:transparent;overflow:hidden;font-family:system-ui,sans-serif}
#d{position:fixed;right:24px;bottom:24px;width:120px;height:120px;display:flex;flex-direction:column;align-items:center;gap:6px;transition:transform .2s}
#d.quack{transform:scale(1.25) rotate(-8deg)}
.emoji{font-size:72px;filter:drop-shadow(0 8px 16px rgba(0,0,0,.45));cursor:default;user-select:none}
.tag{background:rgba(0,0,0,.65);color:#fff;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600}
</style></head><body>
<div id="d"><div class="emoji" id="e">🦆</div><div class="tag">by @viewer</div></div>
<script>
const api = {
  onChat(cb){ window.addEventListener('message', (ev)=>{ if(ev.data?.type==='chat') cb(ev.data); }); },
  onCheer(cb){ window.addEventListener('message', (ev)=>{ if(ev.data?.type==='cheer') cb(ev.data); }); },
};
const el = document.getElementById('d');
const e = document.getElementById('e');
function quack(){ el.classList.add('quack'); e.textContent='🐤'; setTimeout(()=>{el.classList.remove('quack'); e.textContent='🦆';}, 450); }
api.onChat((m)=>{ if(/\\bLUL\\b|😂|😆/i.test(m.text||'')) quack(); });
api.onCheer(()=>quack());
window.parent.postMessage({type:'widget-ready', id:'rubber-duck'}, '*');
</script></body></html>`;

const confettiHtml = `<!doctype html><html><head><style>
html,body{margin:0;background:transparent;overflow:hidden}
canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}
.tag{position:fixed;left:50%;bottom:40px;transform:translateX(-50%);background:rgba(0,0,0,.7);color:#fff;padding:8px 16px;border-radius:999px;font:600 13px system-ui}
</style></head><body>
<canvas id="c"></canvas><div class="tag">Raid confetti · by @viewer</div>
<script>
const c=document.getElementById('c'),x=c.getContext('2d');
function resize(){c.width=innerWidth;c.height=innerHeight} resize(); addEventListener('resize',resize);
let parts=[];
function burst(n=80){
  for(let i=0;i<n;i++) parts.push({x:c.width/2,y:c.height*0.3,vx:(Math.random()-0.5)*14,vy:Math.random()*-10-4,life:90+Math.random()*40,color:\`hsl(\${Math.random()*360},90%,60%)\`,s:4+Math.random()*6});
}
function tick(){
  x.clearRect(0,0,c.width,c.height);
  parts=parts.filter(p=>p.life>0);
  for(const p of parts){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.25; p.life--; x.fillStyle=p.color; x.fillRect(p.x,p.y,p.s,p.s*0.6); }
  requestAnimationFrame(tick);
}
tick();
window.addEventListener('message',(ev)=>{ if(ev.data?.type==='raid'||ev.data?.type==='cheer') burst(ev.data?.type==='raid'?120:60); });
burst(40);
window.parent.postMessage({type:'widget-ready', id:'raid-confetti'}, '*');
</script></body></html>`;

const comboHtml = `<!doctype html><html><head><style>
html,body{margin:0;background:transparent;overflow:hidden;font-family:system-ui}
#box{position:fixed;left:24px;bottom:24px;min-width:220px;background:linear-gradient(135deg,#9146FF,#5B21B6);color:#fff;border-radius:16px;padding:14px 18px;box-shadow:0 12px 40px rgba(145,70,255,.45);transform:translateY(120%);transition:transform .35s cubic-bezier(.2,.9,.2,1)}
#box.show{transform:translateY(0)}
.h{font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.8}
.n{font-size:28px;font-weight:800;margin-top:2px}
.s{font-size:13px;opacity:.9;margin-top:4px}
</style></head><body>
<div id="box"><div class="h">Emote combo</div><div class="n" id="n">0</div><div class="s" id="s">Say Kappa to start</div></div>
<script>
let combo=0, last=0, timer;
const box=document.getElementById('box'), n=document.getElementById('n'), s=document.getElementById('s');
function show(){ box.classList.add('show'); clearTimeout(timer); timer=setTimeout(()=>box.classList.remove('show'), 2500); }
window.addEventListener('message',(ev)=>{
  if(ev.data?.type!=='chat') return;
  const t=ev.data.text||'';
  if(/Kappa|PogChamp|KEKW|LUL/i.test(t)){
    const now=Date.now();
    combo = (now-last<4000) ? combo+1 : 1;
    last=now; n.textContent=combo+'x'; s.textContent=combo>=5?'ON FIRE 🔥':combo>=3?'Nice!':'Keep going'; show();
  }
});
window.parent.postMessage({type:'widget-ready', id:'emote-combo'}, '*');
</script></body></html>`;

const tickerBoostHtml = `<!doctype html><html><head><style>
html,body{margin:0;background:transparent;overflow:hidden;font-family:system-ui}
#t{position:fixed;top:18px;left:50%;transform:translateX(-50%);background:rgba(15,15,20,.85);border:1px solid rgba(145,70,255,.5);color:#fff;padding:10px 22px;border-radius:999px;font-weight:700;font-size:15px;display:flex;gap:10px;align-items:center;opacity:0;transition:opacity .3s}
#t.on{opacity:1}
.dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 12px #22c55e}
</style></head><body>
<div id="t"><span class="dot"></span><span id="m">Listening for hype…</span></div>
<script>
const t=document.getElementById('t'), m=document.getElementById('m');
let count=0;
window.addEventListener('message',(ev)=>{
  if(ev.data?.type==='chat' && /HYPE|LET'?S GO|POG/i.test(ev.data.text||'')){
    count++; m.textContent='Hype x'+count+' — '+ (ev.data.user||'chat'); t.classList.add('on');
    setTimeout(()=>t.classList.remove('on'), 2200);
  }
});
window.parent.postMessage({type:'widget-ready', id:'hype-pill'}, '*');
</script></body></html>`;

export const TEMPLATES: WidgetTemplate[] = [
  {
    id: "rubber-duck",
    name: "Rubber Duck",
    match: /duck|quack|LUL/i,
    prompt: "add a rubber duck that quacks every time someone says LUL",
    credit: "viewer",
    plan: [
      "Parse request → overlay widget (canvas/DOM, no network)",
      "Scaffold onChat handler + quack animation",
      "Wire LUL / laugh emoji trigger",
      "Validate sandbox size < 8KB",
      "Headless render smoke test",
    ],
    diff: [
      { kind: "ctx", text: "// widget: rubber-duck" },
      { kind: "add", text: "+ function quack() { el.classList.add('quack') }" },
      { kind: "add", text: "+ api.onChat(m => /\\\\bLUL\\\\b/i.test(m.text) && quack())" },
      { kind: "add", text: "+ credit: Feature by @viewer" },
    ],
    html: duckHtml,
  },
  {
    id: "raid-confetti",
    name: "Raid Confetti",
    match: /raid|confetti|celebrate/i,
    prompt: "confetti burst whenever we get raided or cheered",
    credit: "viewer",
    plan: [
      "Map EventSub channel.raid + channel.cheer → widget bus",
      "Particle system with no external assets",
      "Budget check: ≤ 120 particles, 30s kill switch",
      "Sandbox CSP: block all network",
      "Smoke test raid + cheer messages",
    ],
    diff: [
      { kind: "add", text: "+ function burst(n=80){ /* particles */ }" },
      { kind: "add", text: "+ on message type===\"raid\" → burst(120)" },
      { kind: "add", text: "+ on message type===\"cheer\" → burst(60)" },
    ],
    html: confettiHtml,
  },
  {
    id: "emote-combo",
    name: "Emote Combo Meter",
    match: /combo|kappa|emote|meter/i,
    prompt: "emote combo meter that counts Kappa/Pog streaks",
    credit: "viewer",
    plan: [
      "Detect Kappa/PogChamp/KEKW/LUL in chat",
      "4s streak window + fire state at 5x",
      "Slide-in HUD card bottom-left",
      "Validate no document.cookie / fetch",
      "Pass Playwright headless paint test",
    ],
    diff: [
      { kind: "add", text: "+ let combo=0, last=0" },
      { kind: "add", text: "+ if (/Kappa|PogChamp/i.test(t)) combo++" },
      { kind: "add", text: "+ show() HUD with Nx multiplier" },
    ],
    html: comboHtml,
  },
  {
    id: "hype-pill",
    name: "Hype Pill",
    match: /hype|pill|banner/i,
    prompt: "a hype pill that pops when chat says HYPE or LETS GO",
    credit: "viewer",
    plan: [
      "Top-center pill with live counter",
      "Trigger on HYPE / LETS GO / POG",
      "Auto-hide after 2.2s",
      "Size + CSP validation",
      "Smoke test",
    ],
    diff: [
      { kind: "add", text: "+ count++ on HYPE|LETS GO|POG" },
      { kind: "add", text: "+ pill.classList.add('on')" },
    ],
    html: tickerBoostHtml,
  },
];

export function pickTemplate(prompt: string): WidgetTemplate {
  const hit = TEMPLATES.find((t) => t.match.test(prompt));
  return hit ?? TEMPLATES[0];
}

export function materializeWidget(
  template: WidgetTemplate,
  viewer: string,
  prompt: string,
): { id: string; name: string; html: string; credit: string; prompt: string } {
  const id = `${template.id}-${Date.now().toString(36)}`;
  const html = template.html
    .replaceAll("@viewer", `@${viewer}`)
    .replaceAll("by @viewer", `by @${viewer}`);
  return {
    id,
    name: template.name,
    html,
    credit: viewer,
    prompt,
  };
}

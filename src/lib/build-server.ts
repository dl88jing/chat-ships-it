import { pickTemplate, materializeWidget } from "./widgets";
import { validateWidgetHtml } from "./sandbox-validate";

export type BuildResult = {
  mode: "demo" | "openai";
  widget: ReturnType<typeof materializeWidget>;
  plan: string[];
  diff: { kind: "add" | "del" | "ctx"; text: string }[];
};

const SYSTEM = `You write tiny self-contained Twitch overlay widgets as a single HTML document.
Rules:
- Transparent background, no external network (no fetch, no XHR, no WebSocket, no <script src>)
- Listen for window postMessage events: {type:'chat',user,text}, {type:'cheer'}, {type:'raid'}
- Keep total HTML under 8KB
- Include a small credit tag "Feature by @VIEWER"
- Return ONLY the HTML document, no markdown`;

export async function buildWidget(prompt: string, viewer: string): Promise<BuildResult> {
  const template = pickTemplate(prompt);
  const apiKey = process.env.OPENAI_API_KEY;

  const demoResult = (): BuildResult => {
    const widget = materializeWidget(template, viewer, prompt);
    const validation = validateWidgetHtml(widget.html);
    if (!validation.ok) throw new Error(`Invalid demo widget: ${validation.errors.join(", ")}`);
    return { mode: "demo", widget, plan: template.plan, diff: template.diff };
  };

  if (!apiKey) {
    return demoResult();
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM.replace("@VIEWER", `@${viewer}`) },
          {
            role: "user",
            content: `Viewer @${viewer} requested: ${prompt}\n\nPrefer a playful overlay widget that reacts to chat.`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    let html = data.choices?.[0]?.message?.content?.trim() ?? "";
    html = html.replace(/^```html?\n?/i, "").replace(/```$/i, "").trim();
    if (!html.includes("<html") && !html.includes("<!doctype")) {
      throw new Error("invalid html");
    }
    const validation = validateWidgetHtml(html);
    if (!validation.ok) throw new Error(validation.errors.join(", "));
    return {
      mode: "openai",
      widget: {
        id: `ai-${Date.now().toString(36)}`,
        name: "AI Widget",
        html: html.replaceAll("@VIEWER", `@${viewer}`),
        credit: viewer,
        prompt,
      },
      plan: [
        "Moderation + prompt parse",
        "Codex/OpenAI generate sandboxed HTML",
        "Forbidden-API scan",
        "Size budget check",
        "Return bundle for hot-load",
      ],
      diff: [
        { kind: "add", text: "+ generated widget HTML via OpenAI (server-side)" },
        { kind: "add", text: "+ sandbox iframe allow-scripts only" },
      ],
    };
  } catch {
    return demoResult();
  }
}

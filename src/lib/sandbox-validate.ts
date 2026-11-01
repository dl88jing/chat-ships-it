/** Checks generated widget HTML against the no-network iframe contract. */
export function validateWidgetHtml(html: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const forbidden: [RegExp, string][] = [
    [/fetch\s*\(/i, "fetch("],
    [/XMLHttpRequest/i, "XMLHttpRequest"],
    [/WebSocket/i, "WebSocket"],
    [/document\s*\.\s*cookie/i, "document.cookie"],
    [/eval\s*\(/i, "eval("],
    [/new\s+Function\b/i, "new Function"],
    [/<script\b[^>]*\bsrc\s*=/i, "<script src="],
    [/import\s*\(/i, "import("],
    [/navigator\s*\.\s*sendBeacon/i, "navigator.sendBeacon"],
  ];
  for (const [pattern, label] of forbidden) {
    if (pattern.test(html)) errors.push(`Forbidden sandbox API: ${label}`);
  }
  if (html.length > 12_000) errors.push("Widget HTML exceeds 12,000 characters");
  return { ok: errors.length === 0, errors };
}

"use client";

import { useEffect, useRef } from "react";
import type { WidgetBundle } from "@/lib/types";

export function WidgetHost({ widgets }: { widgets: WidgetBundle[] }) {
  const active = widgets.filter((w) => w.active);
  const refs = useRef<Record<string, HTMLIFrameElement | null>>({});

  useEffect(() => {
    function onBus(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      Object.values(refs.current).forEach((frame) => {
        frame?.contentWindow?.postMessage(detail, "*");
      });
    }
    window.addEventListener("csi-bus", onBus);
    return () => window.removeEventListener("csi-bus", onBus);
  }, []);

  return (
    <>
      {active.map((w) => (
        <iframe
          key={w.id}
          ref={(el) => {
            refs.current[w.id] = el;
          }}
          title={w.name}
          srcDoc={w.html}
          sandbox="allow-scripts"
          className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-transparent"
          style={{ background: "transparent" }}
        />
      ))}
    </>
  );
}

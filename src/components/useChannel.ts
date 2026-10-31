"use client";

import { useSyncExternalStore } from "react";
import { getState, subscribe } from "@/lib/demo-store";

export function useChannel() {
  return useSyncExternalStore(subscribe, getState, getState);
}

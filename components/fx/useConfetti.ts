"use client";

import { useSyncExternalStore } from "react";

// Preferencia de confeti persistida en localStorage, vía store externo
// (sin setState-en-effect ni mismatch de hidratación).
const KEY = "prodolmo:confetti";
let cache: boolean | null = null;
const subs = new Set<() => void>();

function getSnapshot(): boolean {
  if (cache === null) {
    cache = typeof window !== "undefined" ? window.localStorage.getItem(KEY) !== "0" : true;
  }
  return cache;
}
function getServerSnapshot(): boolean {
  return true;
}
function subscribe(cb: () => void): () => void {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export function toggleConfetti(): void {
  const next = !getSnapshot();
  cache = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, next ? "1" : "0");
  subs.forEach((f) => f());
}

export function useConfetti(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

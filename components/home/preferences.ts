"use client";
import { useSyncExternalStore } from "react";
import { parsePreferences, type Preferences } from "@/lib/home/model";
const memory = new Map<string, string>();
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}
function read(key: string) {
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? "";
  } catch {
    return memory.get(key) ?? "";
  }
}
export function usePreferences(mode: "mock" | "live") {
  const key = `noah-home-v1:${mode}`;
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => "",
  );
  const preferences = parsePreferences(raw);
  function update(next: Preferences) {
    const value = JSON.stringify(next);
    memory.set(key, value);
    let durable = true;
    try {
      localStorage.setItem(key, value);
    } catch {
      durable = false;
    }
    listeners.forEach((callback) => callback());
    return durable;
  }
  return { preferences, update };
}

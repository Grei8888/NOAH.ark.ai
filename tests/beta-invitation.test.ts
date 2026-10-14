import { afterEach, describe, expect, it, vi } from "vitest";
import { forgetBetaInvitation, readBetaInvitation } from "@/lib/news/beta-invitation";

afterEach(() => vi.unstubAllGlobals());

function fakeBrowser(fragment: string) {
  const data = new Map<string, string>();
  const location = { pathname: "/", search: "?view=home", hash: fragment };
  const replaceState = vi.fn((_state: unknown, _title: string, path: string) => {
    if (path === "/?view=home") location.hash = "";
  });
  vi.stubGlobal("window", {
    location, history: { state: null, replaceState },
    sessionStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => { data.set(key, value); },
      removeItem: (key: string) => { data.delete(key); },
    },
  });
  return { data, location, replaceState };
}

describe("one-tap beta access link", () => {
  const code = "A".repeat(36);
  it("consumes a fragment and preserves tab-scoped access for the reading workspace", () => {
    const browser = fakeBrowser("#join=" + code);
    expect(readBetaInvitation()).toBe(code);
    expect(browser.location.hash).toBe("");
    expect(browser.replaceState).toHaveBeenCalledWith(null, "", "/?view=home");
    expect(readBetaInvitation()).toBe(code);
    forgetBetaInvitation();
    expect(readBetaInvitation()).toBe("");
  });
  it("rejects malformed and short links without caching them", () => {
    const browser = fakeBrowser("#join=short");
    expect(readBetaInvitation()).toBe("");
    expect(browser.location.hash).toBe("");
    expect(browser.data.size).toBe(0);
  });
  it("does not disturb unrelated hash navigation", () => {
    const browser = fakeBrowser("#articles");
    expect(readBetaInvitation()).toBe("");
    expect(browser.location.hash).toBe("#articles");
  });
  it("fails safely without browser storage", () => {
    vi.stubGlobal("window", {
      location: { hash: "#join=" + code, pathname: "/", search: "" },
      history: { state: null, replaceState: vi.fn() },
      sessionStorage: { setItem: () => { throw new Error("disabled"); } },
    });
    expect(readBetaInvitation()).toBe(code);
  });
});

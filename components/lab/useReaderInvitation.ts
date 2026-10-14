"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readBetaInvitation, rememberBetaInvitation, forgetBetaInvitation } from "@/lib/news/beta-invitation";

export type InvitationStatus = "empty" | "unverified" | "checking" | "verified" | "rejected" | "unavailable";
type InvitationState = { code: string; linked: boolean; status: InvitationStatus; message: string };
const empty: InvitationState = { code: "", linked: false, status: "empty", message: "" };
const rejectedMessage = "이 베타에서 초대코드를 인증하지 못했습니다. 발급받은 원본 코드나 새 초대 링크를 확인해 주세요.";

export function useReaderInvitation(enabled = true) {
  const [state, setState] = useState<InvitationState>(empty);
  const sequence = useRef(0);
  const active = useRef<AbortController | null>(null);
  const cancel = useCallback(() => {
    sequence.current++;
    active.current?.abort();
  }, []);

  const verify = useCallback(async (raw: string, linked = false) => {
    cancel();
    const version = sequence.current;
    const code = raw.trim();
    if (code.length < 32 || code.length > 256) {
      setState({ code, linked, status: "unverified", message: "발급받은 원본 초대코드를 확인해 주세요." });
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    setState({ code, linked, status: "checking", message: "" });
    try {
      const response = await fetch("/api/lab/reader/access", {
        method: "POST", headers: { "Content-Type": "application/json", "x-noah-lab-token": code },
        body: "{}", cache: "no-store", signal: controller.signal,
      });
      const data = await response.json() as { authenticated?: unknown };
      if (version !== sequence.current) return;
      if (response.ok && data.authenticated === true) {
        rememberBetaInvitation(code);
        setState({ code, linked, status: "verified", message: "AI 요청마다 서버에서 다시 확인합니다." });
      } else if (response.status === 401) {
        forgetBetaInvitation();
        setState({ code: "", linked: false, status: "rejected", message: rejectedMessage });
      } else {
        setState({ code, linked, status: "unavailable", message: "서버 인증을 확인하지 못했습니다. 이 베타의 연결 상태를 확인한 뒤 다시 시도해 주세요." });
      }
    } catch {
      if (version === sequence.current) setState({ code, linked, status: "unavailable", message: "서버 인증을 확인하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요." });
    } finally {
      window.clearTimeout(timeout);
    }
  }, [cancel]);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const code = readBetaInvitation();
    queueMicrotask(() => { if (mounted && code) void verify(code, true); });
    return () => { mounted = false; cancel(); };
  }, [verify, cancel, enabled]);

  function changeCode(code: string) {
    cancel();
    forgetBetaInvitation();
    setState({ code, linked: false, status: code ? "unverified" : "empty", message: "" });
  }
  function reset() {
    cancel();
    forgetBetaInvitation();
    setState(empty);
  }
  function reject() {
    cancel();
    forgetBetaInvitation();
    setState({ code: "", linked: false, status: "rejected", message: rejectedMessage });
  }
  return { ...state, verified: state.status === "verified", changeCode, reset, reject, verify: () => verify(state.code, state.linked) };
}

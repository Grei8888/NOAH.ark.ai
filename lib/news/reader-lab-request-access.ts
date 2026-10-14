import type { NextRequest } from "next/server";
import { readerLabConfigured, readerLabInviteId } from "@/lib/news/reader-lab-access";

type AccessResult =
  | { ok: true; inviteId: string }
  | { ok: false; status: number; code: string; error: string };

/** Same authoritative checks for the no-AI access check and every AI request. */
export function verifyReaderLabRequest(request: NextRequest): AccessResult {
  if (!readerLabConfigured()) return { ok: false, status: 404, code: "LAB_DISABLED", error: "독해 실험실이 비활성화되어 있습니다." };
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return { ok: false, status: 403, code: "ORIGIN_REJECTED", error: "요청 출처를 확인할 수 없습니다." };
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return { ok: false, status: 415, code: "INVALID_FORMAT", error: "요청 형식이 잘못됐습니다." };
  const inviteId = readerLabInviteId(request.headers.get("x-noah-lab-token"));
  if (!inviteId) return { ok: false, status: 401, code: "INVITE_REJECTED", error: "이 베타에서 초대코드를 인증하지 못했습니다. 발급받은 원본 코드나 새 초대 링크를 확인해 주세요." };
  return { ok: true, inviteId };
}

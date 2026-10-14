"use client";

import type { useReaderInvitation } from "./useReaderInvitation";

export function ReaderInvitationControl({ invitation, id, busy = false }: {
  invitation: ReturnType<typeof useReaderInvitation>;
  id: string;
  busy?: boolean;
}) {
  const { status, linked, code, message } = invitation;
  const title = status === "verified" ? "초대코드 서버 인증 완료" :
    status === "checking" ? (linked ? "초대 링크 감지 · 서버 인증 확인 중" : "초대코드 서버 인증 확인 중") :
    status === "rejected" ? "초대코드 인증 실패" :
    status === "unavailable" ? "서버 인증을 확인하지 못했습니다" : "서버 인증 전";
  return (
    <div className="readerInviteAccess">
      {status !== "empty" && (
        <div className={status === "verified" ? "newsAiInviteConnected" : "readerInviteStatus"}
          data-invitation-status={status} role={status === "rejected" || status === "unavailable" ? "alert" : "status"}>
          <strong>{title}</strong>
          <span>{message || (linked ? "링크의 코드를 읽었습니다. 서버 확인 전에는 인증된 상태가 아닙니다." : "코드 확인 후 AI에게 질문할 수 있습니다.")}</span>
        </div>
      )}
      {status !== "verified" && (
        <>
          <label className="newsAiLabel" htmlFor={id}>테스터 초대 코드 <small>발급받은 원본 코드를 입력해 주세요.</small></label>
          <input id={id} type="password" autoComplete="off" maxLength={256}
            value={code} disabled={busy} onChange={event => invitation.changeCode(event.target.value)} placeholder="개별 발급 코드" />
          <button type="button" className="readerInviteAction" disabled={busy || status === "checking" || code.trim().length < 32}
            onClick={() => void invitation.verify()}>초대코드 확인</button>
        </>
      )}
      {status !== "empty" && (
        <button type="button" className="readerInviteAction" disabled={busy} onClick={invitation.reset}>다른 초대코드 사용</button>
      )}
    </div>
  );
}

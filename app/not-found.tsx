import Link from "next/link";
export default function NotFound() {
  return (
    <main className="failurePage">
      <span className="railEyebrow">NOAH ARK</span>
      <h1>발행된 Event를 찾을 수 없습니다.</h1>
      <p>발행본에 포함된 Event인지 확인해주세요.</p>
      <Link className="primaryButton" href="/">
        Home으로
      </Link>
    </main>
  );
}

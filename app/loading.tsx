export default function Loading() {
  return (
    <main
      className="loadingPage"
      aria-busy="true"
      aria-label="발행본 불러오는 중"
    >
      <span>NOAH ARK</span>
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </main>
  );
}

import "./globals.css";
export const metadata = {
  title: "NOAH Housing Intelligence",
  description: "시장 · 공공보증 · 금융을 연결하는 주거사업 예비검토 워크벤치. HOME:LINK 수요 연계 준비 중.",
};
export default function RootLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}

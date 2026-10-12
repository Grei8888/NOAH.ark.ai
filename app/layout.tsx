import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOAH ARK",
  description: "경제를 이해하고 세상을 읽는 AI 뉴스 파트너 NOAH ARK. 현재 무료 공개 베타에서는 정부 공식 RSS 원문과 관심사 필터를 제공합니다. AI 독해 도우미는 준비 중입니다."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

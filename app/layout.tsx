import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOAH ARK",
  description: "Only What Matters. 정부 공식 RSS의 실제 공고와 보도자료 원문을 확인하는 NOAH ARK 무료 베타."
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

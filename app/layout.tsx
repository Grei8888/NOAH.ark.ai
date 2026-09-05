import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOAH Intelligence",
  description: "Only What Matters. 정보의 홍수에서 반드시 알아야 할 변화만 선별합니다."
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

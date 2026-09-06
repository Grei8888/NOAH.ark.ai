import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'), title: { default: 'NOAH Intelligence · Only What Matters.', template: '%s | NOAH' }, description: '정보의 홍수에서 반드시 알아야 할 변화만. Today’s Ark.', openGraph: { title: 'NOAH Intelligence', description: 'Only What Matters.', type: 'website' } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="ko"><body><a className="skip" href="#main">본문으로 이동</a><header className="site-header"><Link href="/" className="brand"><span className="mark" aria-hidden="true">N</span>NOAH<span className="brand-detail">INTELLIGENCE</span></Link><nav aria-label="주 메뉴"><Link href="/">Today’s Ark</Link><Link href="/#archive">지난 Ark</Link><Link href="/admin">관리자 ↗</Link></nav></header>{children}<footer><Link href="/" className="footer-brand">NOAH</Link><span>Only What Matters.</span><p>기사 전문을 재게시하지 않습니다. 요약과 해석을 구분하고 원문으로 연결합니다.</p><span>INTELLIGENCE, WITH CONTEXT.</span></footer></body></html>; }

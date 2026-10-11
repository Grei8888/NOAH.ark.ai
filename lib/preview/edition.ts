import { MOCK_EVENTS } from '@/lib/news/mock';
import type { Edition } from '@/lib/data';
import type { PublicEvent } from '@/types/domain';
import { koreaDate } from '@/lib/time/korea';
import { runtimeMode } from '@/lib/runtime-mode';

/**
 * Explicitly labelled synthetic preview for a protected Vercel PREVIEW deployment.
 * Does not connect to Neon, store profiles, publish real news, or consume paid AI.
 * Never active in production deployments, even if the flag is mistakenly configured.
 */
export function protectedPreviewDemoEnabled(): boolean {
  return process.env.VERCEL_ENV === 'preview' &&
    process.env.NOAH_PREVIEW_STATIC_DEMO === 'true' &&
    runtimeMode().isMock;
}

export function protectedPreviewEdition(now = new Date()): Edition {
  const publishedAt = now.toISOString();
  const items: PublicEvent[] = MOCK_EVENTS.filter(item => item.important).slice(0, 8).map((item, i) => ({
    id: `demo-preview-${i + 1}`,
    representativeTitle: `DEMO · ${item.title}`,
    primaryCategory: item.category,
    grade: 'A',
    importanceScore: 95 - i * 4,
    isMock: true,
    articleCount: 3,
    sourceCount: 3,
    officialSourceAvailable: false,
    firstSeenAt: publishedAt,
    lastSeenAt: publishedAt,
    analysis: {
      primaryCategory: item.category,
      secondaryCategories: [],
      tags: [],
      importance: {
        socialImportance: 12, policyImpact: 16, industryImpact: 12,
        novelty: 12, actionability: 8,
      },
      headlineSummary: `가상 사례: ${item.summary}`,
      keyPoints: ['화면 구성과 탐색 기능 검증을 위한 가상 자료입니다.'],
      whyItMatters: '가상의 변화를 바탕으로 NOAH ARK의 정보 구조를 검토합니다.',
      isOpportunity: false,
      opportunity: '',
      risk: '실제 공고와 기한이 아닙니다.',
      followUp: ['실제 뉴스는 공개 베타 검증 후 제공합니다.'],
      confidence: 0.5,
    },
    sources: Array.from({ length: 3 }, (_, j) => ({
      id: `demo-source-${i}-${j}`,
      title: `DEMO · ${item.title}`,
      url: `https://source${j}.example.com/mock/preview/${i}`,
      sourceName: ['가상 공공자료', '가상 언론사', '가상 지역뉴스'][j],
      sourceType: 'OTHER',
      description: '실제 기사가 아닌 디자인 검토용 출처입니다.',
      publishedAt,
    })),
  }));
  return {
    mode: 'mock',
    date: koreaDate(now),
    publishedAt,
    items,
  };
}

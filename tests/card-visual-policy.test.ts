import { describe, expect, it } from 'vitest';
import { classifyVisualTheme, isApprovedCardPhoto, resolveCardVisual, type ReviewedImage } from '@/lib/news/card-visual-policy';

const verifiedImage: ReviewedImage = {
  url: 'https://assets.example.org/image.jpg',
  alt: '검증된 공공자료 사진',
  rights: 'kogl1',
  attribution: '저작자 · 출처 명시',
  evidenceUrl: 'https://assets.example.org/rights',
  verified: true,
  commercialUsePermitted: true,
  modificationsPermitted: true,
};

describe('NOAH rights-safe card images', () => {
  it('never uses publisher images unless explicit license review has passed', () => {
    expect(isApprovedCardPhoto({ ...verifiedImage, verified: false })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, rights: 'unknown' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, rights: 'kogl2' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, rights: 'kogl3' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, rights: 'kogl4' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, modificationsPermitted: false })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, commercialUsePermitted: false })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, evidenceUrl: '' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, attribution: '' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, url: 'http://assets.example.org/image.jpg' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, url: 'javascript:alert(1)' })).toBe(false);
    expect(isApprovedCardPhoto({ ...verifiedImage, url: 'https://alice:pw@assets.example.org/image.jpg' })).toBe(false);
  });
  it('returns owned SVG covers for any missing/unreviewed image', () => {
    expect(resolveCardVisual('창업 지원사업 모집', 'notice')).toEqual({
      mode: 'noah-cover', theme: 'startup', label: 'STARTUP', rights: 'owned',
    });
    expect(resolveCardVisual('수출시장 확대', 'press', { ...verifiedImage, verified: false })).toEqual({
      mode: 'noah-cover', theme: 'export', label: 'GLOBAL', rights: 'owned',
    });
    expect(resolveCardVisual('일반 보도자료', 'press')).toEqual({
      mode: 'noah-cover', theme: 'announcement', label: 'BRIEF', rights: 'owned',
    });
  });
  it('does not perform AI classification to choose decorative themes', () => {
    expect(classifyVisualTheme('AI 연구개발 공고', 'notice')).toBe('technology');
    expect(classifyVisualTheme('정책자금 확대', 'press')).toBe('funding');
    expect(classifyVisualTheme('소상공인 지원', 'notice')).toBe('startup');
  });
  it('can accept a separately reviewed photo while retaining attribution metadata', () => {
    const photo = resolveCardVisual('뉴스 보도자료', 'press', verifiedImage);
    expect(photo.mode).toBe('approved-photo');
    if (photo.mode === 'approved-photo') {
      expect(photo.image.attribution).toBe(verifiedImage.attribution);
      expect(photo.rights).toBe('kogl1');
    }
  });
});

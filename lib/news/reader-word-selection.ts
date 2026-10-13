/**
 * Works only on NOAH-owned headline or short user-pasted reading notes.
 * This intentionally does NOT inspect or access publisher iframe DOM.
 */
export interface ReaderToken {
  text: string;
  word: boolean;
}
export function readerWordTokens(text: string): ReaderToken[] {
  const limited = text.slice(0, 500);
  if (!limited) return [];
  if (typeof Intl.Segmenter === "function") {
    return [...new Intl.Segmenter("ko", { granularity: "word" }).segment(limited)].map(part => ({
      text: part.segment,
      word: !!part.isWordLike && part.segment.trim().length > 0 && part.segment.length <= 50,
    }));
  }
  return limited.split(/(\s+)/).filter(Boolean).map(part => ({
    text: part,
    word: !/^\s+$/.test(part) && part.length <= 50,
  }));
}
export function termExplanationQuestion(term: string): string {
  const safe = term.trim().slice(0, 50);
  return `'${safe}'의 뜻을 경제·정책 입문자도 이해할 수 있도록 쉽게 설명해 줘. 기사 내용을 읽은 것처럼 단정하지 말고 짧은 예시도 알려줘.`;
}

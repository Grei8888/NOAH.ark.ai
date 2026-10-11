import type { NormalizedArticle } from '@/types/domain';
export function deduplicateArticles(articles: NormalizedArticle[], existing: NormalizedArticle[] = []) {
    const urls = new Map<string, string>();
    const titles = new Map<string, string>();
    for (const a of existing) {
        urls.set(a.canonicalUrl, a.duplicateOfId ?? a.id);
        titles.set(a.normalizedTitle, a.duplicateOfId ?? a.id);
    }
    const unique: NormalizedArticle[] = [];
    const duplicates: NormalizedArticle[] = [];
    for (const article of articles) {
        const duplicateOfId = urls.get(article.canonicalUrl) ?? titles.get(article.normalizedTitle);
        if (duplicateOfId && duplicateOfId !== article.id)
            duplicates.push({ ...article, duplicateOfId });
        else
            unique.push(article);
        urls.set(article.canonicalUrl, duplicateOfId ?? article.id);
        titles.set(article.normalizedTitle, duplicateOfId ?? article.id);
    }
    return { unique, duplicates };
}

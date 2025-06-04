import { CompanyURL } from '../types';

interface CompanySearchResult {
  url: string;
  title: string;
  content: string;
  searchedFor: string;
}

const isDevelopment = (): boolean => {
  return (import.meta as any).env?.DEV || process.env.NODE_ENV === 'development';
};

const getMockSearchResults = (companyUrls: CompanyURL[], query: string): CompanySearchResult[] => {
  const relevantUrls = findRelevantURLs(companyUrls, query);
  const mockResults: CompanySearchResult[] = [];
  
  relevantUrls.slice(0, 2).forEach(urlInfo => {
    let mockContent = '';
    
    // Generate mock content based on URL type
    if (urlInfo.url.includes('x.com') || urlInfo.url.includes('twitter.com')) {
      mockContent = '最近のツイート: Cor.incの最新プロジェクトについて投稿しました。AI技術を活用した新しいソリューションの開発を進めています。#AI #開発 #福岡';
    } else if (urlInfo.url.includes('github.com')) {
      mockContent = 'GitHub プロフィール: 福岡を拠点とするIT戦略コンサルティング企業Cor.incの代表。Python、React、Flutterを中心とした開発を行っています。';
    } else if (urlInfo.url.includes('zenn.dev')) {
      mockContent = 'Zenn記事: LT51週連続投稿に挑戦中のCloudiaです。最新の技術トレンドや開発ノウハウを福岡弁で発信しています。';
    } else if (urlInfo.url.includes('lit.link')) {
      mockContent = 'プロフィール: 音楽大学卒業 → 楽器メーカー営業 → メガベンチャー法人営業 → IT業界へ転身。独特な経歴で「技術と言語の架け橋」に挑戦。';
    } else {
      mockContent = `${urlInfo.title}に関連する情報が含まれています。開発環境ではモックデータを表示しています。`;
    }
    
    mockResults.push({
      url: urlInfo.url,
      title: `${urlInfo.title} (Mock Data)`,
      content: mockContent,
      searchedFor: query
    });
  });
  
  return mockResults;
};

export const searchCompanyURLs = async (
  companyUrls: CompanyURL[], 
  query: string
): Promise<CompanySearchResult[]> => {
  // In development mode, return mock data to avoid CORS issues
  if (isDevelopment()) {
    console.log('Development mode: Using mock company URL search results');
    return getMockSearchResults(companyUrls, query);
  }
  
  const results: CompanySearchResult[] = [];
  
  // Find relevant URLs for the query
  const relevantUrls = findRelevantURLs(companyUrls, query);
  
  // Limit to top 3 most relevant URLs to avoid too many requests
  const urlsToSearch = relevantUrls.slice(0, 3);
  
  for (const urlInfo of urlsToSearch) {
    try {
      const response = await fetch(urlInfo.url);
      if (response.ok) {
        const html = await response.text();
        
        // Extract meaningful content (basic HTML parsing)
        const content = extractContentFromHTML(html);
        
        results.push({
          url: urlInfo.url,
          title: urlInfo.title,
          content: content,
          searchedFor: query
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch ${urlInfo.url}:`, error);
      // Continue with other URLs even if one fails
    }
  }
  
  return results;
};

const findRelevantURLs = (companyUrls: CompanyURL[], query: string): CompanyURL[] => {
  const queryLower = query.toLowerCase();
  const relevantUrls: (CompanyURL & { relevanceScore: number })[] = [];
  
  companyUrls.forEach(urlInfo => {
    let relevanceScore = 0;
    
    // Check if query contains any keywords
    urlInfo.keywords.forEach(keyword => {
      if (queryLower.includes(keyword.toLowerCase())) {
        relevanceScore += 2;
      }
    });
    
    // Check title relevance
    if (queryLower.includes(urlInfo.title.toLowerCase())) {
      relevanceScore += 3;
    }
    
    // Category-based relevance
    if (queryLower.includes('sns') || queryLower.includes('social') || queryLower.includes('twitter') || queryLower.includes('投稿') || queryLower.includes('x')) {
      if (urlInfo.category === 'social') relevanceScore += 5;
    }
    if (queryLower.includes('profile') || queryLower.includes('プロフィール') || queryLower.includes('経歴') || queryLower.includes('github') || queryLower.includes('qiita')) {
      if (urlInfo.category === 'profile') relevanceScore += 5;
    }
    if (queryLower.includes('contact') || queryLower.includes('連絡') || queryLower.includes('お問い合わせ') || queryLower.includes('chat')) {
      if (urlInfo.category === 'contact') relevanceScore += 5;
    }
    if (queryLower.includes('website') || queryLower.includes('サイト') || queryLower.includes('ホームページ')) {
      if (urlInfo.category === 'website') relevanceScore += 5;
    }
    
    // CEO/Founder specific queries
    if (queryLower.includes('ceo') || queryLower.includes('代表') || queryLower.includes('terada') || queryLower.includes('寺田') || queryLower.includes('founder')) {
      if (urlInfo.keywords.some(k => k.includes('ceo') || k.includes('terada') || k.includes('代表'))) {
        relevanceScore += 4;
      }
    }
    
    // AI/Cloudia specific queries
    if (queryLower.includes('cloudia') || queryLower.includes('ai') || queryLower.includes('zenn') || queryLower.includes('tech blog')) {
      if (urlInfo.keywords.some(k => k.includes('cloudia') || k.includes('ai') || k.includes('zenn'))) {
        relevanceScore += 4;
      }
    }
    
    // Add if relevant
    if (relevanceScore > 1) {
      relevantUrls.push({ ...urlInfo, relevanceScore });
    }
  });
  
  // Sort by relevance score (descending)
  return relevantUrls.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

const extractContentFromHTML = (html: string): string => {
  // Remove script and style tags
  let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  content = content.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  content = content.replace(/&nbsp;/g, ' ');
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&quot;/g, '"');
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').trim();
  
  // Limit content length to avoid overwhelming the AI
  if (content.length > 2000) {
    content = content.substring(0, 2000) + '...';
  }
  
  return content;
};

export const formatCompanySearchResults = (results: CompanySearchResult[], language: string): string => {
  if (results.length === 0) {
    return '';
  }
  
  const sourcesTitle = language.toLowerCase().startsWith('ja') ? '会社関連情報源:' : 'Company-related sources:';
  
  let formatted = `\n\n${sourcesTitle}\n`;
  
  results.forEach((result, index) => {
    formatted += `${index + 1}. **${result.title}**: ${result.url}\n`;
    if (result.content && result.content.length > 50) {
      // Add a brief excerpt
      const excerpt = result.content.substring(0, 200) + (result.content.length > 200 ? '...' : '');
      formatted += `   Preview: ${excerpt}\n`;
    }
  });
  
  return formatted;
};
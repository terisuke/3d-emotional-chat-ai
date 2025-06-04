interface CompanyURL {
  url: string;
  title: string;
  category: 'social' | 'profile' | 'website' | 'contact' | 'product' | 'other';
  keywords: string[];
}

const categorizeURL = (url: string, context: string): CompanyURL['category'] => {
  const domain = new URL(url).hostname.toLowerCase();
  const contextLower = context.toLowerCase();
  
  // Social media platforms
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'social';
  if (domain.includes('github.com')) return 'profile';
  if (domain.includes('qiita.com')) return 'profile';
  if (domain.includes('zenn.dev')) return 'profile';
  if (domain.includes('note.com')) return 'profile';
  if (domain.includes('lit.link')) return 'profile';
  if (domain.includes('youtube.com')) return 'social';
  if (domain.includes('linkedin.com')) return 'social';
  if (domain.includes('facebook.com')) return 'social';
  if (domain.includes('instagram.com')) return 'social';
  
  // Contact/Communication
  if (domain.includes('ssgform.com') || contextLower.includes('contact') || contextLower.includes('お問い合わせ')) return 'contact';
  if (domain.includes('miibo.jp') || contextLower.includes('chat')) return 'contact';
  
  // Company website
  if (domain.includes('corweb.co.jp')) return 'website';
  
  // Default to other
  return 'other';
};

const extractKeywords = (url: string, context: string): string[] => {
  const keywords: string[] = [];
  const domain = new URL(url).hostname.toLowerCase();
  const contextLower = context.toLowerCase();
  
  // Add domain-based keywords
  if (domain.includes('twitter.com') || domain.includes('x.com')) {
    keywords.push('twitter', 'x', 'sns', 'social media', 'posts', 'tweets');
  }
  if (domain.includes('github.com')) {
    keywords.push('github', 'code', 'repository', 'programming', 'development', 'projects');
  }
  if (domain.includes('qiita.com')) {
    keywords.push('qiita', 'technical', 'articles', 'programming', 'tech blog');
  }
  if (domain.includes('zenn.dev')) {
    keywords.push('zenn', 'technical', 'articles', 'programming', 'tech blog', 'lt');
  }
  if (domain.includes('note.com')) {
    keywords.push('note', 'blog', 'articles', 'writing');
  }
  if (domain.includes('lit.link')) {
    keywords.push('profile', 'links', 'bio', 'personal');
  }
  if (domain.includes('youtube.com')) {
    keywords.push('youtube', 'video', 'channel', 'company introduction');
  }
  
  // Add context-based keywords
  if (contextLower.includes('ceo') || contextLower.includes('代表') || contextLower.includes('terada') || contextLower.includes('寺田')) {
    keywords.push('ceo', 'founder', 'terada', 'kousuke', '寺田', '康佑', 'representative');
  }
  if (contextLower.includes('cloudia') || contextLower.includes('ai')) {
    keywords.push('cloudia', 'ai', 'ambassador', 'アンバサダー');
  }
  if (contextLower.includes('contact') || contextLower.includes('お問い合わせ')) {
    keywords.push('contact', 'inquiry', 'お問い合わせ', 'support');
  }
  if (contextLower.includes('chat') || contextLower.includes('miibo')) {
    keywords.push('chat', 'ai chat', 'cloudia chat', 'customer service');
  }
  
  return keywords;
};

export const extractCompanyURLs = (markdownContent: string): CompanyURL[] => {
  const urls: CompanyURL[] = [];
  
  // Regex to match URLs in markdown
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  const lines = markdownContent.split('\n');
  
  lines.forEach(line => {
    const matches = line.match(urlRegex);
    if (matches) {
      matches.forEach(url => {
        try {
          // Clean up URL (remove trailing punctuation)
          const cleanUrl = url.replace(/[.,;:!?]+$/, '');
          
          // Extract title from the line context
          let title = '';
          if (line.includes('**') && line.includes('**:')) {
            const titleMatch = line.match(/\*\*([^*]+)\*\*:/);
            if (titleMatch) title = titleMatch[1];
          } else if (line.includes('-')) {
            const parts = line.split('-');
            if (parts.length > 1) {
              title = parts[0].trim().replace(/^[#*\s-]+/, '');
            }
          }
          
          // Fallback to domain name if no title found
          if (!title) {
            title = new URL(cleanUrl).hostname;
          }
          
          const category = categorizeURL(cleanUrl, line);
          const keywords = extractKeywords(cleanUrl, line);
          
          urls.push({
            url: cleanUrl,
            title: title,
            category: category,
            keywords: keywords
          });
        } catch (error) {
          console.warn('Failed to parse URL:', url, error);
        }
      });
    }
  });
  
  // Remove duplicates
  const uniqueUrls = urls.filter((url, index, self) => 
    index === self.findIndex(u => u.url === url.url)
  );
  
  return uniqueUrls;
};

export const findRelevantURLs = (companyUrls: CompanyURL[], query: string): CompanyURL[] => {
  const queryLower = query.toLowerCase();
  const relevantUrls: CompanyURL[] = [];
  
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
    if (queryLower.includes('sns') || queryLower.includes('social') || queryLower.includes('twitter') || queryLower.includes('投稿')) {
      if (urlInfo.category === 'social') relevanceScore += 5;
    }
    if (queryLower.includes('profile') || queryLower.includes('プロフィール') || queryLower.includes('経歴')) {
      if (urlInfo.category === 'profile') relevanceScore += 5;
    }
    if (queryLower.includes('contact') || queryLower.includes('連絡') || queryLower.includes('お問い合わせ')) {
      if (urlInfo.category === 'contact') relevanceScore += 5;
    }
    if (queryLower.includes('website') || queryLower.includes('サイト') || queryLower.includes('ホームページ')) {
      if (urlInfo.category === 'website') relevanceScore += 5;
    }
    
    // Add if relevant
    if (relevanceScore > 1) {
      relevantUrls.push({ ...urlInfo, relevanceScore } as CompanyURL & { relevanceScore: number });
    }
  });
  
  // Sort by relevance score (descending)
  return relevantUrls.sort((a: any, b: any) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};
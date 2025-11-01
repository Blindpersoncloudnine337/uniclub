import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ArticleContent from '../components/ArticleContent';
import ChatBubble from '../components/chat/ChatBubble';
import InteractionButtons from '../components/InteractionButtons';
import BackNavigation from '../components/BackNavigation';
import OptimizedImage from '../components/OptimizedImage';

const ArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Get referrer from navigation state, default to /news
  const referrer = location.state?.referrer || '/news';

  // Fallback logo function for publishers without stored logos
  const getPublisherFallbackLogo = (source: string) => {
    if (!source) return `https://ui-avatars.com/api/?name=T&background=10b981&color=fff&size=32`;
    
    const normalizedSource = source.toLowerCase().replace(/\s+/g, '');
    
    // Known publisher fallback mappings
    const fallbackLogos: { [key: string]: string } = {
      'techcrunch': 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=64',
      'theverge': 'https://www.google.com/s2/favicons?domain=theverge.com&sz=64',
      'wired': 'https://www.google.com/s2/favicons?domain=wired.com&sz=64',
      'arstechnica': 'https://www.google.com/s2/favicons?domain=arstechnica.com&sz=64',
      'venturebeat': 'https://www.google.com/s2/favicons?domain=venturebeat.com&sz=64',
      'engadget': 'https://www.google.com/s2/favicons?domain=engadget.com&sz=64',
      'reuters': 'https://www.google.com/s2/favicons?domain=reuters.com&sz=64',
      'bbc': 'https://www.google.com/s2/favicons?domain=bbc.com&sz=64',
      'cnn': 'https://www.google.com/s2/favicons?domain=cnn.com&sz=64',
      'theguardian': 'https://www.google.com/s2/favicons?domain=theguardian.com&sz=64',
      'businessinsider': 'https://www.google.com/s2/favicons?domain=businessinsider.com&sz=64',
    };

    // For debugging: force TechCrunch to use Google S2 favicon
    if (normalizedSource === 'techcrunch') {
      console.log('🔧 DEBUG: Forcing TechCrunch to use Google S2 favicon');
      return 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=64';
    }

    return fallbackLogos[normalizedSource] || `https://ui-avatars.com/api/?name=${encodeURIComponent(source)}&background=10b981&color=fff&size=32`;
  };

  // Dynamic publisher logo system - relies on database-first approach
  // No hardcoded mapping needed - logos are fetched dynamically during curation

  // Fetch article data from API
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const response = await fetch(`/api/news/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const articleData = await response.json();
      
      // DEBUG: Log article engagement data
      console.log('📰 ArticlePage API Response:', {
        title: articleData.title?.substring(0, 30) + '...',
        engagement: articleData.engagement,
        publisherLogo: articleData.publisherLogo,
        source: articleData.source,
        publisherLogoType: typeof articleData.publisherLogo,
        publisherLogoLength: articleData.publisherLogo?.length,
        publisherLogoTruthy: !!articleData.publisherLogo
      });
      
      return articleData;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });



  // Format timestamp for display
  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return 'Recently';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };



  // Remove the hardcoded sample comments and use API data instead
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', 'article', id],
    queryFn: async () => {
      if (!id) return { comments: [] };
      const response = await fetch(`/api/comments/article/${id}`);
      if (!response.ok) return { comments: [] };
      return response.json();
    },
    enabled: !!id
  });

  const comments = commentsData?.comments || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-6 bg-white dark:bg-gray-900 min-h-screen">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="px-4 py-6 bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <h3 className="text-lg font-semibold mb-2">Article not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The article you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <BackNavigation 
            referrer={referrer}
            contentType="news"
            fallbackReferrer="/news"
            sticky={false}
            showBorder={false}
            className="inline-block"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Back Navigation Header */}
      <BackNavigation
        referrer={referrer}
        contentType="news"
        fallbackReferrer="/news"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Article Image */}
          {article.imageUrl && (
            <div className="relative h-36 md:h-72 lg:h-[24rem] xl:h-[27rem] overflow-hidden rounded-xl mb-6 shadow-lg">
              <OptimizedImage
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full rounded-xl"
                containerClassName="relative w-full h-full"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {article.isTrending && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                  🔥 Trending
                </div>
              )}
            </div>
          )}

          {/* Article Content */}
          <div className="space-y-4">
            {/* Categories */}
            {article.categories && (
              <div className="flex flex-wrap gap-2">
                {article.categories.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h1>
            
            {/* Article Info Container */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center min-w-0 gap-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {(() => {
                      console.log('🔍 Logo rendering debug:', {
                        hasPublisherLogo: !!article.publisherLogo,
                        publisherLogo: article.publisherLogo,
                        source: article.source,
                        fallbackLogo: getPublisherFallbackLogo(article.source)
                      });
                      return article.publisherLogo;
                    })() ? (
                      <OptimizedImage
                        src={article.publisherLogo}
                        alt={article.source || 'Publisher'}
                        className="w-full h-full object-cover rounded-full"
                        containerClassName="w-full h-full"
                        loading="eager"
                        onError={(e) => {
                          console.log('🚨 Publisher logo failed to load, using fallback:', {
                            publisherLogo: article.publisherLogo,
                            source: article.source
                          });
                          // Hide the failed image and show fallback
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Create fallback element
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex items-center justify-center bg-emerald-500 text-white text-xs font-bold rounded-full';
                          fallback.textContent = (article.source || 'T').charAt(0).toUpperCase();
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <OptimizedImage
                        src={getPublisherFallbackLogo(article.source)}
                        alt={article.source || 'Publisher'}
                        className="w-full h-full object-cover rounded-full"
                        containerClassName="w-full h-full"
                        loading="eager"
                        onError={(e) => {
                          console.log('🚨 Fallback logo also failed, using initial:', {
                            source: article.source
                          });
                          // Hide the failed image and show initial fallback
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Create fallback element
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex items-center justify-center bg-emerald-500 text-white text-xs font-bold rounded-full';
                          fallback.textContent = (article.source || 'T').charAt(0).toUpperCase();
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[160px] sm:max-w-xs">{article.source}</div>
                    {article.originalAuthor && article.originalAuthor !== article.source && article.originalAuthor !== 'Tech News Bot' && (
                      <div className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[160px] sm:max-w-xs">by {article.originalAuthor}</div>
                    )}
                  </div>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap ml-auto pl-2 mt-2 sm:mt-0">
                  {formatTimestamp(article.publishedAt)}
                </div>
              </div>
              
              {/* Engagement Section - Right after publisher section */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
                <InteractionButtons
                  contentType="News"
                  contentId={id || ''}
                  engagement={article.engagement}
                  onCommentClick={() => navigate(`/comments/news/${id}`, { 
                    state: { referrer: location.pathname }
                  })}
                  shareTitle={article.title}
                  shareType="news"
                  layout="horizontal"
                  size="md"
                  showSave={true}
                  showBorder={false}
                  noBg={true}
                />
              </div>
            </div>

            {/* Article Content */}
            <ArticleContent
              content={article.content}
              summary={article.summary}
              originalUrl={article.originalUrl}
            />

            {/* Chat Bubble */}
            <ChatBubble
              articleId={id || '683fa28628b70ed750ba90c0'}
              articleTitle={article?.title || 'Article Discussion'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;

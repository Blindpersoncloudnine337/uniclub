import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import NewsCard from '../components/cards/NewsCard';

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articlesToShow, setArticlesToShow] = useState(10);
  const categories = ['All', 'AI/ML', 'Startups', 'Tech Industry', 'Gadgets', 'IoT'];

  // Reset articles to show when category changes
  useEffect(() => {
    setArticlesToShow(10);
  }, [selectedCategory]);

  // Fetch news from API using React Query
  const { data: news = [], isLoading, error, refetch } = useQuery({
    queryKey: ['news', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      }
      // Fetch all articles (limit=20) for load more functionality
      params.set('limit', '20');
      
      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const newsData = await response.json();
      
      // DEBUG: Log API response
      console.log('📰 NewsPage API Response:', newsData.map((n: any) => ({
        title: n.title?.substring(0, 30) + '...',
        engagement: n.engagement,
        discussionCount: n.discussionCount
      })));
      
      return newsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return 'Recently';
    
    const date = new Date(timestamp);
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

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Latest News</h1>
        
        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-amber-300 dark:border-gray-700 rounded-2xl p-4 animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Failed to load news</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* News Feed */}
      {!isLoading && !error && (
        <>
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">No news articles found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedCategory === 'All' 
                    ? 'No articles are available right now.' 
                    : `No articles found in the ${selectedCategory} category.`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.slice(0, articlesToShow).map((article) => (
                article._id ? (
                  <NewsCard
                    key={article._id}
                    _id={article._id}
                    title={article.title}
                    excerpt={article.excerpt}
                    source={article.source}
                    originalAuthor={article.originalAuthor}
                    timestamp={formatTimestamp(article.publishedAt || article.timestamp)}
                    discussionCount={article.discussionCount}
                    imageUrl={article.imageUrl}
                    isFeatured={article.isFeatured}
                    isTrending={article.isTrending}
                    category={article.category}
                    engagement={article.engagement}
                    summary={article.summary}
                  />
                ) : null
              ))}
            </div>
          )}

          {/* Load More Button */}
          {news.length > articlesToShow && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-center">
                <button 
                  onClick={() => setArticlesToShow(news.length)}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-xl transition-all duration-200 font-medium text-sm group"
                >
                  Load More Articles
                </button>
              </div>
            </div>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;

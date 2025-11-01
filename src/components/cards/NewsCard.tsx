import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InteractionButtons from '../InteractionButtons';
import OptimizedImage from '../OptimizedImage';
import { Clock, TrendingUp } from 'lucide-react';

interface NewsCardProps {
  _id: string;
  title: string;
  excerpt?: string;
  source: string;
  originalAuthor?: string;
  timestamp: string;
  discussionCount?: number;
  imageUrl?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  category: string;
  engagement?: {
    likes?: number;
    saves?: number;
    shares?: number;
    comments?: number;
  };
  summary?: {
    quickSummary?: string;
  };
}

const NewsCard: React.FC<NewsCardProps> = ({
  _id,
  title,
  excerpt,
  source,
  originalAuthor,
  timestamp,
  discussionCount = 0,
  imageUrl,
  isFeatured = false,
  isTrending = false,
  category,
  engagement,
  summary
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // DEBUG: Log news engagement data
  console.log('📰 NewsCard DEBUG:', {
    _id,
    title: title.substring(0, 30) + '...',
    engagement,
    discussionCount
  });

  const handleArticleClick = () => {
    if (!_id) return;
    navigate(`/article/${_id}`, {
      state: { referrer: location.pathname }
    });
  };

  const handleCommentsClick = () => {
    navigate(`/comments/news/${_id}`, {
      state: { referrer: location.pathname }
    });
  };

  // Format timestamp consistently across all pages
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '1 day ago'; // Default fallback instead of "Recently"
    
    // If it's already formatted (like "1 day ago"), return as is
    if (timestamp.includes('ago') && !timestamp.includes('Recently')) {
      return timestamp;
    }
    
    // If it's a date string or "Recently", format it properly
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return '1 hour ago';
      if (diffInHours === 1) return '1 hour ago';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return '1 day ago';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return date.toLocaleDateString();
    } catch {
      return '1 day ago'; // Fallback to "1 day ago" instead of showing the raw timestamp
    }
  };

  return (
    <div className="group bg-white dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      {imageUrl && (
        <div className="relative h-48 overflow-hidden cursor-pointer flex-shrink-0" onClick={handleArticleClick}>
          <OptimizedImage
            src={imageUrl}
            alt={title}
            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
            containerClassName="relative w-full h-full"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Badges */}
          {isTrending && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              <TrendingUp className="w-3 h-3" />
              Trending
            </div>
          )}
          
          {isFeatured && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              Featured
            </div>
          )}
        </div>
      )}

      {/* Content Section - Flex grow to fill space */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Meta Row - Source, Author, Time */}
        <div className="flex items-center justify-between mb-3 text-sm flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
            <span className="font-semibold text-emerald-600 dark:text-emerald-500 flex-shrink-0">
              {source}
            </span>
            {originalAuthor && originalAuthor !== source && originalAuthor !== 'Tech News Bot' && (
              <>
                <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">by</span>
                <span className="text-gray-600 dark:text-gray-400 truncate min-w-0 max-w-[120px]">
                  {originalAuthor}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(timestamp)}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-3 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors line-clamp-2 flex-shrink-0"
          onClick={handleArticleClick}
        >
          {title}
        </h3>

        {/* Quick Summary - Flex grow to fill remaining space */}
        <div className="flex-grow mb-4">
          {summary?.quickSummary && (
            <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
              {summary.quickSummary}
            </p>
          )}
        </div>

        {/* Engagement Section - Always at bottom */}
        <div className="mt-auto pt-2">
          <InteractionButtons
            contentType="News"
            contentId={_id}
            engagement={engagement}
            commentCount={discussionCount}
            onCommentClick={handleCommentsClick}
            shareTitle={title}
            shareType="news"
            layout="horizontal"
            size="md"
            showSave={true}
            cardType="news"
          />
        </div>
      </div>
    </div>
  );
};

export default NewsCard;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, Download, Users, Clock, FileText, ArrowRight, Play, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FeaturedItem {
  _id: string;
  type: 'event' | 'article' | 'asset';
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  gradient: string;
  ctaText: string;
  badge?: string;
  metadata?: {
    date?: string;
    time?: string;
    attendees?: number;
    readTime?: string;
    fileSize?: string;
    downloads?: number;
    views?: number;
  };
}

const FeaturedContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch AI-curated featured content
  const { data: featuredContent = {}, isLoading } = useQuery({
    queryKey: ['featuredContent'],
    queryFn: async () => {
      const response = await fetch('/api/curation/featured');
      if (!response.ok) throw new Error('Failed to fetch featured content');
      const result = await response.json();
      return result.data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Transform AI-curated content to match FeaturedItem interface
  const featuredItems: FeaturedItem[] = [];

  // Add featured news (up to 2)
  if (featuredContent.news && Array.isArray(featuredContent.news)) {
    featuredContent.news.forEach((newsItem) => {
      if (newsItem) {
        featuredItems.push({
          _id: newsItem._id,
          type: 'article' as const,
          title: newsItem.title,
          subtitle: newsItem.source,
          description: newsItem.summary?.quickSummary || newsItem.excerpt || '',
          imageUrl: newsItem.imageUrl,
          gradient: 'from-emerald-600 to-green-600',
          ctaText: 'Read Article',
          badge: 'AI FEATURED',
          metadata: {
            readTime: '5 min read'
          }
        });
      }
    });
  }

  // Add featured events (up to 2, only upcoming)
  if (featuredContent.events && Array.isArray(featuredContent.events)) {
    featuredContent.events.forEach((eventItem) => {
      if (eventItem) {
        featuredItems.push({
          _id: eventItem._id,
          type: 'event' as const,
          title: eventItem.title,
          subtitle: eventItem.location?.address || 'Event',
          description: eventItem.description,
          imageUrl: eventItem.imageUrl,
          gradient: 'from-blue-600 to-cyan-600',
          ctaText: 'View Event',
          badge: 'AI FEATURED',
          metadata: {
            date: eventItem.startDate ? new Date(eventItem.startDate).toLocaleDateString() : '',
            time: eventItem.startDate ? new Date(eventItem.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            attendees: eventItem.engagement?.rsvpCount || 0
          }
        });
      }
    });
  }

  // Add featured resources (up to 2)
  if (featuredContent.resources && Array.isArray(featuredContent.resources)) {
    featuredContent.resources.forEach((resourceItem) => {
      if (resourceItem) {
        featuredItems.push({
          _id: resourceItem._id,
          type: 'asset' as const,
          title: resourceItem.title,
          subtitle: resourceItem.type || 'Learning Resource',
          description: resourceItem.description,
          imageUrl: resourceItem.thumbnailUrl,
          gradient: 'from-purple-600 to-pink-600',
          ctaText: resourceItem.type === 'PDF' ? 'Download PDF' :
                   resourceItem.type === 'Document' ? 'View Document' :
                   resourceItem.type === 'Tool' ? 'View Tool' :
                   'View Resource',
          badge: 'AI FEATURED',
          metadata: {
            fileSize: resourceItem.fileSize,
            downloads: resourceItem.downloadCount || 0,
            views: resourceItem.views || 0
          }
        });
      }
    });
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-white" />;
      case 'article':
        return <BookOpen className="w-5 h-5 text-white" />;
      case 'asset':
        return <Download className="w-5 h-5 text-white" />;
      default:
        return <FileText className="w-5 h-5 text-white" />;
    }
  };

  const handleItemClick = (item: FeaturedItem) => {
    switch (item.type) {
      case 'event':
        navigate(`/event/${item._id}`, {
          state: { referrer: location.pathname }
        });
        break;
      case 'article':
        navigate(`/article/${item._id}`, {
          state: { referrer: location.pathname }
        });
        break;
      case 'asset':
        navigate(`/resource/${item._id}`, {
          state: { referrer: location.pathname }
        });
        break;
    }
  };

  const handleCtaClick = (e: React.MouseEvent, item: FeaturedItem) => {
    e.stopPropagation();
    handleItemClick(item);
  };

  return (
    <section>
      {/* Header */}
      <div className="mb-5 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured</h2>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className="overflow-x-auto scrollbar-hide"
          style={{
            overscrollBehaviorX: 'contain',
            overscrollBehaviorY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex space-x-4 pb-4 pl-4 pr-4" style={{ width: 'max-content' }}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-72 h-[420px] flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      )}

      {/* No featured content state */}
      {!isLoading && featuredItems.length === 0 && (
        <div className="px-4">
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-300 dark:border-gray-700">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p className="text-sm">No featured content available right now.</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for featured articles and updates.</p>
          </div>
        </div>
      )}

      {/* Horizontal Scrolling Cards */}
      {!isLoading && featuredItems.length > 0 && (
        <div 
          className="overflow-x-auto scrollbar-hide"
          style={{ 
            overscrollBehaviorX: 'contain',
            overscrollBehaviorY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex space-x-4 pb-4 pl-4 pr-4" style={{ width: 'max-content' }}>
            {featuredItems.map((item, index) => (
              <div
                key={item._id}
                className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group animate-fade-up hover:scale-105 flex flex-col h-[420px]"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleItemClick(item)}
              >
                {/* Header Section - Fixed Height */}
                <div className={`h-32 relative overflow-hidden bg-gradient-to-r ${item.gradient} flex-shrink-0`}>
                  {/* Show cover image for all types if available */}
                  {item.imageUrl ? (
                    <>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient background if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} mix-blend-multiply`} />
                    </>
                  ) : (
                    // Fallback to gradient background if no image
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient}`} />
                  )}

                  {/* Badge */}
                  {item.badge && (
                    <div className={`absolute top-3 left-3 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg ${
                      item.type === 'article'
                        ? 'bg-emerald-800/95 dark:bg-gray-900/90 border border-emerald-700/50 dark:border-gray-700/20'
                        : item.type === 'event'
                        ? 'bg-blue-800/95 dark:bg-gray-900/90 border border-blue-700/50 dark:border-gray-700/20'
                        : 'bg-purple-800/95 dark:bg-gray-900/90 border border-purple-700/50 dark:border-gray-700/20'
                    }`}>
                      <span className="text-white dark:text-white text-xs font-bold">{item.badge}</span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`absolute bottom-3 left-3 w-12 h-12 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ${
                    item.type === 'article'
                      ? 'bg-emerald-800/95 dark:bg-gray-900/90 border border-emerald-700/50 dark:border-gray-700/20'
                      : item.type === 'event'
                      ? 'bg-blue-800/95 dark:bg-gray-900/90 border border-blue-700/50 dark:border-gray-700/20'
                      : 'bg-purple-800/95 dark:bg-gray-900/90 border border-purple-700/50 dark:border-gray-700/20'
                  }`}>
                    {getIcon(item.type)}
                  </div>
                </div>

                {/* Content Section - Compact Layout */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Title and Subtitle - Fixed Height */}
                  <div className="mb-2 flex-shrink-0">
                    <h3 className="text-gray-900 dark:text-white font-bold text-base leading-tight mb-1 line-clamp-2 overflow-hidden">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Description - 4 Line Limit with Truncation */}
                  <div className="flex-grow mb-2 min-h-0">
                    <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed line-clamp-4 overflow-hidden">
                      {item.description}
                    </p>
                  </div>

                  {/* Metadata - Fixed Height */}
                  <div className={`flex items-center flex-wrap gap-3 text-xs mb-3 flex-shrink-0 ${
                    item.type === 'article'
                      ? 'text-emerald-700 dark:text-gray-400'
                      : item.type === 'event'
                      ? 'text-blue-700 dark:text-gray-400'
                      : 'text-purple-700 dark:text-gray-400'
                  }`}>
                    {item.type === 'event' && item.metadata && (
                      <>
                        {item.metadata.date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            <span>{item.metadata.date}</span>
                          </div>
                        )}
                        {item.metadata.time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>{item.metadata.time}</span>
                          </div>
                        )}
                        {item.metadata.attendees !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-blue-600" />
                            <span>{item.metadata.attendees} attending</span>
                          </div>
                        )}
                      </>
                    )}
                    {item.type === 'article' && item.metadata && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{item.metadata.readTime}</span>
                      </div>
                    )}
                    {item.type === 'asset' && item.metadata && (
                      <>
                        {item.metadata.fileSize && (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-purple-600" />
                            <span>{item.metadata.fileSize}</span>
                          </div>
                        )}
                        {item.subtitle === 'Document' ? (
                          <div className="flex items-center space-x-1">
                            <Download className="w-3 h-3 text-purple-600" />
                            <span>{item.metadata.downloads} downloads</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3 text-purple-600" />
                            <span>{item.metadata.views} views</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* CTA Button - Positioned Higher */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => handleCtaClick(e, item)}
                      className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors font-medium ${
                        item.type === 'article'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : item.type === 'event'
                          ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      <span className="font-medium">{item.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedContent; 
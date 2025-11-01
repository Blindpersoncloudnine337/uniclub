import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import FeaturedContent from '../components/FeaturedContent';
import NewsCard from '../components/cards/NewsCard';
import EventCard from '../components/cards/EventCard';
import SocialCard from '../components/cards/SocialCard';
import ResourceCard from '../components/cards/ResourceCard';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Ensure scroll is always working on homepage mount
  useEffect(() => {
    console.log('🏠 Homepage mounted - ensuring scroll is enabled');
    console.log('🔍 Checking for scroll-blocking elements...');
    
    // Force restore any stuck scroll locks from modals/viewers
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.top = '';
    document.body.style.left = '';
    
    // Also check html element
    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    
    // Force focus to make scroll events work
    const timeout = setTimeout(() => {
      window.focus();
      document.body.focus();
      // ScrollToTop component handles navigation scroll
    }, 100);
    
    console.log('✅ Homepage scroll fully restored and focused');
    
    return () => clearTimeout(timeout);
  }, []);

  // Fetch top 6 trending news dynamically (based on likes)
  const { data: trendingNews = [], isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ['trendingNews'],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Failed to fetch news');
      const allNews = await response.json();
      
      console.log('🔍 DEBUG: News articles with likes:', allNews.map((n: any) => ({
        title: n.title?.substring(0, 50),
        likes: n.engagement?.likes || 0,
        views: n.engagement?.views || 0
      })));
      
      // Sort by likes (highest engagement) then by recency
      return allNews
        .sort((a: any, b: any) => {
          const aLikes = a.engagement?.likes || 0;
          const bLikes = b.engagement?.likes || 0;
          if (bLikes !== aLikes) return bLikes - aLikes; // Sort by likes descending
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(); // Then by recency
        })
        .slice(0, 6);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  // Fetch trending social posts
  const { data: trendingPosts = [], isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: async () => {
      // CRITICAL FIX: Fetch more posts to ensure we get all high-engagement posts
      const response = await fetch('/api/social/posts?limit=20');
      if (!response.ok) throw new Error('Failed to fetch social posts');
      const data = await response.json();
      const posts = data.posts || data;
      
      console.log('🔍 DEBUG: Total posts fetched:', posts.length);
      console.log('🔍 DEBUG: All posts with authors:', posts.map(p => ({
        author: p.author?.name,
        likes: p.likeCount || p.engagement?.likeCount || 0,
        content: p.content?.substring(0, 50)
      })));
      
      // Sort by likes only (most liked posts are trending)
      const sortedPosts = posts
        .filter((post: any) => {
          const hasAuthor = post && post.author;
          if (!hasAuthor) {
            console.log('🔍 DEBUG: Filtered out post without author:', post?._id);
          }
          return hasAuthor;
        })
        .sort((a: any, b: any) => {
          const aLikes = a.likeCount || a.engagement?.likeCount || 0;
          const bLikes = b.likeCount || b.engagement?.likeCount || 0;
          if (bLikes !== aLikes) return bLikes - aLikes; // Sort by likes descending
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Then by recency
        });
      
      console.log('🔍 DEBUG: Top posts after sorting by likes:', sortedPosts.slice(0, 5).map(p => ({
        author: p.author?.name,
        likes: p.likeCount || p.engagement?.likeCount || 0,
        content: p.content?.substring(0, 50)
      })));
      
      const finalPosts = sortedPosts
        .slice(0, 3)
        .map((post: any) => ({
          id: post._id,
          userName: post.author?.name || 'Unknown User',
          userAvatar: post.author?.profile?.avatar?.data || null,
          timestamp: new Date(post.createdAt).toLocaleString(),
          content: post.content,
          imageUrl: post.media?.[0]?.url || null,
        media: post.media || [],
          authorId: post.author?._id || '',
          currentUserId: currentUser?.id
        }));
      
      console.log('🏠 Homepage final social posts:', finalPosts.map(p => ({
        userName: p.userName,
        id: p.id
      })));
      
      return finalPosts;
    },
    staleTime: 0, // Force fresh data for trending balance fix
    gcTime: 0, // Don't cache at all (renamed in newer versions)  
    retry: 2
  });

  // Fetch upcoming events dynamically (sorted by likes)
  const { data: upcomingEvents = [], isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      const response = await fetch('/api/events?status=published');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      const events = data.events || data;
      
      console.log('🔍 DEBUG: Events with likes:', events.map((e: any) => ({
        title: e.title?.substring(0, 50),
        likes: e.engagement?.likes || 0,
        rsvpCount: e.engagement?.rsvpCount || 0
      })));
      
      // Sort by likes (highest engagement) then by upcoming date
      return events
        .sort((a: any, b: any) => {
          const aLikes = a.engagement?.likes || 0;
          const bLikes = b.engagement?.likes || 0;
          if (bLikes !== aLikes) return bLikes - aLikes; // Sort by likes descending
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime(); // Then by upcoming date
        })
        .slice(0, 3)
        .map((event: any) => ({
          id: event._id,
          title: event.title,
          date: new Date(event.startDate).toLocaleDateString(),
          time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: event.location?.room || event.location?.address || 'TBD',
          description: event.description,
          imageUrl: event.poster || event.posterUrl || event.imageUrl,
          category: event.category || event.eventType || 'General',
          eventType: event.eventType || 'Workshop',
          rsvpCount: event.rsvpCount || 0,
          // Include engagement stats from API response
          likeCount: event.likeCount || 0,
          shareCount: event.shareCount || 0,
          saveCount: event.saveCount || 0,
          commentCount: event.commentCount || 0
        }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  // Fetch top resources dynamically (sorted by downloads/views)
  const { data: featuredResources = [], isLoading: resourcesLoading, error: resourcesError } = useQuery({
    queryKey: ['featuredResources'],
    queryFn: async () => {
      const response = await fetch('/api/resources?status=approved');
      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const resources = data.resources || data;
      
      console.log('🔍 DEBUG: Resources with downloads/views:', resources.map((r: any) => ({
        title: r.title?.substring(0, 50),
        type: r.type,
        downloads: r.downloadCount || 0,
        views: r.views || 0
      })));
      
      // Sort by downloads (for documents) or views (for videos/tutorials/tools)
      return resources
        .filter((resource: any) => resource && resource.status === 'approved') // Only approved resources
        .sort((a: any, b: any) => {
          // For documents, prioritize downloads; for videos/tutorials/tools, prioritize views
          const aScore = a.type === 'Document' 
            ? (a.downloadCount || 0) 
            : (a.views || 0);
          const bScore = b.type === 'Document' 
            ? (b.downloadCount || 0) 
            : (b.views || 0);
          return bScore - aScore; // Sort by engagement score descending
        })
        .slice(0, 5)
        .map((resource: any, index: number) => ({
          id: resource._id,
          title: resource.title,
          type: resource.type,
          category: resource.category,
          description: resource.description,
          downloadCount: resource.downloadCount || 0,
          views: resource.views || 0,
          thumbnailUrl: resource.thumbnailUrl,
          fileSize: resource.fileSize,
          linkUrl: resource.linkUrl,
          fileUrl: resource.fileUrl,
          isApproved: resource.isApproved || true,
          author: resource.uploadedBy?.name || 'AI Club Team',
          tags: resource.tags || [],
          // Set reasonable defaults for missing fields
          estimatedTime: resource.type === 'Video' ? '30-45 min' : 
                       resource.type === 'Tutorial' ? '20-30 min' : '15-20 min',
          difficulty: resource.type === 'Document' ? 'Beginner' :
                     resource.type === 'Tutorial' ? 'Intermediate' : 'Beginner'
        }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  // Resources are already sorted and ranked from the API call
  const sortedResources = featuredResources;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Featured Content */}
          <FeaturedContent />

          {/* News Section - Improved Hierarchy */}
          <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest News</h2>
          </div>
          <button 
            onClick={() => navigate('/news')}
            className="text-emerald-600 dark:text-emerald-500 text-sm font-medium hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors px-3 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            See All
          </button>
        </div>
        {/* Trending News - Dynamically fetched */}
        {newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 animate-pulse shadow-sm">
                <div className="h-48 bg-gray-200 dark:bg-amber-800 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-amber-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-amber-800 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-amber-800 rounded w-3/5"></div>
              </div>
            ))}
          </div>
        ) : newsError ? (
          <div className="mb-4 text-red-500">Failed to load news.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingNews.map((news: any, idx: number) => (
              <NewsCard
                key={news._id}
                _id={news._id}
                title={news.title}
                excerpt={news.excerpt}
                source={news.source}
                originalAuthor={news.originalAuthor}
                timestamp={news.publishedAt}
                discussionCount={news.engagement?.comments || 0}
                imageUrl={news.imageUrl}
                isFeatured={idx === 0}
                isTrending={news.isTrending}
                category={news.categories?.[0] || 'Tech'}
                engagement={news.engagement}
                summary={news.summary}
              />
            ))}
          </div>
        )}
      </section>

          {/* Events Section */}
          <section className="py-6 bg-gradient-to-br from-transparent to-emerald-50/20 dark:to-emerald-900/5 rounded-2xl px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
          </div>
          <button 
            onClick={() => navigate('/events')}
            className="text-emerald-600 dark:text-emerald-500 text-sm font-medium hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors px-3 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            See All
          </button>
        </div>
        
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-[#00281B] border border-emerald-300 dark:border-green-800 rounded-2xl p-4 animate-pulse shadow-sm">
                <div className="h-4 bg-gray-200 dark:bg-green-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-green-800 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-green-800 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : eventsError ? (
          <div className="text-center py-8 text-red-500">Failed to load events.</div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-[#00281B] rounded-2xl border border-emerald-300 dark:border-green-800 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">No upcoming events scheduled</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Check back later for exciting new events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event, index) => (
              <EventCard key={index} {...event} isCompact allowAdaptiveImage={true} />
            ))}
          </div>
        )}
      </section>

      {/* Social Section */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trending Discussions</h2>
          </div>
          <button 
            onClick={() => navigate('/social')}
            className="text-emerald-600 dark:text-emerald-500 text-sm font-medium hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors px-3 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            See All
          </button>
        </div>
        
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
                             <div key={index} className="bg-white dark:bg-gray-950 border border-slate-300 dark:border-gray-700 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : postsError ? (
          <div className="text-center py-8 text-red-500">Failed to load social posts.</div>
        ) : trendingPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm">No trending discussions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
                         {trendingPosts.map((post) => (
               <SocialCard key={post.id} {...post} isCompact currentUserId={currentUser?.id} />
             ))}
          </div>
        )}
      </section>

      {/* Resources Section - Always show to display content or error */}
      <section className="pb-6">
        <div className="flex items-center justify-between mb-5 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popular Resources</h2>
          </div>
          <button 
            onClick={() => navigate('/resources')}
            className="text-emerald-600 dark:text-emerald-500 text-sm font-medium hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors px-3 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            See All
          </button>
        </div>
        
        {resourcesLoading ? (
          <div 
            className="overflow-x-auto scrollbar-hide"
            style={{ 
              overscrollBehaviorX: 'contain',
              overscrollBehaviorY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex space-x-4 pb-2 px-4" style={{ width: 'max-content' }}>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="w-60 h-64 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 animate-pulse flex flex-col">
                  {/* Header skeleton */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-5"></div>
                  </div>
                  {/* Title skeleton */}
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/5 mb-3"></div>
                  {/* Description skeleton */}
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/5 mb-3"></div>
                  {/* Author skeleton */}
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mb-3"></div>
                  {/* Stats skeleton */}
                  <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : resourcesError ? (
          <div className="px-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Failed to load resources</p>
              <p className="text-red-500 dark:text-red-500 text-xs mt-1">Please check if the backend is running</p>
              <button 
                onClick={() => navigate('/resources')}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                View All Resources
              </button>
            </div>
          </div>
        ) : featuredResources.length === 0 ? (
          <div className="px-4">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">No resources available</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Check back later for new learning materials</p>
            </div>
          </div>
        ) : (
          <div 
            className="overflow-x-auto scrollbar-hide"
            style={{ 
              overscrollBehaviorX: 'contain',
              overscrollBehaviorY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex space-x-4 pb-2 px-4" style={{ width: 'max-content' }}>
              {sortedResources.map((resource, index) => (
                <div key={resource.id || index} className="w-60 flex-shrink-0">
                  <ResourceCard {...resource} isSquare downloadCount={resource.downloadCount || 0} />
                </div>
              ))}
            </div>
          </div>
        )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

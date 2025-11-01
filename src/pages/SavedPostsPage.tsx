import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bookmark, Calendar, FileText, Users, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import NewsCard from '../components/cards/NewsCard';
import EventCard from '../components/cards/EventCard';
import ResourceCard from '../components/cards/ResourceCard';
import SocialCard from '../components/cards/SocialCard';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { usePopup } from '../context/PopupContext';
import api from '../lib/axios';

interface SavedContent {
  _id: string;
  title: string;
  excerpt?: string;
  content?: string;
  source?: string;
  originalAuthor?: string;
  timestamp: string;
  imageUrl?: string;
  category?: string;
  type?: string;
  location?: string | {
    type?: string;
    address?: string;
    room?: string;
    virtualLink?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  startDate?: string;
  endDate?: string;
  userName?: string;
  userAvatar?: string;
  author?: {
    _id?: string;
    name?: string;
    profile?: {
      avatar?: {
        data?: string;
      };
    };
  };
  media?: Array<{ url: string; type: string; filename?: string; size?: number }>;
  authorId?: string;
  likes?: number;
  views?: number;
  downloadCount?: number;
  discussionCount?: number;
  // Resource-specific fields
  description?: string;
  fileSize?: string;
  tags?: string[];
  isApproved?: boolean;
  thumbnailUrl?: string;
  uploadedBy?: {
    name?: string;
  };
  engagement?: {
    likes: number;
    saves: number;
    shares: number;
    comments: number;
  };
}

const SavedPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useUser();
  const { openUserProfile } = usePopup();
  
  // Get referrer from navigation state
  const referrer = location.state?.referrer;
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [savedContent, setSavedContent] = useState<{
    news: SavedContent[];
    events: SavedContent[];
    resources: SavedContent[];
    social: SavedContent[];
  }>({
    news: [],
    events: [],
    resources: [],
    social: []
  });

  const fetchSavedContent = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all saved content at once using the bulk API
      const response = await api.get('/api/engagement/user/saved?limit=100');
      
      if (response.data.success && response.data.content) {
        setSavedContent({
          news: response.data.content.news || [],
          events: response.data.content.events || [],
          resources: response.data.content.resources || [],
          social: response.data.content.social || []
        });
      }
    } catch (error) {
      console.error('Error fetching saved content:', error);
      // Fallback to individual API calls if bulk fails
      try {
        const [newsResponse, eventsResponse, resourcesResponse, socialResponse] = await Promise.all([
          api.get('/api/engagement/user/saved/News?limit=50'),
          api.get('/api/engagement/user/saved/Event?limit=50'),
          api.get('/api/engagement/user/saved/Resource?limit=50'),
          api.get('/api/engagement/user/saved/SocialPost?limit=50')
        ]);

        setSavedContent({
          news: newsResponse.data.content || [],
          events: eventsResponse.data.content || [],
          resources: resourcesResponse.data.content || [],
          social: socialResponse.data.content || []
        });
      } catch (fallbackError) {
        console.error('Error with fallback saved content fetch:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchSavedContent();
  }, [isAuthenticated, navigate, fetchSavedContent]);

  const getTotalSavedCount = () => {
    return savedContent.news.length + savedContent.events.length + 
           savedContent.resources.length + savedContent.social.length;
  };

  // Helper function to extract location string from location object
  const getLocationString = (location: any): string => {
    if (!location) return 'TBD';
    if (typeof location === 'string') return location;
    
    // If location is an object, extract the appropriate string
    if (typeof location === 'object') {
      try {
        if (location.type === 'virtual') {
          return location.virtualLink || 'Virtual Event';
        } else if (location.type === 'hybrid') {
          const parts = [];
          if (location.room) parts.push(location.room);
          if (location.address) parts.push(location.address);
          return parts.join(', ') || 'Hybrid Event';
        } else {
          // Physical event - combine room and address
          const parts = [];
          if (location.room) parts.push(location.room);
          if (location.address) parts.push(location.address);
          return parts.join(', ') || 'UT Dallas Campus';
        }
      } catch (error) {
        console.error('Error parsing location:', error);
        return 'TBD';
      }
    }
    
    return 'TBD';
  };

  // Helper function to format event date and time
  const getEventDateTime = (startDate?: string, endDate?: string) => {
    if (!startDate) return { date: '', time: '' };
    
    try {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;
      
      // Format date as "MMM DD, YYYY" with proper spacing
      const formattedDate = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      // Format time without breaking into multiple lines
      const startTime = start.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      const endTime = end 
        ? end.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        : '';
      
      const formattedTime = end ? `${startTime} - ${endTime}` : startTime;
      
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: '', time: '' };
    }
  };

  const renderContent = (contentType: 'news' | 'events' | 'resources' | 'social', items: SavedContent[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No saved {contentType}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Items you save will appear here for easy access later.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => {
          switch (contentType) {
            case 'news':
              return (
                <NewsCard
                  key={item._id}
                  _id={item._id}
                  title={item.title}
                  excerpt={item.excerpt || ''}
                  source={item.source || ''}
                  originalAuthor={item.originalAuthor}
                  timestamp={item.timestamp}
                  discussionCount={item.discussionCount || 0}
                  imageUrl={item.imageUrl}
                  category={item.category}
                  engagement={item.engagement}
                />
              );
            case 'events': {
              const { date, time } = getEventDateTime(item.startDate || item.timestamp, item.endDate);
              return (
                <EventCard
                  key={item._id}
                  id={item._id}
                  title={item.title}
                  description={item.description || item.excerpt || ''}
                  date={date}
                  time={time}
                  location={getLocationString(item.location)}
                  attendeeCount={item.discussionCount || 0}
                  rsvpCount={item.discussionCount || 0}
                  discussionCount={item.discussionCount || 0}
                  imageUrl={item.imageUrl}
                  category={item.category || 'General'}
                  eventType={item.type || 'Workshop'}
                  allowAdaptiveImage={true}
                />
              );
            }
            case 'resources': {
              // Determine difficulty based on type
              const difficulty = item.type === 'Document' ? 'Beginner' :
                               item.type === 'Tutorial' ? 'Intermediate' : 'Beginner';
              
              // Determine estimated time based on type
              const estimatedTime = item.type === 'Video' ? '30-45 min' : 
                                  item.type === 'Tutorial' ? '20-30 min' : '15-20 min';
              
              return (
                <ResourceCard
                  key={item._id}
                  id={item._id}
                  title={item.title}
                  type={item.type as any || 'Document'}
                  downloadCount={item.downloadCount || 0}
                  views={item.views || 0}
                  likes={item.likes || 0}
                  fileSize={item.fileSize}
                  isApproved={item.isApproved !== undefined ? item.isApproved : true}
                  thumbnailUrl={item.thumbnailUrl}
                  description={item.description}
                  tags={item.tags || []}
                  category={item.category}
                  estimatedTime={estimatedTime}
                  difficulty={difficulty}
                  author={item.uploadedBy?.name || 'AI Club Team'}
                />
              );
            }
            case 'social':
              return (
                <SocialCard
                  key={item._id}
                  id={item._id}
                  userName={item.author?.name || item.userName || 'Unknown User'}
                  userAvatar={item.author?.profile?.avatar?.data || item.userAvatar}
                  timestamp={item.timestamp}
                  content={item.content || item.excerpt || ''}
                  imageUrl={item.imageUrl}
                  media={item.media || []}
                  authorId={item.author?._id || item.authorId || ''}
                  currentUserId={user?.id}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const renderAllContent = () => {
    // Separate events from other content and move events to the bottom
    const nonEventItems = [
      ...savedContent.news.map(item => ({ ...item, contentType: 'news' })),
      ...savedContent.resources.map(item => ({ ...item, contentType: 'resources' })),
      ...savedContent.social.map(item => ({ ...item, contentType: 'social' }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const eventItems = savedContent.events.map(item => ({ ...item, contentType: 'events' }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const allItems = [...nonEventItems, ...eventItems];

    if (allItems.length === 0) {
      return (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No saved content
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start saving articles, events, resources, and posts to build your personal collection.
          </p>
        </div>
      );
    }

    // Render non-event items in grid
    const nonEventElements = nonEventItems.map((item) => {
      switch (item.contentType) {
        case 'news':
          return (
            <NewsCard
              key={item._id}
              _id={item._id}
              title={item.title}
              excerpt={item.excerpt || ''}
              source={item.source || ''}
              originalAuthor={item.originalAuthor}
              timestamp={item.timestamp}
              discussionCount={item.discussionCount || 0}
              imageUrl={item.imageUrl}
              category={item.category}
              engagement={item.engagement}
            />
          );
        case 'resources': {
          // Determine difficulty based on type
          const difficulty = item.type === 'Document' ? 'Beginner' :
                           item.type === 'Tutorial' ? 'Intermediate' : 'Beginner';
          
          // Determine estimated time based on type
          const estimatedTime = item.type === 'Video' ? '30-45 min' : 
                              item.type === 'Tutorial' ? '20-30 min' : '15-20 min';
          
          return (
            <ResourceCard
              key={item._id}
              id={item._id}
              title={item.title}
              type={item.type as any || 'Document'}
              downloadCount={item.downloadCount || 0}
              views={item.views || 0}
              likes={item.likes || 0}
              fileSize={item.fileSize}
              isApproved={item.isApproved !== undefined ? item.isApproved : true}
              thumbnailUrl={item.thumbnailUrl}
              description={item.description}
              tags={item.tags || []}
              category={item.category}
              estimatedTime={estimatedTime}
              difficulty={difficulty}
              author={item.uploadedBy?.name || 'AI Club Team'}
            />
          );
        }
        case 'social':
          return (
            <SocialCard
              key={item._id}
              id={item._id}
              userName={item.author?.name || item.userName || 'Unknown User'}
              userAvatar={item.author?.profile?.avatar?.data || item.userAvatar}
              timestamp={item.timestamp}
              content={item.content || item.excerpt || ''}
              imageUrl={item.imageUrl}
              media={item.media || []}
              authorId={item.author?._id || item.authorId || ''}
              currentUserId={user?.id}
            />
          );
        default:
          return null;
      }
    });

    // Render event items in separate rows (each event on its own row)
    const eventElements = eventItems.map((item) => {
      const { date, time } = getEventDateTime(item.startDate || item.timestamp, item.endDate);
      return (
        <EventCard
          key={item._id}
          id={item._id}
          title={item.title}
          description={item.description || item.excerpt || ''}
          date={date}
          time={time}
          location={getLocationString(item.location)}
          attendeeCount={item.discussionCount || 0}
          rsvpCount={item.discussionCount || 0}
          discussionCount={item.discussionCount || 0}
          imageUrl={item.imageUrl}
          category={item.category || 'General'}
          eventType={item.type || 'Workshop'}
          allowAdaptiveImage={true}
        />
      );
    });

    return (
      <>
        {/* Non-event items in grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {nonEventElements}
        </div>
        
        {/* Event items - dedicated row with same grid width as above */}
        {eventElements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
            {eventElements}
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-4 py-4">
            <button
              onClick={() => {
                navigate('/');
                openUserProfile();
              }}
              className="flex items-center text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium">Back to Profile</span>
            </button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading saved content...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Back Navigation Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => {
              navigate('/');
              openUserProfile();
            }}
            className="flex items-center text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-medium text-sm sm:text-base">Back to Profile</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Saved Posts
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                  {getTotalSavedCount()} items saved
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchSavedContent}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pb-24">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Enhanced Modern Category Tabs */}
              <div className="relative mb-6 md:mb-8">
                {/* Gradient background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-2xl blur-xl opacity-60"></div>
                
                {/* Scrollable tabs container */}
                <div className="relative overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <TabsList className="inline-flex w-auto min-w-full md:w-full md:grid md:grid-cols-5 h-auto gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                    {/* All Tab */}
                    <TabsTrigger 
                      value="all" 
                      className="group flex-shrink-0 relative px-2.5 sm:px-4 py-2 sm:py-3 text-[10px] xs:text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg sm:rounded-xl transition-all duration-300
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 
                        data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 
                        dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-800/50
                        md:data-[state=active]:scale-105 transform"
                    >
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                          <Bookmark className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="hidden xs:inline">All</span>
                        <span className="px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-bold bg-white/20 group-data-[state=active]:bg-white/30 group-data-[state=inactive]:bg-gray-200 dark:group-data-[state=inactive]:bg-gray-700">
                          {getTotalSavedCount()}
                        </span>
                      </div>
                    </TabsTrigger>

                    {/* News Tab */}
                    <TabsTrigger 
                      value="news" 
                      className="group flex-shrink-0 relative px-2.5 sm:px-4 py-2 sm:py-3 text-[10px] xs:text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg sm:rounded-xl transition-all duration-300
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 
                        data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/30
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 
                        dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-800/50
                        md:data-[state=active]:scale-105 transform"
                    >
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                          <FileText className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="hidden xs:inline">News</span>
                        <span className="px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-bold bg-white/20 group-data-[state=active]:bg-white/30 group-data-[state=inactive]:bg-gray-200 dark:group-data-[state=inactive]:bg-gray-700">
                          {savedContent.news.length}
                        </span>
                      </div>
                    </TabsTrigger>

                    {/* Events Tab */}
                    <TabsTrigger 
                      value="events" 
                      className="group flex-shrink-0 relative px-2.5 sm:px-4 py-2 sm:py-3 text-[10px] xs:text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg sm:rounded-xl transition-all duration-300
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 
                        data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/30
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 
                        dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-800/50
                        md:data-[state=active]:scale-105 transform"
                    >
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                          <Calendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="hidden xs:inline">Events</span>
                        <span className="px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-bold bg-white/20 group-data-[state=active]:bg-white/30 group-data-[state=inactive]:bg-gray-200 dark:group-data-[state=inactive]:bg-gray-700">
                          {savedContent.events.length}
                        </span>
                      </div>
                    </TabsTrigger>

                    {/* Resources Tab */}
                    <TabsTrigger 
                      value="resources" 
                      className="group flex-shrink-0 relative px-2.5 sm:px-4 py-2 sm:py-3 text-[10px] xs:text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg sm:rounded-xl transition-all duration-300
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 
                        data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-orange-500/30
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 
                        dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-800/50
                        md:data-[state=active]:scale-105 transform"
                    >
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                          <FileText className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="hidden xs:inline">Resources</span>
                        <span className="px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-bold bg-white/20 group-data-[state=active]:bg-white/30 group-data-[state=inactive]:bg-gray-200 dark:group-data-[state=inactive]:bg-gray-700">
                          {savedContent.resources.length}
                        </span>
                      </div>
                    </TabsTrigger>

                    {/* Social Tab */}
                    <TabsTrigger 
                      value="social" 
                      className="group flex-shrink-0 relative px-2.5 sm:px-4 py-2 sm:py-3 text-[10px] xs:text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg sm:rounded-xl transition-all duration-300
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 
                        data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-cyan-500/30
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100 
                        dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-800/50
                        md:data-[state=active]:scale-105 transform"
                    >
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                        <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                          <Users className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="hidden xs:inline">Social</span>
                        <span className="px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-bold bg-white/20 group-data-[state=active]:bg-white/30 group-data-[state=inactive]:bg-gray-200 dark:group-data-[state=inactive]:bg-gray-700">
                          {savedContent.social.length}
                        </span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                {renderAllContent()}
              </TabsContent>

              <TabsContent value="news" className="mt-0">
                {renderContent('news', savedContent.news)}
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                {renderContent('events', savedContent.events)}
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                {renderContent('resources', savedContent.resources)}
              </TabsContent>

              <TabsContent value="social" className="mt-0">
                {renderContent('social', savedContent.social)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default SavedPostsPage;

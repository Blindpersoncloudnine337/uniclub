import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import SocialCard from '../components/cards/SocialCard';
import CreatePostDialog from '../components/CreatePostDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

interface FeedPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    uniqueId: string;
    profile?: {
      avatar?: {
        data: string;
        contentType: string;
      };
    };
  };
  content: string;
  media?: Array<{
    type: string;
    url: string;
    filename: string;
  }>;
  postType: string;
  hashtags: string[];
  mentions: any[];
  engagement: {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    views: number;
  };
  // Direct engagement fields from SocialFeedService transformation
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  views?: number;
  userInteractions?: {
    liked: boolean;
    saved: boolean;
    shared: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const SocialPage: React.FC = () => {
  const { user: authUser, getAuthHeaders } = useAuth();
  const { user: userProfile } = useUser();
  const queryClient = useQueryClient();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Simple posts query (no authentication required)
  const {
    data: feedData,
    isLoading: feedLoading,
    error: feedError,
    refetch: refetchFeed
  } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/social/posts?limit=50');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Social posts data:', data); // Debug log
        
        // DEBUG: Log social post engagement data
        const posts = data.posts || data;
        console.log('📱 SocialPage API Response:', posts.slice(0, 3).map((p: any) => ({
          content: p.content?.substring(0, 30) + '...',
          engagement: p.engagement,
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          shareCount: p.shareCount
        })));
        
        return data;
      } catch (error) {
        console.error('Error fetching social posts:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });


  // Engagement stats query removed - endpoint doesn't exist

  // User suggestions removed - endpoint doesn't exist

  // Transform feed data for display
  const allPosts = feedData?.posts || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Feed</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="space-y-6">

                {/* Create Post Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        {(authUser?.avatar?.data || userProfile?.profileImage) ? (
                          <img 
                            src={authUser?.avatar?.data || userProfile?.profileImage || ''} 
                            alt={authUser?.name || userProfile?.name || 'You'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold">
                            {(authUser?.name || userProfile?.name)?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatePostOpen(true)}
                        className="flex-1 justify-start text-gray-500 dark:text-gray-400 h-auto py-3 bg-slate-200 dark:bg-[#0A1426] border border-slate-300 dark:border-[#1E293B] hover:bg-slate-300 dark:hover:bg-[#0F172A]"
                      >
                        What's on your mind about AI?
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed Posts */}
                {feedLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex space-x-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-20 w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : feedError ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-red-600 dark:text-red-400">Failed to load feed. Please try again later.</p>
                      <Button onClick={() => refetchFeed()} className="mt-4">Retry</Button>
                    </CardContent>
                  </Card>
                ) : allPosts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-600 dark:text-gray-400">No posts yet. Be the first to share something!</p>
                      <Button onClick={() => setIsCreatePostOpen(true)} className="mt-4">Create First Post</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {allPosts
                      .filter(post => post && post.content) // Filter out null posts
                      .map((post: FeedPost) => (
                                             <SocialCard
                         key={post._id}
                         id={post._id}
                         userName={post.author?.name || 'Unknown User'}
                         userAvatar={post.author?.profile?.avatar?.data ? 
                           post.author.profile.avatar.data : 
                           null
                         }
                         timestamp={post.createdAt}
                         content={post.content}
                         imageUrl={post.media?.[0]?.url}
                         media={post.media || []}
                         authorId={post.author?._id || ''}
                         currentUserId={authUser?.id || userProfile?.id}
                       />
                    ))}
                  </div>
                )}
          </div>
        </div>

        <CreatePostDialog
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={() => {
            setIsCreatePostOpen(false);
            refetchFeed();
          }}
        />
      </div>
    </div>
  );
};

export default SocialPage;

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import ShareDialog from './ShareDialog';
import { useEngagement } from '../hooks/useEngagement';
import api from '../lib/axios';

interface InteractionButtonsProps {
  contentType: 'News' | 'SocialPost' | 'Event' | 'Comment' | 'Resource';
  contentId: string;
  engagement?: {
    likes?: number;
    saves?: number;
    shares?: number;
    comments?: number;
  };
  likeCount?: number;
  shareCount?: number;
  saveCount?: number;
  reactions?: {
    likes: number;
    userReaction?: boolean;
  };
  commentCount?: number;
  onCommentClick: () => void;
  onShareClick?: () => void;
  shareTitle?: string;
  shareType?: 'news' | 'event' | 'resource' | 'social';
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showSave?: boolean;
  showBorder?: boolean;
  noBg?: boolean;
  onLike?: (liked: boolean) => void;
  onSave?: (saved: boolean) => void;
  cardType?: 'news' | 'event' | 'resource' | 'social';
  resourceType?: 'Document' | 'Video' | 'Tutorial' | 'Tool';
}

const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  contentType,
  contentId,
  engagement,
  likeCount,
  shareCount,
  saveCount,
  reactions = { likes: 0, userReaction: false },
  commentCount = 0,
  onCommentClick,
  onShareClick,
  shareTitle = 'Content',
  shareType = 'news',
  layout = 'horizontal',
  size = 'md',
  showSave = true,
  showBorder = true,
  noBg = false,
  onLike,
  onSave,
  cardType,
  resourceType
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Use the unified engagement hook
  const {
    engagement: userEngagement,
    stats,
    loading,
    toggleLike,
    toggleSave,
    recordShare
  } = useEngagement(contentType, contentId);
  
  // Get real-time comment count using the unified comment system
  const [realTimeCommentCount, setRealTimeCommentCount] = useState(0);
  
  // Map frontend contentType to backend contentType
  const mapContentType = (type: string): string => {
    const mapping: { [key: string]: string } = {
      'News': 'news',
      'Event': 'event', 
      'Resource': 'resource',
      'SocialPost': 'social',
      'Comment': 'comment'
    };
    return mapping[type] || type.toLowerCase();
  };
  
  useEffect(() => {
    const fetchCommentCount = async () => {
      if (!contentType || !contentId) return;

      try {
        const backendContentType = mapContentType(contentType);
        console.log('🔍 Fetching comment count:', {
          contentType,
          backendContentType,
          contentId,
          url: `/api/comments/${backendContentType}/${contentId}/count`,
          baseURL: api.defaults.baseURL
        });
        const response = await api.get(`/api/comments/${backendContentType}/${contentId}/count?t=${Date.now()}`);
        console.log('✅ Comment count response:', response.data);
        setRealTimeCommentCount(response.data.totalCount || 0); // Use totalCount to match what user sees in comments
      } catch (error) {
        console.error('Error fetching comment count:', error);
        // Fallback to 0 if request fails
        setRealTimeCommentCount(0);
      }
    };

    fetchCommentCount();
  }, [contentType, contentId]);

  const handleLikeClick = async () => {
    try {
      await toggleLike();
      if (onLike) {
        onLike(!userEngagement.liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSaveClick = async () => {
    try {
      await toggleSave();
      if (onSave) {
        onSave(!userEngagement.saved);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleShareButtonClick = async () => {
    if (onShareClick) {
      onShareClick();
    } else {
      setShowShareDialog(true);
      // Record the share action
      try {
        await recordShare();
      } catch (error) {
        console.error('Error recording share:', error);
      }
    }
  };

  const formatCount = (count: number | undefined) => {
    const safeCount = count || 0;
    if (safeCount >= 1000) {
      return `${(safeCount / 1000).toFixed(1)}k`;
    }
    return safeCount.toString();
  };

  // Get dynamic background color based on card type for better contrast
  const getCardTypeBackground = () => {
    if (noBg) return '';
    
    switch (cardType) {
      case 'news':
        return 'bg-transparent dark:bg-amber-950 border border-amber-300 dark:border-amber-900';
      case 'event':
        return 'bg-transparent dark:bg-[#001A10] border border-emerald-300 dark:border-[#00150C]';
      case 'resource':
        return 'bg-transparent dark:bg-gray-950 border border-gray-300 dark:border-gray-900';
      case 'social':
        return 'bg-transparent dark:bg-[#0A1426] border border-slate-300 dark:border-[#1E293B]';
      default:
        return 'bg-transparent dark:bg-gray-950 border border-gray-300 dark:border-gray-900';
    }
  };

  // Adjust spacing based on size only
  const spacingClass = size === 'sm' ? 'space-x-3' : 'space-x-6';
  const paddingClass = size === 'sm' ? 'p-2' : 'p-3';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const buttonSpacing = size === 'sm' ? 'space-x-1' : 'space-x-2';
  
  return (
    <>
      <div className={`flex items-center justify-between ${paddingClass} rounded-lg transition-colors duration-200 ${
        noBg ? '' : getCardTypeBackground()
      } ${cardType === 'social' ? 'hover:bg-[#0F172A]' : ''}`}>
        <div className={`flex items-center ${spacingClass}`}>
          {/* Like Button */}
          <button 
            onClick={handleLikeClick}
            disabled={loading}
            className={`flex items-center ${buttonSpacing} text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors`}
          >
            <Heart className={`${iconSize} ${
              userEngagement?.liked ? 'text-red-500 fill-red-500' : ''
            }`} />
            <span className={`font-medium ${textSize}`}>{formatCount(stats.totalLikes)}</span>
          </button>

          {/* Comment Button */}
          <button 
            onClick={onCommentClick}
            className={`flex items-center ${buttonSpacing} text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors`}
          >
            <MessageCircle className={iconSize} />
            <span className={`font-medium ${textSize}`}>{formatCount(realTimeCommentCount)}</span>
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShareButtonClick}
            className={`flex items-center ${buttonSpacing} text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors`}
          >
            <Share2 className={iconSize} />
            <span className={`font-medium ${textSize}`}>{formatCount(stats.totalShares)}</span>
          </button>
        </div>

        {/* Save Button */}
        {showSave && (
          <button 
            onClick={handleSaveClick}
            disabled={loading}
            className="text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors flex-shrink-0"
          >
            <Bookmark className={`${iconSize} ${
              userEngagement?.saved ? 'text-emerald-500 fill-emerald-500' : ''
            }`} />
          </button>
        )}
      </div>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        title={shareTitle}
        type={shareType}
      />
    </>
  );
};

export default InteractionButtons; 
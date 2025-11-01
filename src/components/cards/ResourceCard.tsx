import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Download, 
  Play, 
  BookOpen, 
  Code, 
  Clock,
  User,
  Eye
} from 'lucide-react';
import InteractionButtons from '../InteractionButtons';
import api from '../../lib/axios';

interface ResourceCardProps {
  id: string;
  title: string;
  type: 'Document' | 'Tutorial' | 'Tool' | 'Video';
  downloadCount?: number;
  views?: number;
  likes?: number;
  fileSize?: string;
  isApproved: boolean;
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
  category?: string;
  estimatedTime?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  author?: string;
  isCompact?: boolean;
  isSquare?: boolean;
  linkUrl?: string;
  fileUrl?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  title,
  type,
  downloadCount = 0,
  views = 0,
  likes = 0,
  fileSize,
  isApproved,
  thumbnailUrl,
  description,
  tags = [],
  category,
  estimatedTime,
  difficulty = 'Beginner',
  author = 'AI Club Team',
  isCompact = false,
  isSquare = false,
  linkUrl,
  fileUrl
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = () => {
    navigate(`/resource/${id}`, {
      state: { referrer: location.pathname }
    });
  };

  const handleActionClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // If resource has a link (for Video, Tutorial, Tool), open it in new tab AND track view
    // Otherwise navigate to resource detail page
    if (linkUrl && (type === 'Video' || type === 'Tutorial' || type === 'Tool')) {
      // Track view before opening - ONLY counted once per user
      try {
        const response = await api.post(`/api/resources/${id}/view`);
        if (response.data.newView) {
          console.log('✅ View tracked from card');
        } else {
          console.log('ℹ️ Already viewed this resource');
        }
      } catch (error) {
        console.error('Failed to track view:', error);
        // Still allow viewing even if tracking fails
      }
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/resource/${id}`, {
        state: { referrer: location.pathname }
      });
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'Document':
        return {
          icon: <Download className="w-4 h-4" />,
          color: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
          action: 'Download PDF',
          iconBg: 'bg-blue-500',
          bgColor: 'from-blue-500/10 to-blue-600/5',
          borderColor: 'border-l-blue-500',
          hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-800',
          tileBackground: 'bg-blue-50/40 dark:bg-blue-900/10',
          tileBorder: 'border-blue-100 dark:border-blue-900/20'
        };
      case 'Video':
        return {
          icon: <Play className="w-4 h-4" />,
          color: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          action: 'Watch Video',
          iconBg: 'bg-red-500',
          bgColor: 'from-red-500/10 to-red-600/5',
          borderColor: 'border-l-red-500',
          hoverBorder: 'hover:border-red-200 dark:hover:border-red-800',
          tileBackground: 'bg-red-50/40 dark:bg-red-900/10',
          tileBorder: 'border-red-100 dark:border-red-900/20'
        };
      case 'Tutorial':
        return {
          icon: <BookOpen className="w-4 h-4" />,
          color: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
          action: 'Learn More',
          iconBg: 'bg-emerald-500',
          bgColor: 'from-emerald-500/10 to-emerald-600/5',
          borderColor: 'border-l-emerald-500',
          hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-800',
          tileBackground: 'bg-emerald-50/40 dark:bg-emerald-900/10',
          tileBorder: 'border-emerald-100 dark:border-emerald-900/20'
        };
      case 'Tool':
        return {
          icon: <Code className="w-4 h-4" />,
          color: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
          action: 'Explore',
          iconBg: 'bg-purple-500',
          bgColor: 'from-purple-500/10 to-purple-600/5',
          borderColor: 'border-l-purple-500',
          hoverBorder: 'hover:border-purple-200 dark:hover:border-purple-800',
          tileBackground: 'bg-purple-50/40 dark:bg-purple-900/10',
          tileBorder: 'border-purple-100 dark:border-purple-900/20'
        };
      default:
        return {
          icon: <BookOpen className="w-4 h-4" />,
          color: 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
          action: 'View Resource',
          iconBg: 'bg-gray-500',
          bgColor: 'from-gray-500/10 to-gray-600/5',
          borderColor: 'border-l-gray-500',
          hoverBorder: 'hover:border-gray-200 dark:hover:border-gray-800',
          tileBackground: 'bg-gray-50/40 dark:bg-gray-900/10',
          tileBorder: 'border-gray-100 dark:border-gray-900/20'
        };
    }
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return {
          label: 'BEG',
          color: 'bg-emerald-400 text-white dark:bg-emerald-500 dark:text-white',
          fullLabel: 'Beginner'
        };
      case 'Intermediate':
        return {
          label: 'INT',
          color: 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white',
          fullLabel: 'Intermediate'
        };
      case 'Advanced':
        return {
          label: 'ADV',
          color: 'bg-emerald-800 text-white dark:bg-emerald-800 dark:text-white',
          fullLabel: 'Advanced'
        };
      default:
        return {
          label: 'BEG',
          color: 'bg-gray-400 text-white dark:bg-gray-500 dark:text-white',
          fullLabel: 'Beginner'
        };
    }
  };

  const typeConfig = getTypeConfig(type);
  const difficultyConfig = getDifficultyConfig(difficulty);

  // Square layout for horizontal scrolling in Homepage Popular Resources section
  if (isSquare) {
    return (
      <div 
        className={`${typeConfig.tileBackground} rounded-2xl border ${typeConfig.tileBorder} ${typeConfig.borderColor} border-l-4 p-4 hover:shadow-xl ${typeConfig.hoverBorder} transition-all duration-300 cursor-pointer group h-64 flex flex-col`}
        onClick={handleCardClick}
      >
        {/* Header with badges */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.icon}
            {type}
          </span>
          <span 
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${difficultyConfig.color}`}
            title={difficultyConfig.fullLabel}
          >
            {difficultyConfig.label}
          </span>
        </div>
        
        {/* Title with proper ellipsis */}
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxHeight: '2.5rem'
            }}>
          {title}
        </h3>
        
        {/* Description with proper ellipsis */}
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-3 flex-1"
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               maxHeight: '3.6rem'
             }}>
            {description}
          </p>
        )}
        
        {/* Author with ellipsis */}
        <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500 dark:text-gray-400 min-w-0">
          <User className="w-3 h-3 flex-shrink-0" />
          <span 
            className="flex-1 min-w-0"
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis'
            }}
          >
            {author}
          </span>
        </div>
        
        {/* Stats at bottom */}
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {type === 'Document' && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                <Download className="w-4 h-4" />
                <span>{downloadCount.toLocaleString()}</span>
              </div>
            )}
            {(type === 'Video' || type === 'Tutorial' || type === 'Tool') && (
              <div className={`flex items-center gap-1.5 text-sm font-medium ${
                type === 'Video' ? 'text-red-600 dark:text-red-400' : 
                type === 'Tutorial' ? 'text-emerald-600 dark:text-emerald-400' :
                'text-purple-600 dark:text-purple-400'
              }`}>
                <Eye className="w-4 h-4" />
                <span>{views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact layout for list view
  if (isCompact) {
    return (
      <div className={`${typeConfig.tileBackground} rounded-xl border ${typeConfig.tileBorder} ${typeConfig.borderColor} border-l-4 p-4 hover:shadow-lg ${typeConfig.hoverBorder} transition-all duration-200 cursor-pointer group`}
           onClick={handleCardClick}>
        <div className="flex items-center gap-4">
          {/* Type Icon */}
          <div className={`${typeConfig.iconBg} text-white p-2.5 rounded-lg flex-shrink-0`}>
            {typeConfig.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}>
              {title}
            </h3>
          </div>
            
          {/* Action Button */}
          <button 
            onClick={handleActionClick}
            className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-all duration-200 flex-shrink-0 ${
              type === 'Document' ? 'text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 border-blue-600 dark:border-blue-500' :
              type === 'Video' ? 'text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-500 border-red-600 dark:border-red-500' :
              type === 'Tutorial' ? 'text-emerald-600 dark:text-emerald-400 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 border-emerald-600 dark:border-emerald-500' :
              'text-purple-600 dark:text-purple-400 hover:text-white hover:bg-purple-600 dark:hover:bg-purple-500 border-purple-600 dark:border-purple-500'
            }`}
          >
            {typeConfig.action}
          </button>
        </div>
      </div>
    );
  }

  // Main tile design
  return (
    <div 
      className={`${typeConfig.tileBackground} rounded-2xl border ${typeConfig.tileBorder} ${typeConfig.borderColor} border-l-4 overflow-hidden hover:shadow-xl ${typeConfig.hoverBorder} transition-all duration-300 cursor-pointer group flex flex-col h-full`}
      onClick={handleCardClick}
    >
      {/* Header Section */}
      <div className={`relative bg-gradient-to-br ${typeConfig.bgColor} p-4 border-b border-gray-100 dark:border-gray-800`}>
        {/* Type Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.icon}
            {type}
          </span>
        </div>
        
        {/* Difficulty Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <span 
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${difficultyConfig.color}`}
            title={difficultyConfig.fullLabel}
          >
            {difficultyConfig.label}
          </span>
        </div>
        
        {/* Title - With proper spacing from badges */}
        <div className="mt-8">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '3rem'
              }}>
            {title}
          </h3>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Description */}
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4"
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               maxHeight: '4.5rem'
             }}>
            {description}
          </p>
        )}
        
        {/* Author and Time Row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <User className="w-3 h-3 flex-shrink-0" />
            <span 
              className="flex-1 min-w-0"
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {author}
            </span>
          </div>
          {estimatedTime && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4">
          {/* Primary Stat (Downloads or Views) */}
          {type === 'Document' && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Download className="w-4 h-4" />
              <span>{downloadCount.toLocaleString()}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">downloads</span>
            </div>
          )}
          {(type === 'Video' || type === 'Tutorial' || type === 'Tool') && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              type === 'Video' ? 'text-red-600 dark:text-red-400' : 
              type === 'Tutorial' ? 'text-emerald-600 dark:text-emerald-400' :
              'text-purple-600 dark:text-purple-400'
            }`}>
              <Eye className="w-4 h-4" />
              <span>{views.toLocaleString()}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">views</span>
            </div>
          )}
          
          {/* File Size for Downloads */}
          {fileSize && type === 'Document' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {fileSize}
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">+{tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer - Interaction Buttons */}
        <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
          <InteractionButtons
            contentType="Resource"
            contentId={id}
            engagement={{
              likes: likes,
              comments: 0,
              shares: 0,
              saves: 0
            }}
            onCommentClick={() => navigate(`/comments/resource/${id}`)}
            shareTitle={title}
            shareType="resource"
            layout="horizontal"
            size="md"
            showSave={true}
            cardType="resource"
            resourceType={type}
          />
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;

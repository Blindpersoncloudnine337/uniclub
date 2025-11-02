import React, { useState } from 'react';
import { Play, Youtube } from 'lucide-react';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url, title = 'Watch Video' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract YouTube video ID from various URL formats
  const getVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      // Handle youtu.be links
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      
      // Handle youtube.com links
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Get timestamp from URL if exists
  const getStartTime = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const t = urlObj.searchParams.get('t');
      return t ? `?start=${t.replace('s', '')}` : '';
    } catch {
      return '';
    }
  };

  const videoId = getVideoId(url);
  const startTime = getStartTime(url);

  if (!videoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
      >
        <Youtube className="w-4 h-4" />
        Watch Recording
      </a>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (isExpanded) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              YouTube Video
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium"
          >
            Collapse
          </button>
        </div>

        {/* Responsive iframe container */}
        <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden shadow-2xl">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}${startTime}&autoplay=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
          <Youtube className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Watch the full recording on YouTube
          </p>
        </div>
      </div>

      {/* YouTube Thumbnail with Play Button */}
      <div 
        className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg"
        onClick={() => setIsExpanded(true)}
      >
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to hqdefault if maxresdefault doesn't exist
            e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-red-700">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Duration Badge (if we had duration info) */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
          YouTube
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg"
        >
          <Play className="w-4 h-4" />
          Watch Here
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
        >
          <Youtube className="w-4 h-4" />
          Open in YouTube
        </a>
      </div>
    </div>
  );
};

export default YouTubeEmbed;


import React from 'react';

interface PastEventCardProps {
  id: string;
  title: string;
  subtitle: string;
  poster: {
    data: string;
    contentType: string;
  };
  onClick?: () => void;
}

const PastEventCard: React.FC<PastEventCardProps> = ({ 
  id, 
  title, 
  subtitle, 
  poster,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700"
    >
      {/* Poster Image */}
      <div className="relative w-full overflow-hidden">
        {poster.data ? (
          <img 
            src={poster.data} 
            alt={title}
            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
            style={{ minHeight: '200px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full min-h-[200px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default PastEventCard;


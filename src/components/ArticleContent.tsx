import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ArticleContentProps {
  content: string;
  summary?: {
    raw?: string;
    whyItMatters?: string;
  };
  originalUrl?: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content, summary, originalUrl }) => {
  const handleReadOriginal = () => {
    if (originalUrl) {
      window.open(originalUrl, '_blank');
    }
  };

  // Use the AI-generated summary as the main content if available, otherwise use original content
  const displayContent = summary?.raw || content;

  return (
    <div className="px-4 py-6 max-w-full overflow-x-hidden">
      {/* Main Content - 2 student-friendly paragraphs */}
      <div className="prose dark:prose-invert max-w-none">
        {displayContent.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-base">
            {paragraph.replace(/^-\s+/gm, '📍 ').replace(/^\*\s+/gm, '✨ ')}
          </p>
        ))}
      </div>

      {/* Why it Matters Section */}
      {summary?.whyItMatters && (
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
          <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
            ⚡ Why This Matters
          </h3>
          
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {summary.whyItMatters.split('\n').map((line, index) => {
              if (line.trim()) {
                return (
                  <p key={index} className="mb-2">
                    {line.replace(/^-\s+/gm, '🎯 ').replace(/^\*\s+/gm, '💡 ')}
                  </p>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Read Original Button - Refined Design */}
      {originalUrl && (
        <div className="mt-8 pt-6">
          <div className="flex justify-center">
            <button 
              onClick={handleReadOriginal}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-xl transition-all duration-200 font-medium text-sm group"
            >
              <ExternalLink className="w-4 h-4 transition-transform group-hover:scale-110" />
              Read Full Article
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
            Opens in new tab • Original source
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleContent; 
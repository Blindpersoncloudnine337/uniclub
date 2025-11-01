import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createNavigationState } from '../utils/navigationUtils';

interface BackNavigationProps {
  /** The referrer path from location.state */
  referrer?: string;
  /** Content type for smart defaults (news, event, resource, social) */
  contentType?: string;
  /** Custom fallback referrer if no referrer provided */
  fallbackReferrer?: string;
  /** Custom styling classes */
  className?: string;
  /** Whether to show in a sticky header */
  sticky?: boolean;
  /** Whether to show with border */
  showBorder?: boolean;
  /** Custom onClick handler (overrides default navigation) */
  onClick?: () => void;
}

const BackNavigation: React.FC<BackNavigationProps> = ({
  referrer,
  contentType,
  fallbackReferrer,
  className = '',
  sticky = true,
  showBorder = true,
  onClick
}) => {
  const navigate = useNavigate();
  
  // Create navigation state with smart defaults
  const navState = createNavigationState(referrer, contentType, fallbackReferrer);
  
  const handleBackClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    // Navigate back to the determined referrer
    navigate(navState.referrer);
  };

  const baseClasses = `
    bg-white dark:bg-gray-900 
    ${showBorder ? 'border-b border-gray-200 dark:border-gray-700' : ''}
    ${sticky ? 'sticky top-0 z-10' : ''}
  `.trim();

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="px-4 py-4">
        <button
          onClick={handleBackClick}
          className="flex items-center text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group"
          aria-label={navState.breadcrumb}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium">{navState.breadcrumb}</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Simplified inline back navigation for in-content usage
 */
interface InlineBackNavigationProps {
  referrer?: string;
  contentType?: string;
  fallbackReferrer?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const InlineBackNavigation: React.FC<InlineBackNavigationProps> = ({
  referrer,
  contentType,
  fallbackReferrer,
  className = '',
  size = 'md',
  onClick
}) => {
  const navigate = useNavigate();
  const navState = createNavigationState(referrer, contentType, fallbackReferrer);
  
  const handleBackClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate(navState.referrer);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleBackClick}
      className={`
        inline-flex items-center text-emerald-600 dark:text-emerald-500 
        hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors 
        font-medium group ${sizeClasses[size]} ${className}
      `}
      aria-label={navState.breadcrumb}
    >
      <ArrowLeft className={`${iconSizes[size]} mr-2 transition-transform group-hover:-translate-x-0.5`} />
      {navState.breadcrumb}
    </button>
  );
};

export default BackNavigation;

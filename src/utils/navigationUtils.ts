/**
 * Navigation utilities for dynamic breadcrumb and back navigation
 */

export interface PageInfo {
  title: string;
  path: string;
}

/**
 * Get page information for dynamic navigation labels
 */
export const getPageInfo = (pathname: string): PageInfo => {
  // Handle exact matches first
  const exactMatches: Record<string, PageInfo> = {
    '/': {
      title: 'Home',
      path: '/'
    },
    '/news': {
      title: 'News',
      path: '/news'
    },
    '/events': {
      title: 'Events',
      path: '/events'
    },
    '/social': {
      title: 'Social',
      path: '/social'
    },
    '/resources': {
      title: 'Resources',
      path: '/resources'
    },
    '/settings': {
      title: 'Settings',
      path: '/settings'
    }
  };

  // Check for exact match first
  if (exactMatches[pathname]) {
    return exactMatches[pathname];
  }

  // Handle dynamic routes with patterns
  if (pathname.startsWith('/article/')) {
    return {
      title: 'News',
      path: '/news'
    };
  }

  if (pathname.startsWith('/event/')) {
    return {
      title: 'Events',
      path: '/events'
    };
  }

  if (pathname.startsWith('/resource/')) {
    return {
      title: 'Resources',
      path: '/resources'
    };
  }

  if (pathname.startsWith('/comments/')) {
    // Extract content type from comments URL: /comments/:type/:id
    const parts = pathname.split('/');
    const contentType = parts[2];
    
    switch (contentType) {
      case 'news':
        return {
          title: 'News',
          path: '/news'
        };
      case 'event':
        return {
          title: 'Events',
          path: '/events'
        };
      case 'resource':
        return {
          title: 'Resources',
          path: '/resources'
        };
      case 'social':
        return {
          title: 'Social',
          path: '/social'
        };
      default:
        return {
          title: 'Home',
          path: '/'
        };
    }
  }

  // Default fallback
  return {
    title: 'Home',
    path: '/'
  };
};

/**
 * Generate dynamic back navigation text based on referrer path
 */
export const getBackNavigationText = (referrerPath: string): string => {
  const pageInfo = getPageInfo(referrerPath);
  return `Back to ${pageInfo.title}`;
};



/**
 * Validate if a path is a valid referrer
 */
export const isValidReferrer = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false;
  
  const validPaths = [
    '/',
    '/news',
    '/events', 
    '/social',
    '/resources',
    '/settings'
  ];
  
  return validPaths.includes(path) || 
         path.startsWith('/article/') ||
         path.startsWith('/event/') ||
         path.startsWith('/resource/') ||
         path.startsWith('/comments/');
};

/**
 * Get smart default referrer based on content type
 */
export const getDefaultReferrer = (contentType?: string): string => {
  switch (contentType?.toLowerCase()) {
    case 'news':
    case 'article':
      return '/news';
    case 'event':
    case 'events':
      return '/events';
    case 'resource':
    case 'resources':
      return '/resources';
    case 'social':
    case 'socialpost':
      return '/social';
    default:
      return '/';
  }
};

/**
 * Enhanced navigation helper that tracks page flow
 */
export interface NavigationState {
  referrer: string;
  pageTitle: string;
  breadcrumb: string;
  isValid: boolean;
}

export const createNavigationState = (
  currentReferrer?: string, 
  contentType?: string,
  fallbackReferrer?: string
): NavigationState => {
  // Determine the best referrer path
  let referrer: string;
  
  if (currentReferrer && isValidReferrer(currentReferrer)) {
    referrer = currentReferrer;
  } else if (fallbackReferrer && isValidReferrer(fallbackReferrer)) {
    referrer = fallbackReferrer;
  } else {
    referrer = getDefaultReferrer(contentType);
  }

  const pageInfo = getPageInfo(referrer);
  
  return {
    referrer,
    pageTitle: pageInfo.title,
    breadcrumb: getBackNavigationText(referrer),
    isValid: isValidReferrer(referrer)
  };
};

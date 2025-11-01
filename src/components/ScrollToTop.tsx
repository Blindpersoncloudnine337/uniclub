import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This ensures a consistent user experience
 * where every page navigation starts from the top.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the route changes
    // Use a small timeout to ensure the page has started rendering
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Use 'instant' to avoid animation delays
      });

      console.log(`📍 Scrolled to top for route: ${pathname}${search}`);
    }, 0);

    return () => clearTimeout(scrollTimeout);
  }, [pathname, search]);

  return null; // This component renders nothing
};

export default ScrollToTop;

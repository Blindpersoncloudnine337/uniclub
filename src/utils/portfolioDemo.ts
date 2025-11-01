/**
 * Portfolio Demo Mode Utilities
 * 
 * Automatically logs in visitors with a demo token for portfolio demonstrations.
 * This allows recruiters/visitors to immediately use all features without authentication.
 */

export const PORTFOLIO_DEMO_TOKEN = 'portfolio-demo-token';

export const DEMO_USER = {
  email: 'ashwin.thomas@utdallas.edu',
  name: 'Ashwin Thomas',
  uniqueId: 'UTDAIC1',
};

/**
 * Initialize portfolio demo mode
 * Sets up automatic authentication for visitors
 */
export const initPortfolioDemo = () => {
  // Check if we're in production and no token exists
  const hasToken = localStorage.getItem('token') || 
                   sessionStorage.getItem('authToken') || 
                   localStorage.getItem('authToken');
  
  if (!hasToken) {
    // Set demo token for portfolio visitors
    localStorage.setItem('token', PORTFOLIO_DEMO_TOKEN);
    console.log('🎨 Portfolio demo mode initialized');
  }
};

/**
 * Check if current user is in demo mode
 */
export const isPortfolioDemo = (): boolean => {
  const token = localStorage.getItem('token') || 
                sessionStorage.getItem('authToken') || 
                localStorage.getItem('authToken');
  
  return token === PORTFOLIO_DEMO_TOKEN;
};


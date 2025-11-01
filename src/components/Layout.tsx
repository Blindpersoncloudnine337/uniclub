import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import UserProfile from './UserProfile';
import ProfilePictureUpload from './ProfilePictureUpload';
import { Search, User, X, Calendar, Users, Newspaper, FileText, Video, BookOpen, Code, MessageCircle, Plus, ChevronDown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { usePopup } from '../context/PopupContext';
import api from '../lib/axios';

interface LayoutProps {
  children: React.ReactNode;
}

interface SearchResult {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  icon?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useUser();
  const { showUserProfile, openUserProfile, closeUserProfile } = usePopup();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Club switcher state
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const [showFeatureNotification, setShowFeatureNotification] = useState(false);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [showRequestSentMessage, setShowRequestSentMessage] = useState(false);
  const clubDropdownRef = useRef<HTMLDivElement>(null);
  
  // Add club form state
  const [addClubForm, setAddClubForm] = useState({
    clubName: '',
    clubId: '',
    memberName: '',
    memberEmail: ''
  });
  
  // Clubs data with current club (AI Biz) and other clubs user is part of
  const clubs = [
    { id: 1, name: 'AI Biz', logo: '/Assets/Logo.png', isActive: true },
    { id: 2, name: 'Tech Innovators', logo: '/Assets/2.png', isActive: false },
    { id: 3, name: 'Data Science Club', logo: '/Assets/3.png', isActive: false },
    { id: 4, name: 'Robotics Society', logo: '/Assets/4.png', isActive: false },
    { id: 5, name: 'Code Warriors', logo: '/Assets/5.png', isActive: false },
  ];

  // Redirect to auth page if not authenticated (except if already on auth page)
  useEffect(() => {
    console.log('🔍 Layout auth check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'pathname:', location.pathname);
    
    if (!isLoading && !isAuthenticated && location.pathname !== '/auth') {
      console.log('🚨 User not authenticated, redirecting to /auth');
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);


  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  // Handle click outside to close club dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clubDropdownRef.current && !clubDropdownRef.current.contains(event.target as Node)) {
        setIsClubDropdownOpen(false);
      }
    };

    if (isClubDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClubDropdownOpen]);

  // Helper function to get icon based on type
  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'news':
        return <Newspaper className="w-5 h-5 text-emerald-500" />;
      case 'event':
      case 'past event':
        return <Calendar className="w-5 h-5 text-emerald-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'tutorial':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'tool':
        return <Code className="w-5 h-5 text-purple-500" />;
      case 'post':
        return <MessageCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  // Real search function using API
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await api.get(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
      
      if (response.data.success) {
        const resultsWithIcons = response.data.results.map((result: SearchResult) => ({
          ...result,
          icon: getIconForType(result.type)
        }));
        setSearchResults(resultsWithIcons);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the URL provided by the search result
    navigate(result.url);
    handleSearchClose();
  };

  // Club dropdown handlers
  const handleClubLogoClick = () => {
    setIsClubDropdownOpen(!isClubDropdownOpen);
  };

  const handleClubSwitch = (clubId: number, isActive: boolean) => {
    setIsClubDropdownOpen(false);
    if (!isActive) {
      // Show notification for clubs that aren't active yet
      setShowFeatureNotification(true);
    }
    // If it's the active club, just close the dropdown (already on this club)
  };

  const handleAddClub = () => {
    setIsClubDropdownOpen(false);
    setShowAddClubModal(true);
  };

  const handleAddClubFormChange = (field: string, value: string) => {
    setAddClubForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRequestToJoin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Request to join submitted:', addClubForm);
    
    // Close the form modal
    setShowAddClubModal(false);
    
    // Show success message
    setShowRequestSentMessage(true);
    
    // Reset form
    setAddClubForm({
      clubName: '',
      clubId: '',
      memberName: '',
      memberEmail: ''
    });
  };

  const closeAddClubModal = () => {
    setShowAddClubModal(false);
    // Reset form when closing
    setAddClubForm({
      clubName: '',
      clubId: '',
      memberName: '',
      memberEmail: ''
    });
  };

  // Don't render layout for auth page
  if (location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  // Don't render layout if not authenticated (will redirect anyway)
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to login...</p>
      </div>
    </div>;
  }

  // Get user's first name for welcome message
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  return (
    <div className="mobile-container bg-white dark:bg-gray-900 min-h-screen">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
                 <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 dark:from-gray-800 dark:via-gray-900 dark:to-black rounded-b-3xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 relative" ref={clubDropdownRef}>
              {/* Clickable Club Logo */}
              <button 
                onClick={handleClubLogoClick}
                className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 dark:bg-white/10 flex items-center justify-center relative hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <img src="/Assets/Logo.png" alt="AI Biz Logo" className="w-full h-full object-contain" />
                <div className="absolute -bottom-0.5 -right-0.5 bg-white/90 dark:bg-gray-800/90 rounded-full p-0.5">
                  <ChevronDown className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                </div>
              </button>
              {/* Club Name and Welcome Message - Left aligned to logo */}
              <div>
                <h1 className="text-white text-lg font-bold font-avigea tracking-[1px]">AI Biz</h1>
                <p className="text-white/80 dark:text-white/70 text-sm mt-[-5px]">
                  Welcome back, {getFirstName(user.name)}
                </p>
              </div>

              {/* Club Switcher Dropdown */}
              {isClubDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 transform transition-all duration-200 origin-top-left">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                      Your Clubs
                    </div>
                    
                    {/* Club List */}
                    <div className="space-y-1">
                      {clubs.map((club) => (
                        <button
                          key={club.id}
                          onClick={() => handleClubSwitch(club.id, club.isActive)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-colors ${
                            club.isActive
                              ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <img src={club.logo} alt={`${club.name} Logo`} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {club.name}
                            </div>
                            {club.isActive && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                Active
                              </div>
                            )}
                          </div>
                          {club.isActive && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Add Club Button */}
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleAddClub}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            Add Club
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Join or create new
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative" ref={searchContainerRef}>
                <button 
                  onClick={handleSearchClick}
                  className={`w-10 h-10 bg-white/20 dark:bg-white/10 rounded-xl hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 flex items-center justify-center ${
                    isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
                
                {isSearchExpanded && (
                  <div className="absolute right-0 top-0 z-50">
                                         <div className="w-[320px] bg-white/80 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 origin-top-right">
                                                                      <form 
                           onSubmit={handleSearchSubmit}
                           className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90"
                         >
                        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          placeholder="Search news, events, resources, posts..."
                          className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSearchClose}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </form>

                                             {/* Search Results */}
                       <div className="max-h-[300px] overflow-y-auto bg-white/80 dark:bg-gray-800/80">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 dark:border-gray-500 mx-auto mb-2"></div>
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.map((result) => (
                                                                                              <button
                                   key={result.id}
                                   onClick={() => handleResultClick(result)}
                                   className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                 >
                                {result.icon}
                                <div className="flex-1 text-left">
                                  <div className="text-gray-900 dark:text-white font-medium">{result.title}</div>
                                  <div className="text-gray-700 dark:text-gray-300 text-sm">{result.description}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : searchQuery ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No results found
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={openUserProfile}
                className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-xl hover:bg-white/30 dark:hover:bg-white/20 transition-colors overflow-hidden flex items-center justify-center"
              >
                <ProfilePictureUpload 
                  size="md"
                  showUploadButton={false}
                  className="w-full h-full rounded-xl"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 w-full bg-white dark:bg-gray-900 pt-[88px]">
        <div className="bg-white dark:bg-gray-900">
          {children}
        </div>
      </main>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={closeUserProfile}
      />

      {/* Feature Notification Popup */}
      {showFeatureNotification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowFeatureNotification(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Coming Soon!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                This feature is not yet implemented but serves as a demonstration of this app's overall scope and potential capabilities.
              </p>
              
              <button
                onClick={() => setShowFeatureNotification(false)}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all shadow-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Club Modal */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Close button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Join a Club
              </h3>
              <button
                onClick={closeAddClubModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleRequestToJoin} className="space-y-4">
              {/* Club Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Club Name
                </label>
                <input
                  type="text"
                  value={addClubForm.clubName}
                  onChange={(e) => handleAddClubFormChange('clubName', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter club name"
                />
              </div>

              {/* Club ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Club ID
                </label>
                <input
                  type="text"
                  value={addClubForm.clubId}
                  onChange={(e) => handleAddClubFormChange('clubId', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter club ID"
                />
              </div>

              {/* Member Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Member Name
                </label>
                <input
                  type="text"
                  value={addClubForm.memberName}
                  onChange={(e) => handleAddClubFormChange('memberName', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>

              {/* Member Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Member Email Address
                </label>
                <input
                  type="email"
                  value={addClubForm.memberEmail}
                  onChange={(e) => handleAddClubFormChange('memberEmail', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all shadow-lg mt-6"
              >
                Request to Join
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Sent Message */}
      {showRequestSentMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowRequestSentMessage(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Request Sent!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Your request to join the club has been submitted successfully. You'll be notified once it's reviewed.
              </p>
              
              <button
                onClick={() => setShowRequestSentMessage(false)}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation onNavigate={closeUserProfile} />
      </div>
    </div>
  );
};

export default Layout;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Bell, HelpCircle, LogOut, Bookmark, Moon, Sun, ArrowLeft, X } from 'lucide-react';
import { Linkedin } from 'lucide-react';
import UserHeader from './UserHeader';
import SettingsListItem from './SettingsListItem';
import BottomNavigation from './BottomNavigation';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ProfilePictureUpload from './ProfilePictureUpload';
import { isPortfolioDemo } from '../utils/portfolioDemo';
import AvatarManagementModal from './AvatarManagementModal';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPortfolioMessage, setShowPortfolioMessage] = useState(false);

  const handleLogout = () => {
    // Check if in portfolio demo mode
    if (isPortfolioDemo()) {
      setShowPortfolioMessage(true);
      return;
    }
    
    logout();
    onClose();
    navigate('/auth');
  };

  const profileOptions = [
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        onClose(); // Close the profile modal first
        navigate('/settings');
      },
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => {
        onClose(); // Close the profile modal first
        navigate('/notifications');
      },
      color: 'text-blue-600'
    },
    {
      icon: Bookmark,
      label: 'Saved Posts',
      action: () => {
        onClose(); // Close the profile modal first
        navigate('/saved-posts', { state: { referrer: '/' } });
      },
      color: 'text-purple-600'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => {
        onClose(); // Close the profile modal first
        navigate('/help');
      },
      color: 'text-orange-600'
    },
    {
      icon: isDarkMode ? Sun : Moon,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      action: toggleDarkMode,
      color: 'text-yellow-600'
    },
    {
      icon: Linkedin,
      label: 'Connect on LinkedIn',
      action: () => window.open('https://linkedin.com', '_blank'),
      color: 'text-blue-700'
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: handleLogout,
      color: 'text-red-600'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow mr-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h1>
      </div>

      {/* Content Container with Responsive Layout */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* User Info Section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 cursor-pointer relative" onClick={() => setShowAvatarModal(true)}>
                  <ProfilePictureUpload 
                    size="xl" 
                    showUploadButton={false}
                    allowDelete={false}
                    className="hover:opacity-80 transition-opacity"
                  />
                  {/* Edit indicator */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {user?.name || 'User'}
                  </h3>
                  {user?.major && user?.year && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {user.major} • {user.year}
                    </p>
                  )}
                  {user?.email && (
                    <p className="text-gray-500 dark:text-gray-500 text-sm">{user.email}</p>
                  )}
                  {user?.memberId && (
                    <p className="text-emerald-600 dark:text-emerald-500 text-sm font-semibold mt-2">
                      ID: {user.memberId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Options List */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Options</h4>
                <div className="space-y-2">
                  {profileOptions.map((option, index) => (
                    <SettingsListItem
                      key={index}
                      icon={<option.icon className={option.color} />}
                      label={option.label}
                      type="navigation"
                      onClick={option.action}
                      colorClass={option.color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* App Version */}
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              <p className="font-medium">Uniclub v1.0.0</p>
              <p className="mt-1">© 2025 Ashwin Thomas</p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation />
      </div>

      {/* Avatar Management Modal */}
      <AvatarManagementModal 
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
      />

      {/* Portfolio Demo Message Modal */}
      {showPortfolioMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowPortfolioMessage(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Sign Out Disabled
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                This function is disabled for portfolio demonstration purposes. You're viewing this app in demo mode to explore all features without authentication.
              </p>
              
              <button
                onClick={() => setShowPortfolioMessage(false)}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all shadow-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

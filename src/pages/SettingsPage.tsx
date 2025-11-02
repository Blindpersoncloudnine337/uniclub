import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, Shield, User, Globe, HelpCircle, Eye, Lock, Smartphone, Mail, Bookmark, ArrowLeft } from 'lucide-react';
import SettingsListItem from '../components/SettingsListItem';
import BottomNavigation from '../components/BottomNavigation';
import { useUser } from '../context/UserContext';
import { usePopup } from '../context/PopupContext';
import { useTheme } from '../context/ThemeContext';

interface SettingsPageProps {
  onBack?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { closeUserProfile, openUserProfile } = usePopup();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [faceId, setFaceId] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const handleSavedPostsClick = () => {
    navigate('/saved-posts');
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: isDarkMode ? <Moon className="text-yellow-500" /> : <Sun className="text-yellow-500" />,
          label: 'Dark Mode',
          type: 'toggle',
          value: isDarkMode,
          onChange: toggleDarkMode,
          colorClass: 'text-yellow-500'
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        { icon: <Bell className="text-emerald-600" />, label: 'All Notifications', type: 'toggle', value: notifications, onChange: setNotifications, colorClass: 'text-emerald-600' },
        { icon: <Mail className="text-emerald-600" />, label: 'Email Notifications', type: 'toggle', value: emailNotifications, onChange: setEmailNotifications, colorClass: 'text-emerald-600' },
        { icon: <Smartphone className="text-purple-500" />, label: 'Push Notifications', type: 'toggle', value: pushNotifications, onChange: setPushNotifications, colorClass: 'text-purple-500' }
      ]
    },
    {
      title: 'Security & Privacy',
      items: [
        { icon: <Eye className="text-emerald-600" />, label: 'Face ID', type: 'toggle', value: faceId, onChange: setFaceId, colorClass: 'text-emerald-600' },
        { icon: <Lock className="text-red-500" />, label: 'Biometric Authentication', type: 'toggle', value: biometrics, onChange: setBiometrics, colorClass: 'text-red-500' },
        { icon: <Shield className="text-red-500" />, label: 'Privacy Settings', type: 'navigation', onClick: () => {}, colorClass: 'text-red-500' }
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: <User className="text-emerald-600" />, label: 'Profile Settings', type: 'navigation', onClick: () => {}, colorClass: 'text-emerald-600' },
        { icon: <Bookmark className="text-blue-600" />, label: 'Saved Posts', type: 'navigation', onClick: handleSavedPostsClick, colorClass: 'text-blue-600' },
        { icon: <Globe className="text-emerald-600" />, label: 'Language & Region', type: 'navigation', onClick: () => {}, colorClass: 'text-emerald-600' },
        { icon: <Smartphone className="text-orange-500" />, label: 'Auto-Sync Data', type: 'toggle', value: autoSync, onChange: setAutoSync, colorClass: 'text-orange-500' }
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle className="text-purple-500" />, label: 'Help & FAQ', type: 'navigation', onClick: () => {}, colorClass: 'text-purple-500' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Back Navigation Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <button
            onClick={() => {
              if (onBack) {
                onBack(); // For overlay usage
              } else {
                navigate('/');
                openUserProfile();
              }
            }}
            className="flex items-center text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-medium">Back to Profile</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Settings Content */}
          <div className="space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <SettingsListItem
                      key={itemIndex}
                      icon={item.icon}
                      label={item.label}
                      type={item.type as 'toggle' | 'navigation'}
                      value={item.value}
                      onChange={item.onChange}
                      onClick={item.onClick}
                      colorClass={item.colorClass}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {/* App Version */}
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-t border-gray-200 dark:border-gray-700">
              <p className="font-medium">Uniclub v1.0.0</p>
              <p className="mt-1">© 2025 Ashwin Thomas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Full Width */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation onNavigate={closeUserProfile} />
      </div>
    </div>
  );
};

export default SettingsPage;

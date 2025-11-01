import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, User, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface ProfilePictureUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadButton?: boolean;
  allowDelete?: boolean;
  className?: string;
  onAvatarUpdate?: (avatar: string | null) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  size = 'md',
  showUploadButton = true,
  allowDelete = false,
  className = '',
  onAvatarUpdate
}) => {
  const { user, updateProfileImage } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef<boolean>(true);

  // Cleanup effect to track component mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Size configuration
  const sizeConfig = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const buttonConfig = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10', 
    xl: 'w-12 h-12'
  };

  // Upload file to backend API - PROPER implementation
  const uploadFileToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Please sign in to upload avatar');
    }

    const response = await fetch('/api/users/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    
    // Extract Base64 data from backend response
    if (data.avatar?.data) {
      return data.avatar.data; // This is the Base64 string from backend
    }
    
    throw new Error('No avatar data received from server');
  };

  // Handle successful file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    console.log('📤 Uploading file:', file.name);
    
    if (!mountedRef.current) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!mountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload successful:', data);
        
        // Refresh user profile data from backend to get the latest avatar
        try {
          const profileResponse = await fetch('/api/users/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success && profileData.user?.avatar?.data) {
              console.log('🔄 Refreshed profile data with new avatar');
              // Update the user context with fresh data
              await updateProfileImage(profileData.user.avatar.data);
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing profile data:', refreshError);
        }
        
        if (onAvatarUpdate) {
          onAvatarUpdate(data.avatar?.data || null);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('❌ Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      if (mountedRef.current) {
        setIsUploading(false);
        // Clear the input value to allow uploading the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  }, [updateProfileImage, onAvatarUpdate]);

  // Handle delete avatar
  const handleDeleteAvatar = async () => {
    // TODO: Replace with custom confirmation dialog
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    
    try {
      setIsUploading(true);
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please sign in to delete avatar');
      }

      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      // Update local user context
      await updateProfileImage(null);
      console.log('✅ Profile image deleted');
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file selection
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Get avatar source - SIMPLE implementation
  const getAvatarSrc = () => {
    if (user?.profileImage && typeof user.profileImage === 'string' && user.profileImage.startsWith('data:')) {
      return user.profileImage;
    }
    return null;
  };

  const avatarSrc = getAvatarSrc();

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Avatar Display */}
      <div className={`${sizeConfig[size]} relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 ${showUploadButton ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
           onClick={showUploadButton ? handleUploadClick : undefined}>
        
        {isUploading ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
            <div className="animate-spin rounded-full h-1/2 w-1/2 border-b-2 border-orange-500"></div>
          </div>
        ) : avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
            <User className="w-1/2 h-1/2 text-orange-600 dark:text-orange-400" />
          </div>
        )}

        {/* Upload overlay for larger sizes */}
        {showUploadButton && (size === 'lg' || size === 'xl') && !isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <Camera className="w-1/3 h-1/3 text-white" />
          </div>
        )}
      </div>

      {/* Upload Button for XL size */}
      {showUploadButton && size === 'xl' && !isUploading && (
        <button
          onClick={handleUploadClick}
          className={`absolute bottom-0 right-0 ${buttonConfig[size]} bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all`}
        >
          <Camera className="w-1/2 h-1/2" />
        </button>
      )}

      {/* Delete Button */}
      {allowDelete && avatarSrc && !isUploading && size === 'xl' && (
        <button
          onClick={handleDeleteAvatar}
          className="absolute top-0 right-0 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProfilePictureUpload; 
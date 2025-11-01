import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Trash2, Upload, ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface AvatarManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvatarManagementModal: React.FC<AvatarManagementModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfileImage } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Get current avatar
  const getCurrentAvatar = () => {
    if (user?.profileImage && typeof user.profileImage === 'string' && user.profileImage.startsWith('data:')) {
      return user.profileImage;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file upload to backend
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

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
              await updateProfileImage(profileData.user.avatar.data);
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing profile data:', refreshError);
        }
        
        setPreviewImage(null);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete avatar
  const handleDelete = async () => {
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

      await updateProfileImage(null);
      console.log('✅ Profile image deleted');
      onClose();
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset preview
  const resetPreview = () => {
    setPreviewImage(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag for positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (previewImage) {
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && previewImage) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  const currentAvatar = getCurrentAvatar();
  const displayImage = previewImage || currentAvatar;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="p-6">
          <div className="relative w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            {displayImage ? (
              <div
                ref={previewRef}
                className="w-full h-full relative cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={displayImage}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease'
                  }}
                />
                {previewImage && (
                  <div className="absolute inset-0 border-2 border-dashed border-white/50 pointer-events-none" />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No profile picture</p>
                </div>
              </div>
            )}
          </div>

          {/* Image Controls */}
          {previewImage && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 min-w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-2"
              >
                <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Upload New Photo */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!previewImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all"
                >
                  <Upload className="w-5 h-5" />
                  {isUploading ? 'Uploading...' : 'Upload New Photo'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={resetPreview}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all"
                  >
                    {isUploading ? 'Saving...' : 'Save Photo'}
                  </button>
                </div>
              )}
            </div>

            {/* Remove Photo */}
            {currentAvatar && !previewImage && (
              <button
                onClick={handleDelete}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Remove Photo
              </button>
            )}
          </div>

          {/* Help Text */}
          {previewImage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              <Move className="w-3 h-3 inline mr-1" />
              Drag to reposition • Use zoom controls to resize
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarManagementModal; 
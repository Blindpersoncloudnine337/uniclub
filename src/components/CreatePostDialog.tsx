import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Image, Smile, X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import EmojiPicker from './EmojiPicker';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  editMode?: boolean;
  editData?: {
    id: string;
    content: string;
    postType: 'text' | 'image' | 'video';
    media?: Array<{ url: string; type: string }>;
  };
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  editMode = false,
  editData
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  // DEBUG: Log user data for profile picture debugging
  console.log('🔍 CreatePostDialog user data:', {
    hasUser: !!user,
    userName: user?.name,
    hasProfileImage: !!user?.profileImage,
    profileImageLength: user?.profileImage?.length || 0,
    userKeys: user ? Object.keys(user) : []
  });
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markedForDeletion, setMarkedForDeletion] = useState<Array<{ url: string; type: string }>>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);


  const insertEmojiAtCursor = (emoji: string) => {
    const el = textAreaRef.current;
    if (!el) {
      setContent(prev => prev + emoji);
      // Don't close picker automatically - let user continue selecting emojis
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + emoji + content.slice(end);
    setContent(next);
    // Don't close picker automatically - let user continue selecting emojis
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };


  // Populate form when editing
  useEffect(() => {
    if (editMode && editData) {
      setContent(editData.content);
      setPostType(editData.postType);
      // Reset marked for deletion when opening edit mode
      setMarkedForDeletion([]);
      // Note: Media files would need to be handled differently for editing
    }
  }, [editMode, editData]);

  // Get existing media count for display (accounting for marked for deletion images)
  const existingMediaCount = editMode && editData?.media ? editData.media.length - markedForDeletion.length : 0;
  const totalMediaCount = existingMediaCount + selectedFiles.length;
  const maxMediaAllowed = 4;
  
  // Log current state for debugging
  useEffect(() => {
    if (editMode) {
      console.log('📊 Edit mode state:', {
        existingMedia: existingMediaCount,
        newFiles: selectedFiles.length,
        totalMedia: totalMediaCount,
        maxAllowed: maxMediaAllowed,
        availableSlots: maxMediaAllowed - totalMediaCount,
        canAddMore: totalMediaCount < maxMediaAllowed
      });
    }
  }, [editMode, existingMediaCount, selectedFiles.length, totalMediaCount, maxMediaAllowed]);
  
  // Function to mark existing media for deletion
  const handleMarkForDeletion = (indexToMark: number) => {
    if (editData?.media) {
      const imageToMark = editData.media[indexToMark];
      
      // Check if already marked for deletion
      if (markedForDeletion.some(img => img.url === imageToMark.url)) {
        // Unmark it (user changed their mind)
        setMarkedForDeletion(prev => prev.filter(img => img.url !== imageToMark.url));
        console.log('✅ Image unmarked for deletion:', imageToMark.url);
      } else {
        // Mark it for deletion
        setMarkedForDeletion(prev => [...prev, imageToMark]);
        console.log('🗑️ Image marked for deletion:', imageToMark.url);
      }
      
      console.log('📊 Marked for deletion count:', markedForDeletion.length);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Check if adding these files would exceed the limit
      const availableSlots = maxMediaAllowed - existingMediaCount;
      const totalAfterAdding = existingMediaCount + files.length;
      
      console.log('📁 File selection validation:', {
        selectedFiles: files.length,
        existingMedia: existingMediaCount,
        availableSlots,
        totalAfterAdding,
        maxAllowed: maxMediaAllowed
      });
      
      if (totalAfterAdding > maxMediaAllowed) {
        const excess = totalAfterAdding - maxMediaAllowed;
        const allowedToAdd = maxMediaAllowed - existingMediaCount;
        
        if (allowedToAdd <= 0) {
          alert(`Maximum ${maxMediaAllowed} images already reached. Remove some existing images first.`);
        } else {
          alert(`Maximum ${maxMediaAllowed} images allowed per post. You can add ${allowedToAdd} more images. Only the first ${allowedToAdd} will be selected.`);
          // Select only the allowed number of files
          const limitedFiles = files.slice(0, allowedToAdd);
          setSelectedFiles(limitedFiles);
          setPostType(limitedFiles[0].type.startsWith('video/') ? 'video' : 'image');
        }
        return;
      }
      
      // All files can be added
      setSelectedFiles(files);
      setPostType(files[0].type.startsWith('video/') ? 'video' : 'image');
      
      console.log('✅ Files selected successfully:', {
        added: files.length,
        newTotal: totalAfterAdding,
        remainingSlots: maxMediaAllowed - totalAfterAdding
      });
    }
  };



  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      // Helper: update cached lists immediately so UI reflects changes without full refetch
      const applyUpdatedPostToCaches = (updatedPost: any) => {
        if (!updatedPost) return;
        // socialPosts (object with posts array)
        queryClient.setQueryData(['socialPosts'], (prev: any) => {
          if (!prev) return prev;
          if (Array.isArray(prev)) {
            return prev.map((p: any) => (p._id === updatedPost._id ? updatedPost : p));
          }
          if (prev.posts && Array.isArray(prev.posts)) {
            return {
              ...prev,
              posts: prev.posts.map((p: any) => (p._id === updatedPost._id ? updatedPost : p)),
            };
          }
          return prev;
        });

        // socialFeed (if present)
        queryClient.setQueryData(['socialFeed'], (prev: any) => {
          if (!prev) return prev;
          if (Array.isArray(prev)) {
            return prev.map((p: any) => (p._id === updatedPost._id ? updatedPost : p));
          }
          if (prev.posts && Array.isArray(prev.posts)) {
            return {
              ...prev,
              posts: prev.posts.map((p: any) => (p._id === updatedPost._id ? updatedPost : p)),
            };
          }
          return prev;
        });

        // trendingPosts
        queryClient.setQueryData(['trendingPosts'], (prev: any) => {
          if (!prev) return prev;
          if (Array.isArray(prev)) {
            return prev.map((p: any) => (p._id === updatedPost._id ? updatedPost : p));
          }
          if (prev.posts && Array.isArray(prev.posts)) {
            return {
              ...prev,
              posts: prev.posts.map((p: any) => (p._id === updatedPost._id ? updatedPost : p)),
            };
          }
          return prev;
        });

        // specific post cache if used
        if (editData?.id) {
          queryClient.setQueryData(['socialPost', editData.id], updatedPost);
        }
      };
      if (editMode && editData) {
        // Edit existing post - handle media files properly
        if (selectedFiles.length > 0) {
          // If new files are selected, send them as FormData
          const formData = new FormData();
          formData.append('content', content.trim());
          formData.append('postType', postType);
          
          // Add new media files
          selectedFiles.forEach((file, index) => {
            formData.append('media', file);
          });
          
                     // Add information about images marked for deletion
           if (markedForDeletion.length > 0) {
             formData.append('imagesToDelete', JSON.stringify(markedForDeletion.map(img => img.url)));
             console.log('🗑️ Sending images to delete:', markedForDeletion.map(img => img.url));
           }
          
          console.log('📤 Editing post with new media files:', {
            content: content.trim(),
            newFilesCount: selectedFiles.length,
            existingMediaCount: existingMediaCount,
            totalMediaCount: totalMediaCount,
                         imagesToDelete: markedForDeletion.length
          });
          
                     console.log('📤 Sending FormData with:', {
             content: content.trim(),
             newFilesCount: selectedFiles.length,
             imagesToDelete: markedForDeletion.length > 0 ? markedForDeletion.map(img => img.url) : 'none'
           });
           
           const response = await api.put(`/api/social/posts/${editData.id}`, formData, {
             headers: {
               'Content-Type': 'multipart/form-data',
             },
           });
          
          // Check if the response indicates success
          const isSuccess = response.data.success || response.data.message === 'Post updated successfully' || response.status === 200;
          
          if (isSuccess) {
            console.log('✅ Post updated successfully with new media');
            console.log('📥 Response data:', response.data);
            
            // Immediately update caches to reflect new media
            applyUpdatedPostToCaches(response.data.post);

            // Force immediate refetch of the specific post to get updated media URLs
            try {
              // Invalidate and refetch social posts for edit mode
              await queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
              await queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
              await queryClient.invalidateQueries({ queryKey: ['trendingPosts'] });
              
              // Force refetch the specific post if we have its data
              if (response.data.post) {
                await queryClient.setQueryData(['socialPost', editData.id], response.data.post);
              }
              
              console.log('🔄 Queries invalidated and refetched');
            } catch (refetchError) {
              console.warn('⚠️ Error during query invalidation:', refetchError);
            }
            
            // Small delay to ensure queries are refetched before closing
            setTimeout(() => {
              onClose();
              onPostCreated?.();
            }, 500);
          } else {
            throw new Error(response.data.error || response.data.message || 'Failed to update post');
          }
                 } else {
           // No new files, but might have removed images
           const updateData: any = {
             content: content.trim(),
             postType: postType
           };
           
           // Add information about images marked for deletion if any
           if (markedForDeletion.length > 0) {
             updateData.imagesToDelete = markedForDeletion.map(img => img.url);
             console.log('🗑️ Sending images to delete (content-only):', markedForDeletion.map(img => img.url));
           }
           
           console.log('📤 Sending content-only update with:', updateData);
           
           const response = await api.put(`/api/social/posts/${editData.id}`, updateData);

          // Check if the response indicates success (handle different response formats)
          const isSuccess = response.data.success || response.data.message === 'Post updated successfully' || response.status === 200;
          
          if (isSuccess) {
            console.log('✅ Post content updated successfully');
            console.log('📥 Response data:', response.data);
            
            // Immediately update caches to reflect content/media removals
            applyUpdatedPostToCaches(response.data.post);

            // Force immediate refetch of the specific post
            try {
              // Invalidate and refetch social posts for edit mode
              await queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
              await queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
              await queryClient.invalidateQueries({ queryKey: ['trendingPosts'] });
              
              // Force refetch the specific post if we have its data
              if (response.data.post) {
                await queryClient.setQueryData(['socialPost', editData.id], response.data.post);
              }
              
              console.log('🔄 Queries invalidated and refetched');
            } catch (refetchError) {
              console.warn('⚠️ Error during query invalidation:', refetchError);
            }
            
            // Small delay to ensure queries are refetched before closing
            setTimeout(() => {
              onClose();
              onPostCreated?.();
            }, 500);
          } else {
            throw new Error(response.data.error || response.data.message || 'Failed to update post');
          }
        }
      } else {
        // Create new post
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('postType', postType);
        formData.append('visibility', 'club-members');

        // Add media files if any
        console.log('📤 Adding files to FormData:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
        selectedFiles.forEach((file, index) => {
          formData.append('media', file);
        });
        
        console.log('📤 FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        const response = await api.post('/api/social/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('📥 Response received:', response.data);

        if (response.data.success) {
          console.log('✅ Post created successfully:', response.data);
          
          // Invalidate and refetch social posts
          await queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
          await queryClient.invalidateQueries({ queryKey: ['trendingPosts'] });

          // Reset form and close dialog
          setContent('');
          setSelectedFiles([]);
          setPostType('text');
          onClose();
          onPostCreated?.();
        } else {
          throw new Error(response.data.error || 'Failed to create post');
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      // Show error message to user
      alert(editMode ? 'Failed to update post. Please try again.' : 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Post' : 'Create Post'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-1 relative">
              <textarea
                ref={textAreaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="What's on your mind about AI?"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={4}
              />
              
              {/* Emoji Picker - Positioned relative to entire textarea container */}
              {showEmojiPicker && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50">
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onEmojiSelect={insertEmojiAtCursor}
                    triggerRef={emojiButtonRef}
                  />
                </div>
              )}
              

              
              {/* Combined media display (existing + new) */}
              {(existingMediaCount > 0 || selectedFiles.length > 0) && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {editMode ? 'Post Images' : 'Selected Images'}
                    </span>
                                                            <span className={`text-xs font-medium ${
                      totalMediaCount >= maxMediaAllowed 
                        ? 'text-red-500 dark:text-red-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {totalMediaCount}/{maxMediaAllowed} images
                      {totalMediaCount >= maxMediaAllowed && ' (Limit reached)'}
                    </span>
                                     </div>
                   

                   
                                      {/* Existing images */}
                   {editMode && editData?.media && editData.media.length > 0 && (
                     <div className="grid grid-cols-2 gap-2 mb-2">
                                               {editData.media.map((item, index) => (
                         <div key={`existing-${index}`} className="relative">
                                                     {item.type === 'image' ? (
                             <img 
                               src={item.url} 
                               alt={`Existing image ${index + 1}`}
                               className={`w-full h-24 object-cover rounded-lg border transition-all duration-200 ${
                                 markedForDeletion.some(img => img.url === item.url)
                                   ? 'border-red-400 dark:border-red-500 grayscale opacity-60'
                                   : 'border-gray-200 dark:border-gray-600'
                               }`}
                             />
                          ) : (
                            <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Video
                              </span>
                            </div>
                          )}
                                                                                <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1}
                            </div>
                           <button
                             type="button"
                             onClick={() => handleMarkForDeletion(index)}
                             className={`absolute top-2 right-2 p-1 rounded-full text-white transition-all duration-200 ${
                               markedForDeletion.some(img => img.url === item.url)
                                 ? 'bg-green-500 hover:bg-green-600'
                                 : 'bg-red-500 hover:bg-red-600'
                             }`}
                             title={markedForDeletion.some(img => img.url === item.url) ? 'Unmark for deletion' : 'Mark for deletion'}
                           >
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* New selected files */}
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative">
                          {file.type.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="New image" 
                              className="w-full h-24 object-cover rounded-lg border border-emerald-200 dark:border-emerald-600"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-emerald-200 dark:border-emerald-600">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Video: {file.name}
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 relative">
                <div className="flex items-center space-x-2">
                  <label className={`p-2 rounded-full transition-colors ${
                    totalMediaCount >= maxMediaAllowed 
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                    <Image className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={totalMediaCount >= maxMediaAllowed}
                      className="hidden"
                    />
                  </label>
                  {totalMediaCount < maxMediaAllowed ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{maxMediaAllowed - totalMediaCount} more
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                      Limit reached
                    </span>
                  )}
                  <div className="relative overflow-visible">
                    <button
                      ref={emojiButtonRef}
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <button
                   type="submit"
                   disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting || (editMode && content === editData?.content && selectedFiles.length === 0 && markedForDeletion.length === 0)}
                   className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   title={editMode && content === editData?.content && selectedFiles.length === 0 && markedForDeletion.length === 0 ? 'No changes made' : ''}
                 >
                   {isSubmitting ? (editMode ? 'Updating...' : 'Posting...') : (editMode ? 'Update Post' : 'Post')}
                 </button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </>);
};

export default CreatePostDialog; 
import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Smile } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import EmojiPicker from './EmojiPicker';
import api from '../lib/axios';

interface CommentInputProps {
  onSubmit?: (content: string) => Promise<void>;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  contentType?: string;
  contentId?: string;
  onCommentAdded?: () => void; // Callback after successful comment submission
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  loading = false,
  disabled = false,
  className = "",
  contentType,
  contentId,
  onCommentAdded
}) => {
  const { user } = useUser();
  const { getAuthHeaders } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);

  const insertEmojiAtCursor = (emoji: string) => {
    const el = inputRef.current;
    if (!el) {
      setContent(prev => prev + emoji);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + emoji + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      el.focus();
      el.setSelectionRange(pos, pos);
      autoResize(); // Auto-resize after emoji insertion
    });
  };

  const autoResize = () => {
    const textarea = inputRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height based on scrollHeight with min/max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120); // Min 44px, Max 120px (about 4 lines)
      textarea.style.height = `${newHeight}px`;
    }
  };

  const getAvatarSrc = () => {
    // Use the same logic as ProfilePictureUpload component
    if (user?.profileImage && typeof user.profileImage === 'string' && user.profileImage.startsWith('data:')) {
      return user.profileImage;
    }
    
    if (user?.name) {
      // Generate a simple avatar based on user's name
      const name = user.name;
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      const colorIndex = name.charCodeAt(0) % colors.length;
      const color = colors[colorIndex];
      
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${color}"/>
          <text x="20" y="26" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${initials}</text>
        </svg>
      `)}`;
    }
    
    // Default avatar
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#6b7280"/>
        <text x="20" y="26" font-family="Arial" font-size="14" fill="white" text-anchor="middle">?</text>
      </svg>
    `)}`;
  };

  const handleSubmit = async () => {
    if (!content.trim() || submitting || disabled) return;

    try {
      setSubmitting(true);
      
      if (onSubmit) {
        // Use custom onSubmit if provided
        await onSubmit(content.trim());
      } else if (contentType && contentId) {
        // Use direct API submission
        const response = await api.post(`/api/comments/${contentType}/${contentId}`, {
          content: content.trim()
        });
        
        console.log('✅ Comment submitted successfully:', response.data);
        
        // Call callback if provided
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        throw new Error('Either onSubmit or contentType/contentId must be provided');
      }
      
      setContent(''); // Clear the input after successful submission
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Don't clear the content on error so user can retry
    } finally {
      setSubmitting(false);
    }
  };


  // Hide success message after 2 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Auto-resize when content changes
  useEffect(() => {
    autoResize();
  }, [content]);

  // Initial auto-resize on mount
  useEffect(() => {
    autoResize();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };



  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar - smaller size */}
        <div className="flex-shrink-0 pt-1">
          <img 
            src={getAvatarSrc()} 
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
          />
        </div>
        
        {/* Input container - full width */}
        <div className="flex-1 min-w-0">
          <div className="relative overflow-visible">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                autoResize();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              disabled={disabled || submitting}
              rows={1}
              className="w-full py-3 px-4 pr-24 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm resize-none overflow-hidden"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            {/* Emoji Button */}
            <div className="absolute right-16 top-[22px] transform -translate-y-1/2">
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => setShowEmojiPicker(prev => !prev)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            
            {/* Emoji Picker - Positioned relative to entire input field */}
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
            
            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting || disabled}
              className="absolute right-3 top-[22px] transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              title="Send comment"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
          Comment posted!
        </div>
      )}
    </div>
  );
};

export default CommentInput;

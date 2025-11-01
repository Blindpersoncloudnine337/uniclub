import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit, Trash, MessageCircle, User, Clock } from 'lucide-react';
import { Comment } from '../hooks/useComments';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

interface CommentListProps {
  comments: Comment[];
  loading?: boolean;
  // REMOVED onLike - no comment likes allowed
  // REMOVED onReply - no replies allowed
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  currentUser?: any;
}

interface CommentItemProps {
  comment: Comment;
  // REMOVED onLike - no comment likes allowed
  // REMOVED onReply - no replies allowed
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  isReply?: boolean; // Keep for styling but always false now
  currentUser?: any;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  // REMOVED onLike parameter - no comment likes allowed
  // REMOVED onReply parameter - no replies allowed
  onEdit,
  onDelete,
  isReply = false,
  currentUser
}) => {
  // REMOVED reply state - no replies allowed
  // REMOVED like state - no comment likes allowed
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.text);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // DEBUG: Log user ID matching for delete button visibility
  const currentUserId = currentUser?.id || currentUser?._id;
  const commentAuthorId = comment.userId._id || comment.userId.id || comment.userId;
  
  // Convert both IDs to strings for comparison
  const currentUserIdStr = String(currentUserId);
  const commentAuthorIdStr = String(commentAuthorId);
  
  const isAuthor = currentUser && currentUserIdStr === commentAuthorIdStr;
  
  console.log('🔍 DEBUG - CommentList user matching:', {
    currentUser,
    currentUserId: currentUserId,
    currentUserIdStr: currentUserIdStr,
    commentAuthorId: commentAuthorId,
    commentAuthorIdStr: commentAuthorIdStr,
    commentUserName: comment.userId.name,
    isAuthor: isAuthor,
    stringComparison: `"${currentUserIdStr}" === "${commentAuthorIdStr}"`,
    exactMatch: currentUserIdStr === commentAuthorIdStr
  });
  
  const isDeleted = comment.status === 'deleted';

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getAvatarSrc = () => {
    if (comment.userId.profile?.avatar?.data) {
      return comment.userId.profile.avatar.data;
    }
    // Generate a simple avatar based on user's name
    const name = comment.userId.name;
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
  };

  // REMOVED handleLike - no comment likes allowed

  // REMOVED handleReply - no replies allowed

  const handleEdit = async () => {
    if (!editContent.trim() || !onEdit) return;
    try {
      await onEdit(comment._id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(comment._id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Error handling is done in the parent component
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <div className="mb-6">
      {/* Clean comment card with proper spacing */}
      <div className="flex space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        {/* Smaller Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
          <AvatarImage 
            src={comment.userId.profile?.avatar?.data} 
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold text-xs">
            {getInitials(comment.userId.name)}
          </AvatarFallback>
        </Avatar>

        {/* Comment Content - Full width */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Author and timestamp row - Name left, Date right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{comment.userId.name}</h4>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Date aligned to the right - smaller */}
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center flex-shrink-0">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimestamp(comment.createdAt)}
              </span>
              
              {/* Actions menu for author */}
              {isAuthor && !isDeleted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 dark:text-red-400">
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Comment text or edit form - HERO CONTENT */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] resize-none w-full"
                placeholder="Edit your comment..."
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.text);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
              {isDeleted ? (
                <em className="text-gray-500 dark:text-gray-400">This comment was deleted</em>
              ) : (
                <p className="break-words text-base font-normal">{comment.text}</p>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading,
  // REMOVED onLike parameter - no comment likes allowed
  // REMOVED onReply parameter - no replies allowed
  onEdit,
  onDelete,
  onLoadMore,
  hasMore,
  currentUser
}) => {
  // Use passed currentUser instead of useAuth hook
  const user = currentUser;

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No comments yet</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          Start the conversation! Share your thoughts and engage with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          // REMOVED onLike prop - no comment likes allowed
          // REMOVED onReply prop
          onEdit={onEdit}
          onDelete={onDelete}
          currentUser={user}
        />
      ))}
      
      {/* Load more button */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'View more comments'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentList;

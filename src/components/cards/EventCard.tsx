import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock } from 'lucide-react';
import InteractionButtons from '../InteractionButtons';

interface EventCardProps {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  attendeeCount?: number;
  rsvpCount?: number;
  discussionCount?: number;
  imageUrl?: string;
  category?: string;
  eventType?: string;
  isFeatured?: boolean;
  isCompact?: boolean;
  isEventsPage?: boolean; // Special flag for Events page styling
  allowAdaptiveImage?: boolean; // Allow poster to adapt to natural size
  // Engagement data will be fetched by useEngagement hook in InteractionButtons
}

const EventCard: React.FC<EventCardProps> = ({ 
  id,
  title, 
  description,
  date, 
  time, 
  location, 
  attendeeCount = 0,
  rsvpCount = 0,
  discussionCount = 0,
  imageUrl,
  category,
  eventType = 'Workshop',
  isFeatured = false,
  isCompact = false,
  isEventsPage = false,
  allowAdaptiveImage = false
}) => {
  const navigate = useNavigate();
  const currentLocation = useLocation();

  // DEBUG: Log event data
  console.log('📅 EventCard DEBUG:', {
    id,
    title: title.substring(0, 30) + '...',
    discussionCount,
    rsvpCount,
    attendeeCount
  });

  const handleEventClick = () => {
    if (id) {
      navigate(`/event/${id}`, {
        state: { referrer: currentLocation.pathname }
      });
    } else {
      const eventId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/event/${eventId}`, {
        state: { referrer: currentLocation.pathname }
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      Workshop: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      Masterclass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Tutorial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Meetup: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      Hackathon: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      Seminar: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      Social: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
    };
    return colors[type as keyof typeof colors] || colors.Workshop;
  };

  const handleCommentsClick = () => {
    if (id) {
      navigate(`/comments/event/${id}`, {
        state: { referrer: currentLocation.pathname }
      });
    } else {
      navigate(`/comments/event/${encodeURIComponent(title)}`, {
        state: { referrer: currentLocation.pathname }
      });
    }
  };

  const displayAttendeeCount = rsvpCount || attendeeCount;

  return (
    <div className="group relative bg-white dark:bg-[#00281B] border border-emerald-300 dark:border-green-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-400 dark:hover:border-green-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 animate-fade-up">
      {imageUrl && (
        <div 
          className={`${
            allowAdaptiveImage 
              ? 'h-auto min-h-[250px] sm:min-h-[350px]' 
              : isFeatured 
                ? 'h-80 sm:h-96' 
                : eventType === 'Workshop' 
                  ? 'h-72 sm:h-80' 
                  : 'h-48'
          } bg-gray-100 dark:bg-gray-800 relative overflow-hidden cursor-pointer`}
          onClick={handleEventClick}
        >
          <img 
            src={imageUrl} 
            alt={title}
            className={`w-full ${allowAdaptiveImage ? 'h-auto max-h-[500px]' : 'h-full'} object-contain transition-transform duration-500 group-hover:scale-105`}
            onError={(e) => {
              console.log('Image failed to load:', imageUrl);
              console.log('Error:', e);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border border-emerald-400/20">
            {category}
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-500 font-semibold mb-3 flex-wrap">
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{date}</span>
          </div>
          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></span>
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{time}</span>
          </div>
        </div>

        <h3 
          className={`font-bold text-gray-900 dark:text-white leading-tight mb-3 line-clamp-2 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors ${
            isFeatured ? 'text-lg' : 'text-base'
          }`}
          onClick={handleEventClick}
        >
          {title}
        </h3>

        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{location}</span>
        </div>
        
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span>{displayAttendeeCount} attending</span>
        </div>
        
        {/* Enhanced Interaction Buttons */}
        <InteractionButtons
          contentType="Event"
          contentId={id || title}
          onCommentClick={handleCommentsClick}
          shareTitle={title}
          shareType="event"
          layout="horizontal"
          size="md"
          cardType="event"
        />
      </div>
    </div>
  );
};

export default EventCard;

import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';
import InteractionButtons from '../components/InteractionButtons';
import BackNavigation from '../components/BackNavigation';

const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Get referrer from navigation state, default to /events
  const referrer = location.state?.referrer || '/events';

  // Fetch event data from API
  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('No event ID provided');
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      const data = await response.json();
      const event = data.event;
      
      // DEBUG: Log event data
      console.log('📅 EventDetailPage API Response:', {
        title: event.title?.substring(0, 30) + '...',
        id: event._id
      });
      
      return event;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(referrer)}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Event Details</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(referrer)}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Event Details</h1>
          </div>
        </div>

        <div className="px-4 py-6 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <h3 className="text-lg font-semibold mb-2">Event not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The event you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Format event data
  const event = {
    id: eventData._id,
    title: eventData.title,
    date: new Date(eventData.startDate).toLocaleDateString(),
    time: `${new Date(eventData.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(eventData.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    location: eventData.location?.room || eventData.location?.address || 'TBD',
    description: eventData.description,
    fullDescription: eventData.description,
    eventType: eventData.eventType,
    rsvpCount: eventData.rsvpCount || 0,
    maxCapacity: eventData.maxCapacity,
    instructor: eventData.organizer?.name || 'TBD',
    imageUrl: eventData.imageUrl || `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop`,
    tags: eventData.tags || [],
    category: eventData.category?.[0] || 'AI/ML',
    skillLevel: eventData.skillLevel,
    prerequisites: eventData.prerequisites || [],
    rsvpLink: eventData.rsvpLink,
    // Include engagement stats from API response
    likeCount: eventData.likeCount || 0,
    shareCount: eventData.shareCount || 0,
    saveCount: eventData.saveCount || 0,
    commentCount: eventData.commentCount || 0
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Back Navigation Header */}
      <BackNavigation
        referrer={referrer}
        contentType="event"
        fallbackReferrer="/events"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Event Image - Responsive sizing */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 inline-block">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full sm:w-full md:max-w-xs lg:max-w-sm h-auto object-cover"
          />
        </div>

        {/* Event Info */}
        <div className="space-y-4">
          {/* Event Type Badge */}
          <span className="inline-block bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
            {event.eventType}
          </span>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {event.title}
          </h1>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span className="text-sm">{event.date}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span className="text-sm">{event.time}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="text-sm">{event.location}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="text-sm">
                {event.rsvpCount}
                {event.maxCapacity && `/${event.maxCapacity}`} attending
              </span>
            </div>

            {event.skillLevel && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-sm">{event.skillLevel}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Section - Before About this event section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <InteractionButtons
            contentType="Event"
            contentId={id || 'event'}
            onCommentClick={() => navigate(`/comments/event/${id}`, { 
              state: { referrer: location.pathname }
            })}
            shareTitle={event.title}
            shareType="event"
            layout="horizontal"
            size="md"
            showSave={true}
            showBorder={false}
            noBg={true}
          />
        </div>

        {/* Description */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About this event</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {event.fullDescription}
          </p>
        </div>

        {/* Prerequisites */}
        {event.prerequisites.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Prerequisites</h3>
            <ul className="space-y-2">
              {event.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructor */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Organizer</h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {event.instructor.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{event.instructor}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Event Organizer</p>
            </div>
          </div>
        </div>



        {/* RSVP Button */}
        <div className="sticky bottom-4">
          <button 
            onClick={() => {
              if (event.rsvpLink) {
                window.open(event.rsvpLink, '_blank', 'noopener,noreferrer');
              } else {
                console.log('No RSVP link available for event');
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-xl transition-all duration-200 font-medium text-sm"
          >
            RSVP for Event
            {event.rsvpLink && <ExternalLink className="w-4 h-4" />}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/cards/EventCard';
import CalendarView from '../components/CalendarView';
import PastEventCard from '../components/cards/PastEventCard';
import { transformToEventCard, MongoEvent } from '../utils/eventTransform';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Fetch events from API instead of using hardcoded data
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/events?upcoming=true&status=published');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      const events = data.events || data;
      
      // DEBUG: Log API response
      console.log('📅 EventsPage API Response:', events.map((e: any) => ({
        title: e.title?.substring(0, 30) + '...',
        id: e._id,
        rsvpCount: e.rsvpCount
      })));
      
      return events;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Fetch past events
  const { data: pastEventsData, isLoading: pastEventsLoading } = useQuery({
    queryKey: ['past-events'],
    queryFn: async () => {
      const response = await fetch('/api/past-events');
      if (!response.ok) throw new Error('Failed to fetch past events');
      const data = await response.json();
      return data.success ? data.data : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  // Raw events data for calendar view
  const rawEvents: MongoEvent[] = eventsData || [];

  // Transform API data to match EventCard props for list view
  const upcomingEvents = rawEvents.map(transformToEventCard);

  // Calculate total RSVPs from all events
  const totalRSVPs = upcomingEvents.reduce((sum: number, event: any) => sum + (event.rsvpCount || 0), 0);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          
          {/* View Mode Toggle */}
          <div className="flex bg-emerald-100 dark:bg-[#00281B] rounded-lg p-1 border border-emerald-300 dark:border-green-800">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2z" />
              </svg>
              Calendar
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#00281B] rounded-lg p-4 text-center card-shadow border border-emerald-200 dark:border-green-800">
            <div className="text-2xl font-bold text-emerald-600 mb-1">{upcomingEvents.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Upcoming</div>
          </div>
          <div className="bg-white dark:bg-[#00281B] rounded-lg p-4 text-center card-shadow border border-emerald-200 dark:border-green-800">
            <div className="text-2xl font-bold text-emerald-600 mb-1">{totalRSVPs}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total RSVPs</div>
          </div>
          <div className="bg-white dark:bg-[#00281B] rounded-lg p-4 text-center card-shadow border border-emerald-200 dark:border-green-800">
            <div className="text-2xl font-bold text-emerald-600 mb-1">{upcomingEvents.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">This Month</div>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-emerald-300 dark:border-gray-700 rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Failed to load events. Please try again later.</p>
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No upcoming events scheduled.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back later for new events!</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} {...event} isEventsPage={true} allowAdaptiveImage={true} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <CalendarView events={rawEvents} />
        </div>
      )}

      {/* Past Events Section */}
      {viewMode === 'list' && (
        <div className="mt-12">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Past Events</h2>
            </div>
          </div>

          {pastEventsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
                  <div className="w-full min-h-[200px] bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : pastEventsData && pastEventsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEventsData.map((event: any) => (
                <PastEventCard
                  key={event._id}
                  id={event._id}
                  title={event.title}
                  subtitle={event.subtitle}
                  poster={event.poster}
                  onClick={() => navigate(`/past-events/${event._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No past events yet.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Check back later for event highlights!</p>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;

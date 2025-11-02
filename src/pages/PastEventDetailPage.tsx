import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Users, Tag, ExternalLink } from 'lucide-react';
import EventGallery from '../components/EventGallery';

const PastEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['past-event', id],
    queryFn: async () => {
      const response = await fetch(`/api/past-events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch past event');
      const data = await response.json();
      return data.success ? data.data : null;
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The past event you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/events')}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format the date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Split body into paragraphs for better display
  const paragraphs = event.body.split('\n\n').filter(p => p.trim());

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen overflow-x-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto w-full overflow-hidden">
          {/* Back Button */}
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-500 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>

          {/* Poster */}
          <div className="rounded-2xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-700 w-full">
            {event.poster?.data ? (
              <img 
                src={event.poster.data} 
                alt={event.title}
                className="w-full h-auto object-cover max-w-full"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 break-words">
              {event.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 break-words">
              {event.subtitle}
            </p>

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">{formattedDate}</span>
              </div>

              {event.attendance > 0 && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Users className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm">{event.attendance} attendees</span>
                </div>
              )}

              {event.category && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Tag className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm">{event.category}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Body Content */}
            <div className="prose dark:prose-invert max-w-none break-words overflow-wrap-anywhere">
              {paragraphs.map((paragraph, index) => {
                // Replace long Unicode separators with horizontal rules
                const processedParagraph = paragraph
                  .replace(/━{20,}/g, '') // Remove long Unicode separators
                  .replace(/─{20,}/g, '') // Remove dash separators
                  .replace(/═{20,}/g, '') // Remove double-line separators
                  .trim();
                
                // Check if this paragraph should have a separator above it
                const needsSeparator = index > 0 && 
                  paragraph.match(/^[━─═]{10,}/); // Check if it was a separator
                
                return (
                  <React.Fragment key={index}>
                    {needsSeparator && (
                      <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
                    )}
                    {processedParagraph && (
                      <div className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed whitespace-normal break-words word-break">
                        {processedParagraph}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Recording/Video Link */}
          {event.link && (
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Event Recording Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Watch the recording of this event to catch up on what you missed!
                  </p>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch Recording
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Event Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <EventGallery eventId={id!} gallery={event.gallery} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PastEventDetailPage;


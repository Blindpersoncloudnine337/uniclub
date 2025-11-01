import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface CalendarViewProps {
  events: Array<{
    id?: string;
    _id?: string;
    title: string;
    startDate: string;
    endDate: string;
    eventType?: string;
    category?: string[];
    description?: string;
  }>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const navigate = useNavigate();

  // Transform MongoDB events to calendar format
  const calendarEvents: CalendarEvent[] = events.map(event => ({
    id: event.id || event._id || '',
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    resource: {
      eventType: event.eventType,
      category: event.category,
      description: event.description,
    },
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/event/${event.id}`);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = event.resource?.eventType;
    
    // Different colors for different event types while maintaining emerald theme
    let backgroundColor = '#10b981'; // emerald-500 default
    
    switch (eventType) {
      case 'Workshop':
        backgroundColor = '#10b981'; // emerald-500
        break;
      case 'Seminar':
        backgroundColor = '#059669'; // emerald-600
        break;
      case 'Hackathon':
        backgroundColor = '#047857'; // emerald-700
        break;
      case 'Meetup':
        backgroundColor = '#34d399'; // emerald-400
        break;
      case 'Bootcamp':
        backgroundColor = '#065f46'; // emerald-800
        break;
      default:
        backgroundColor = '#10b981'; // emerald-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
      }
    };
  };

  return (
    <div className="calendar-container relative bg-white dark:bg-gray-900">
      <style>{`
        /* Professional Calendar Styling - Emerald Theme Integration */
        .rbc-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: transparent;
          border: none;
          height: 100%;
        }

        /* Hide/remove non-functional elements */
        .rbc-btn-group .rbc-toolbar button:last-child {
          display: none; /* Hide month/week/day view switcher */
        }

        /* Professional Toolbar - Dark Theme */
        .rbc-toolbar {
          background-color: #f9fafb !important;
          background-image: none !important;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 20px 24px;
          margin-bottom: 0;
          align-items: center;
          justify-content: space-between;
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          gap: 16px;
        }

        /* Dark mode toolbar */
        .dark .rbc-toolbar {
          background-color: #00281B !important;
          border-bottom: 1px solid #065f46;
        }

        /* Navigation buttons - Dark theme */
        .rbc-toolbar button,
        .rbc-btn {
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          color: #6b7280 !important;
          border-radius: 0.5rem !important;
          padding: 0 !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Dark mode navigation buttons */
        .dark .rbc-toolbar button,
        .dark .rbc-btn {
          color: #9ca3af !important;
        }

        .rbc-toolbar button:hover,
        .rbc-btn:hover {
          background-color: #f3f4f6 !important;
          background-image: none !important;
          color: #1f2937 !important;
          transform: none !important;
          box-shadow: none !important;
        }

        /* Dark mode hover */
        .dark .rbc-toolbar button:hover,
        .dark .rbc-btn:hover {
          background-color: #1f2937 !important;
          color: #10b981 !important;
        }

        .rbc-toolbar button:active,
        .rbc-btn:active,
        .rbc-toolbar button.rbc-active,
        .rbc-btn.rbc-active {
          background-color: #e5e7eb !important;
          background-image: none !important;
          color: #1f2937 !important;
          transform: none !important;
          box-shadow: none !important;
        }

        /* Dark mode active */
        .dark .rbc-toolbar button:active,
        .dark .rbc-btn:active,
        .dark .rbc-toolbar button.rbc-active,
        .dark .rbc-btn.rbc-active {
          background-color: #065f46 !important;
          color: #ffffff !important;
        }

        /* Month/Year Label */
        .rbc-toolbar-label {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
          margin: 0 !important;
          text-align: center !important;
          letter-spacing: -0.025em;
          line-height: 1.2;
          flex: 1 !important;
          order: 0;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Dark mode label */
        .dark .rbc-toolbar-label {
          color: #ffffff !important;
        }

        /* Day headers - Dark theme */
        .rbc-header {
          background-color: #f9fafb !important;
          background-image: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 16px 8px;
          font-weight: 600 !important;
          color: #6b7280 !important;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* Dark mode day headers */
        .dark .rbc-header {
          background-color: #00281B !important;
          border-bottom: 1px solid #065f46 !important;
          color: #9ca3af !important;
        }

        /* Calendar Grid - Clean dark theme */
        .rbc-month-view {
          border: none;
          border-radius: 12px;
          overflow: hidden;
          background-color: #f9fafb;
          box-shadow: none;
        }

        /* Dark mode calendar grid */
        .dark .rbc-month-view {
          background-color: #1f2937;
        }

        /* Day cells - Dark theme */
        .rbc-day-bg {
          border-right: 1px solid #d1d5db;
          border-bottom: 1px solid #d1d5db;
          transition: background-color 0.2s ease;
          min-height: 100px;
          background-color: white;
        }

        /* Dark mode day cells */
        .dark .rbc-day-bg {
          background-color: #1a1d24;
          border-right: 1px solid #374151;
          border-bottom: 1px solid #374151;
        }

        .rbc-day-bg:hover {
          background-color: #f3f4f6;
        }

        /* Dark mode hover */
        .dark .rbc-day-bg:hover {
          background-color: #374151;
        }

        /* Date numbers - Clean typography */
        .rbc-date-cell {
          padding: 12px;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
          text-align: left;
        }

        /* Dark mode date cells */
        .dark .rbc-date-cell {
          color: #9ca3af;
        }

        /* Today's date - High contrast emerald highlight */
        .rbc-today {
          background-color: #f3f4f6;
          position: relative;
        }

        /* Dark mode today */
        .dark .rbc-today {
          background-color: #1f2937;
        }

        .rbc-today .rbc-date-cell {
          background-color: #10b981 !important;
          color: white !important;
          border-radius: 8px;
          margin: 4px;
          padding: 8px;
          text-align: center;
          min-width: 32px;
          display: inline-block;
          font-weight: 700;
        }

        /* Off-range dates (other month) */
        .rbc-off-range-bg {
          background-color: #f9fafb !important;
          opacity: 1;
        }

        /* Dark mode off-range */
        .dark .rbc-off-range-bg {
          background-color: #111827 !important;
        }

        .rbc-off-range .rbc-date-cell {
          color: #d1d5db !important;
          opacity: 1;
          font-weight: 400 !important;
        }

        /* Dark mode off-range text */
        .dark .rbc-off-range .rbc-date-cell {
          color: #4b5563 !important;
        }

        .rbc-off-range-bg:hover {
          background-color: #f3f4f6 !important;
          opacity: 1;
        }

        /* Dark mode hover */
        .dark .rbc-off-range-bg:hover {
          background-color: #1f2937 !important;
        }

        /* Events - High contrast emerald design */
        .rbc-event {
          border: none !important;
          border-radius: 0.375rem !important;
          padding: 6px 10px !important;
          margin: 2px 4px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          background-color: #10b981 !important;
          color: white !important;
          box-shadow: none !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          min-height: 24px;
          display: flex;
          align-items: center;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .rbc-event:hover {
          background-color: #059669 !important;
          transform: none !important;
          box-shadow: none !important;
          z-index: 10;
          position: relative;
        }

        .rbc-event:active {
          background-color: #047857 !important;
          transform: none !important;
        }

        /* Event selection state */
        .rbc-event.rbc-selected {
          background-color: #065f46 !important;
          box-shadow: none !important;
        }

        /* Show more indicator - Emerald theme */
        .rbc-show-more {
          background-color: #f0fdf4 !important;
          color: #065f46 !important;
          border: 1px solid #a7f3d0 !important;
          border-radius: 0.375rem !important;
          padding: 4px 8px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          margin: 2px 4px !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
        }

        .rbc-show-more:hover {
          background-color: #10b981 !important;
          color: white !important;
          border-color: #10b981 !important;
        }

        /* Popup styling for event details */
        .rbc-overlay {
          background-color: white !important;
          border: 1px solid #a7f3d0 !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          padding: 16px !important;
          max-width: 300px;
        }

        .rbc-overlay .rbc-overlay-header {
          font-weight: 600 !important;
          color: #065f46 !important;
          margin-bottom: 8px;
          border-bottom: 1px solid #a7f3d0 !important;
          padding-bottom: 8px;
        }

        /* Responsive design - Mobile optimization */
        @media (max-width: 768px) {
          .rbc-toolbar {
            padding: 16px 20px !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            justify-content: space-between !important;
            display: flex !important;
          }
          
          .rbc-toolbar button,
          .rbc-btn {
            width: 2.25rem !important;
            height: 2.25rem !important;
            padding: 0.375rem !important;
            flex-shrink: 0 !important;
          }
          
          .rbc-toolbar-label {
            font-size: 1.1rem !important;
            order: 0;
            flex: 1 !important;
            text-align: center !important;
            margin: 0 !important;
            min-width: 0;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .rbc-day-bg {
            min-height: 80px !important;
          }
          
          .rbc-date-cell {
            padding: 8px !important;
            font-size: 0.8rem !important;
          }
          
          .rbc-event {
            font-size: 0.7rem !important;
            padding: 4px 6px !important;
            margin: 1px 2px !important;
          }
          
          .rbc-header {
            padding: 12px 4px !important;
            font-size: 0.8rem !important;
          }
        }

        @media (max-width: 640px) {
          .rbc-toolbar {
            padding: 12px 16px !important;
            gap: 12px !important;
            flex-direction: row !important;
            display: flex !important;
            justify-content: space-between !important;
          }
          
          .rbc-toolbar button,
          .rbc-btn {
            width: 2rem !important;
            height: 2rem !important;
            padding: 0.25rem !important;
            flex-shrink: 0 !important;
          }
          
          .rbc-toolbar button svg {
            width: 1rem !important;
            height: 1rem !important;
          }
          
          .rbc-toolbar-label {
            font-size: 1rem !important;
            flex: 1 !important;
            min-width: 0;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .rbc-day-bg {
            min-height: 70px !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ 
            height: 650,
            width: '100%',
          }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={['month']}
          defaultView="month"
          popup={true}
          popupOffset={{ x: 10, y: 10 }}
          messages={{
            next: "Next",
            previous: "Previous", 
            today: "Today",
            showMore: (total) => `+${total} more events`
          }}
          dayLayoutAlgorithm="overlap"
          step={60}
          showMultiDayTimes={false}
          components={{
            toolbar: ({ label, onNavigate, onView }) => (
              <div className="rbc-toolbar">
                <button
                  type="button"
                  onClick={() => onNavigate('PREV')}
                  className="rbc-toolbar-btn flex items-center justify-center w-10 h-10 p-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="rbc-toolbar-label">{label}</h2>
                
                <button
                  type="button"
                  onClick={() => onNavigate('NEXT')}
                  className="rbc-toolbar-btn flex items-center justify-center w-10 h-10 p-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )
          }}
        />
      </div>
    </div>
  );
};

export default CalendarView;

'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventCard } from './EventCard'
import { sampleEvents, getEventsByDate, formatEventDate } from '@/lib/events'
import { Calendar as CalendarIcon, Filter } from 'lucide-react'

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 10, 11)) // November 11, 2024
  const [showAllEvents, setShowAllEvents] = useState(false)
  
  // Get events for selected date or all events
  const eventsToShow = showAllEvents 
    ? sampleEvents 
    : getEventsByDate(selectedDate)
  
  // Get unique dates with events
  const eventDates = [...new Set(sampleEvents.map(event => 
    event.date.toDateString()
  ))].map(dateStr => new Date(dateStr))
  
  // Check if a date has events
  const hasEvents = (date) => {
    if (!date) return false
    return eventDates.some(eventDate => 
      eventDate.toDateString() === date.toDateString()
    )
  }
  
  // Get event count for a date
  const getEventCount = (date) => {
    if (!date) return 0
    return sampleEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    ).length
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Event Calendar
        </h1>
        <p className="text-lg text-gray-600">
          November 11-13, 2024 • Discover amazing events and workshops
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Calendar
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllEvents(!showAllEvents)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAllEvents ? 'Filter by Date' : 'Show All'}
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date)
                  setShowAllEvents(false)
                }
              }}
              className="rounded-md border"
              modifiers={{
                hasEvents: eventDates
              }}
              modifiersStyles={{
                hasEvents: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
              components={{
                Day: ({ date, displayMonth, modifiers }) => {
                  // Add null check for date
                  if (!date) return null
                  
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const hasEventsOnDate = hasEvents(date)
                  const eventCount = getEventCount(date)
                  
                  return (
                    <div className="relative">
                      <button
                        className={`w-8 h-8 rounded-full text-sm transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : hasEventsOnDate
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                      {hasEventsOnDate && eventCount > 1 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {eventCount}
                        </div>
                      )}
                    </div>
                  )
                }
              }}
            />
            
            {/* Event Summary */}
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-gray-900">Event Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Events:</span>
                  <Badge variant="secondary">{sampleEvents.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remote Events:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {sampleEvents.filter(e => e.type === 'remote').length}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Onsite Events:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {sampleEvents.filter(e => e.type === 'onsite').length}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Events List */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {showAllEvents ? 'All Events' : formatEventDate(selectedDate)}
            </h2>
            <p className="text-gray-600">
              {showAllEvents 
                ? `Showing all ${sampleEvents.length} events across the conference`
                : `${eventsToShow.length} event${eventsToShow.length !== 1 ? 's' : ''} on this day`
              }
            </p>
          </div>

          {eventsToShow.length > 0 ? (
            <div className="space-y-4">
              {eventsToShow.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events on this date
              </h3>
              <p className="text-gray-500">
                Select a different date or view all events to see what&apos;s happening.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

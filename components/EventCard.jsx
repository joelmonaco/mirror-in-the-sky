'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Calendar } from 'lucide-react'
import Image from 'next/image'

export function EventCard({ event, className = '' }) {
  const isRemote = event.type === 'remote'
  
  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${
      isRemote 
        ? 'border-l-blue-500 bg-blue-50/50' 
        : 'border-l-green-500 bg-green-50/50'
    } ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Event Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center border">
            {event.logo ? (
              <Image
                src={event.logo}
                alt={`${event.title} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <Calendar className="w-8 h-8 text-gray-400" />
            )}
          </div>
        </div>

        {/* Event Content */}
        <div className="flex-1 min-w-0">
          {/* Event Type Badge */}
          <div className="mb-2">
            <Badge 
              variant={isRemote ? 'default' : 'secondary'}
              className={`${
                isRemote 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {isRemote ? 'Remote' : 'Onsite'}
            </Badge>
          </div>

          {/* Event Title & Subtitle */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600">
              {event.subtitle}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            {/* Time */}
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{event.time}</span>
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="flex items-start text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Speakers: </span>
                  <span>{event.speakers.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

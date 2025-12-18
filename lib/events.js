// Event data structure and sample events for the calendar
export const eventTypes = {
  REMOTE: 'remote',
  ONSITE: 'onsite'
}

export const sampleEvents = [
  // Tuesday, November 11th - Remote events
  {
    id: '1',
    title: 'Opening Keynote',
    subtitle: 'The Future of Digital Innovation',
    type: eventTypes.REMOTE,
    date: new Date(2024, 10, 11), // November 11, 2024
    time: '09:00 - 10:30',
    location: 'Online - Zoom',
    speakers: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
    logo: '/logos/keynote.svg',
    description: 'Join us for an inspiring opening keynote exploring the latest trends in digital innovation and technology.'
  },
  {
    id: '2',
    title: 'AI & Machine Learning Workshop',
    subtitle: 'Hands-on Deep Learning',
    type: eventTypes.REMOTE,
    date: new Date(2024, 10, 11),
    time: '11:00 - 12:30',
    location: 'Online - Teams',
    speakers: ['Alex Rodriguez', 'Dr. Emma Wilson'],
    logo: '/logos/ai-workshop.svg',
    description: 'A practical workshop covering the fundamentals of deep learning and neural networks.'
  },
  {
    id: '3',
    title: 'Networking Session',
    subtitle: 'Connect with Industry Leaders',
    type: eventTypes.REMOTE,
    date: new Date(2024, 10, 11),
    time: '14:00 - 15:30',
    location: 'Online - Gather.town',
    speakers: ['Community Team'],
    logo: '/logos/networking.svg',
    description: 'Virtual networking session to connect with fellow attendees and industry professionals.'
  },

  // Wednesday, November 12th - Remote events
  {
    id: '4',
    title: 'Cloud Computing Panel',
    subtitle: 'Multi-Cloud Strategies',
    type: eventTypes.REMOTE,
    date: new Date(2024, 10, 12),
    time: '09:30 - 11:00',
    location: 'Online - Zoom',
    speakers: ['Jennifer Liu', 'David Park', 'Maria Garcia'],
    logo: '/logos/cloud-panel.svg',
    description: 'Expert panel discussion on implementing effective multi-cloud strategies for modern businesses.'
  },
  {
    id: '5',
    title: 'Cybersecurity Workshop',
    subtitle: 'Threat Detection & Response',
    type: eventTypes.REMOTE,
    date: new Date(2024, 10, 12),
    time: '13:00 - 16:00',
    location: 'Online - WebEx',
    speakers: ['James Thompson', 'Lisa Anderson'],
    logo: '/logos/security-workshop.svg',
    description: 'Comprehensive workshop on modern cybersecurity threats and effective response strategies.'
  },

  // Thursday, November 13th - Onsite events
  {
    id: '6',
    title: 'Innovation Expo',
    subtitle: 'Showcase of Latest Technologies',
    type: eventTypes.ONSITE,
    date: new Date(2024, 10, 13),
    time: '09:00 - 17:00',
    location: 'Convention Center - Hall A',
    speakers: ['Various Exhibitors'],
    logo: '/logos/innovation-expo.svg',
    description: 'Explore cutting-edge technologies and innovations from leading companies and startups.'
  },
  {
    id: '7',
    title: 'Closing Ceremony',
    subtitle: 'Awards & Recognition',
    type: eventTypes.ONSITE,
    date: new Date(2024, 10, 13),
    time: '16:00 - 18:00',
    location: 'Convention Center - Main Stage',
    speakers: ['Event Organizers', 'Award Recipients'],
    logo: '/logos/closing-ceremony.svg',
    description: 'Celebrate the achievements and recognize outstanding contributions from the community.'
  },
  {
    id: '8',
    title: 'Networking Reception',
    subtitle: 'Connect & Celebrate',
    type: eventTypes.ONSITE,
    date: new Date(2024, 10, 13),
    time: '18:00 - 20:00',
    location: 'Convention Center - Lobby',
    speakers: ['All Attendees'],
    logo: '/logos/reception.svg',
    description: 'Join us for drinks, food, and networking to wrap up an amazing event.'
  }
]

// Helper functions
export function getEventsByDate(date) {
  return sampleEvents.filter(event => 
    event.date.toDateString() === date.toDateString()
  )
}

export function getEventsByType(type) {
  return sampleEvents.filter(event => event.type === type)
}

export function getEventById(id) {
  return sampleEvents.find(event => event.id === id)
}

export function formatEventDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatEventTime(time) {
  return time
}

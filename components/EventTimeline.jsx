'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Mic, Users, Wrench, Trophy } from 'lucide-react'
import Image from 'next/image'

// Zeitpläne für jeden Tag
const timeSchedules = {
  montag: [
    '08:00-08:30',
    '08:30-09:00',
    '09:00-09:30',
    '09:00-09:30',
    '09:30-10:00',
    '10:00-10:30',
    '10:30-11:00',
    '11:00-11:30',
    '11:00-11:30',
    '11:30-12:00',
    '12:00-12:30',
    '12:30-13:00',
  ],
  dienstag: [
    '09:00-09:30',
    '09:30-10:00',
    '10:00-10:30',
    '10:30-11:00',
    '11:00-11:30',
    '11:30-12:00',
    '12:00-12:30',
    '12:30-13:00',
    '13:00-13:30',
    '13:30-14:00',
    '14:00-14:45',
  ],
  mittwoch: [
    '08:45-09:30',
    '09:30-10:00',
    '10:00-10:30',
    '10:30-11:00',
    '11:00-11:30',
    '11:30-12:00',
    '12:00-12:30',
    '12:30-13:00',
    '13:00-13:30',
    '13:30-14:00',
    '14:00-14:30',
  ],
  donnerstag: [
    '08:00-08:30',
    '08:30-09:00',
    '09:00-09:15',
    '09:15-09:45',
    '09:45-10:00',
    '10:00-10:30',
    '10:30-11:00',
    '11:00-11:30',
    '11:30-11:45',
    '11:45-12:15',
    '12:15-12:30',
    '12:30-13:00',
    '13:00-13:15',
    '13:15-13:30',
    '13:30-14:00',
    '14:00-14:15',
    '14:15-14:45',
    '14:45-15:00',
    '15:00-15:30',
    '17:00-18:00',
    '18:15-19:15',
  ],
}

export function EventTimeline({ events, day }) {
  // Hole die Zeiten für den aktuellen Tag
  const times = timeSchedules[day] || []
  
  // Filtere Events für diesen Tag
  const dayEvents = events.filter(event => event.day === day)
  
  // Gruppiere Events nach Startzeit
  const eventsByTime = {}
  dayEvents.forEach(event => {
    if (!eventsByTime[event.startTime]) {
      eventsByTime[event.startTime] = []
    }
    eventsByTime[event.startTime].push(event)
  })
  
  // Sortiere die Zeiten
  const sortedTimes = Object.keys(eventsByTime).sort()
  
  // Erstelle Reihen basierend auf den Zeiten
  const rows = []
  sortedTimes.forEach(startTime => {
    const eventsAtTime = eventsByTime[startTime]
    rows.push(eventsAtTime)
  })

  // Prüfe, ob nach dem Film-Panel die Headline eingefügt werden soll
  const shouldShowAfternoonHeader = (rowIndex) => {
    if (day !== 'donnerstag') return false
    // Zeige die Headline nach dem Film-Panel (vor der nächsten Row)
    if (rowIndex > 0) {
      const previousEvent = rows[rowIndex - 1]?.[0]
      return previousEvent?.id === 'thu-10' // Nach dem Film-Panel
    }
    return false
  }

  return (
    <div className="relative w-full max-w-2xl md:max-w-none mx-auto md:-ml-8 lg:-ml-12 xl:-ml-16">
      <div className="space-y-6 relative">
        {rows.map((rowEvents, rowIndex) => {
          // Hole die Startzeit der ersten Event in dieser Row
          const startTime = rowEvents[0]?.startTime || ''
          
          // Formatiere die Zeit für die Anzeige (z.B. '09:00' -> '09:00-09:30')
          const formatTime = (time) => {
            if (!time) return ''
            const [hours, minutes] = time.split(':')
            const duration = rowEvents[0]?.duration || 30
            const endMinutes = parseInt(minutes) + duration
            const endHours = parseInt(hours) + Math.floor(endMinutes / 60)
            const endMins = endMinutes % 60
            return `${time}-${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
          }
          
          const time = formatTime(startTime)
          const isLastRow = rowIndex === rows.length - 1
          const showAfternoonHeader = shouldShowAfternoonHeader(rowIndex)
          
          return (
            <div key={`row-wrapper-${rowIndex}`}>
              {showAfternoonHeader && (
                <div className="w-full py-8">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-center relative">
                    {/* Platzhalter für Timeline links - nur auf Desktop sichtbar, damit Ausrichtung passt */}
                    <div className="hidden md:flex flex-shrink-0 w-32 md:w-40"></div>
                    {/* Headline linksbündig - ausgerichtet mit Event Boxen */}
                    <div className="flex-1 w-full md:w-auto flex flex-col items-center">
                      <div className="w-full max-w-4xl">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                          Nachmittagsprogramm
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-center relative">
              {/* Timeline links - nur auf Desktop sichtbar */}
              <div className="hidden md:flex flex-shrink-0 w-32 md:w-40 items-center justify-end relative">
                <div className="relative">
                  <span className="text-sm md:text-base text-gray-600 font-semibold whitespace-nowrap relative z-10 bg-white">
                    {time}
                  </span>
                  {/* Vertikale Linie nach unten (außer bei der letzten Row) - nur Desktop */}
                  {!isLastRow && (
                    <div 
                      className="absolute left-1/2 top-full w-px bg-gray-300"
                      style={{ 
                        height: '3.5rem'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Event Boxen */}
              <div className="flex-1 w-full md:w-auto flex flex-col items-center">
                {/* Uhrzeit über den Boxen - nur auf Mobile */}
                <div className="mb-3 md:hidden">
                  <span className="text-sm text-gray-600 font-semibold">
                    {time}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                  {rowEvents.map((event, eventIndex) => {
                      const isFullWidth = event.fullWidth
                    return (
                        <div key={event.id} className={isFullWidth ? 'md:col-span-2' : ''}>
                        <EventCard event={event} eventTime={time} day={day} />
                      </div>
                    )
                  })}
                    {/* Wenn nur eine Box und nicht fullWidth, füge leeren Platzhalter hinzu, damit Grid-Layout funktioniert */}
                    {rowEvents.length === 1 && !rowEvents[0]?.fullWidth && (
                    <div className="hidden md:block"></div>
                  )}
                </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EventCard({ event, eventTime, day }) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  // Mapping der Event-Namen zu Stream-Links (für Dienstag, Mittwoch und Donnerstag)
  const streamLinks = {
    dienstag: {
      'Christian Redl': 'https://app.teech.de/stream?number=1538264773',
      'Tim Bengel': 'https://app.teech.de/stream?number=98485872',
      'Suzanna Randall': 'https://app.teech.de/stream?number=1075885531',
      'Anne Blatter-Miredin': 'https://app.teech.de/stream?number=419538647',
      'Mariem Kthiri': 'https://app.teech.de/stream?number=1964820251',
      'Karolina Decker': 'https://app.teech.de/stream?number=237217126',
      'Paula Schwarz': 'https://app.teech.de/stream?number=476089838',
      'Ausbildung bei Amazon': 'https://app.teech.de/stream?number=1503015212',
      'House of Communications': 'https://app.teech.de/stream?number=811097212',
      'Bastian Hopfgarten': 'https://app.teech.de/stream?number=61954688',
      'Ausbildung bei RWE': 'https://app.teech.de/stream?number=1292883185',
      'Mohammad Al-Kurdi': 'https://app.teech.de/stream?number=187802923',
      'Dominique Herold': 'https://app.teech.de/stream?number=1750153059',
    },
    mittwoch: {
      'Julian Behnke': 'https://app.teech.de/join?room=503793188&pin=4vob6w',
      'Kerstin Kriha': 'https://app.teech.de/join?room=166526343&pin=yyxldr',
      'René Rennefeld': 'https://app.teech.de/stream?number=1931113133',
      'Dr. Monika V. Kronbügel': 'https://app.teech.de/stream?number=1688027918',
      'Philipp Frisch': 'https://app.teech.de/stream?number=1947093668',
      'Peek & Cloppenburg': 'https://app.teech.de/stream?number=1797991606',
      'Lehrerworkshop mit Schulgold': 'https://app.teech.de/stream?number=498498525',
      'Dr. Ralf Höcker': 'https://app.teech.de/stream?number=1037321257',
      'Schülerworkshop mit Schulgold': 'https://app.teech.de/stream?number=1746730646',
      'Fabian Ritter': 'https://app.teech.de/stream?number=622508885',
      'Roland Buß': 'https://app.teech.de/stream?number=86408801',
      'Benedict Wells': 'https://app.teech.de/stream?number=740230738',
      'Ausbildung bei der Deutschen Flugsicherung': 'https://app.teech.de/stream?number=596162993',
      'Josha Salchow': 'https://app.teech.de/stream?number=1440407220',
      'Thomas Diehl': 'https://app.teech.de/stream?number=350595043',
      'Sofia Saraiva de Figueiredo': 'https://app.teech.de/stream?number=308803527',
    },
    donnerstag: {
      'Gianni Matheja – präsentiert FU Berlin': 'https://app.teech.de/stream?number=531939074',
      'Tour durch ein Logistikzentrum': 'https://app.teech.de/stream?number=1798118887',
      'Generative AI Foundations': 'https://app.teech.de/stream?number=531939074',
      'Gründerpanel mit Stefan Krause': 'https://app.teech.de/stream?number=531939074',
      'Quiz Tour für Schüler': 'https://app.teech.de/stream?number=1798118887',
      'Hochstapeln erlaubt: mit dualer Ausbildung!': 'https://app.teech.de/stream?number=531939074',
      'PartyRock für Lehrkräfte': 'https://app.teech.de/stream?number=1798118887',
      'Kreativpanel': 'https://app.teech.de/stream?number=531939074',
      'Theresia Crone': 'https://app.teech.de/stream?number=531939074',
      'Lehrerworkshop mit Schulgold': 'https://app.teech.de/stream?number=1798118887',
      'Bettina Stix': 'https://app.teech.de/stream?number=1798118887',
      'Susanne Bretfeld': 'https://app.teech.de/stream?number=1798118887',
      'Tour durch ein Rechenzentrum': 'https://app.teech.de/stream?number=531939074',
      'Film-Panel': 'https://app.teech.de/stream?number=1798118887',
      'KI-Workshop mit Cornelsen': 'https://app.teech.de/stream?number=1798118887',
      'Community Panel': 'https://app.teech.de/stream?number=882552462',
      'KI Panel': 'https://app.teech.de/stream?number=882552462',
    },
  }

  // Prüfe, ob das Event gestartet ist und einen Link hat
  const isStarted = timeRemaining === 'Gestartet'
  const streamLink = (day === 'dienstag' || day === 'mittwoch' || day === 'donnerstag') 
    ? (streamLinks[day]?.[event.speakerName] || null)
    : null
  const isActive = isStarted && streamLink && !isFinished

  // Funktion zur Bestimmung des Icons basierend auf dem Event-Typ
  const getEventIcon = (eventType) => {
    if (!eventType) return null
    
    const iconProps = { className: 'w-3 h-3', strokeWidth: 2.5 }
    
    switch (eventType) {
      case 'Live-Talk':
        return <Mic {...iconProps} />
      case 'Panel':
        return <Users {...iconProps} />
      case 'Workshop':
        return <Wrench {...iconProps} />
      case 'Live-Quiz':
      case 'Live Quiz':
        return <Trophy {...iconProps} />
      default:
        return null
    }
  }

  // Funktion zur Bestimmung der Balkenfarbe basierend auf der Startzeit
  const getBarColor = (startTime) => {
    if (!startTime) return '#2563EB' // Blau als Standard
    
    const [hours, minutes] = startTime.split(':').map(Number)
    // Berechne Minuten seit 09:00 (kann negativ sein für Zeiten vor 09:00)
    const totalMinutes = (hours - 9) * 60 + minutes
    // Bestimme das Muster (alle 30 Minuten wechselt die Farbe)
    // Verwende modulo mit positiver Zahl, um negative Werte zu behandeln
    const patternIndex = ((Math.floor(totalMinutes / 30) % 4) + 4) % 4
    
    const colors = [
      '#2563EB', // Blau (09:00, 11:00, 13:00, ...)
      '#F87171', // Rot/Lachs (09:30, 11:30, 13:30, ...)
      '#86EFAC', // Pastellgrün (10:00, 12:00, 14:00, ...)
      '#FCD34D', // Dunkles Gelb (10:30, 12:30, 14:30, ...)
    ]
    
    return colors[patternIndex] || '#2563EB'
  }

  useEffect(() => {
    // Hilfsfunktion: Konvertiert eine deutsche Zeit (Europe/Berlin) zu einem Date-Objekt
    // durch Finden des UTC-Zeitpunkts, der dieser deutschen Zeit entspricht
    const germanTimeToDate = (year, month, day, hours, minutes, seconds = 0) => {
      // Erstelle einen ISO-String für die deutsche Zeit (als UTC interpretiert)
      const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      
      // Starte mit einer Schätzung basierend auf typischen Offsets (CET = UTC+1, CEST = UTC+2)
      // Versuche verschiedene Offsets, um den richtigen UTC-Zeitpunkt zu finden
      for (let offsetHours = -3; offsetHours <= 3; offsetHours++) {
        const testUTC = new Date(isoString + 'Z').getTime() - offsetHours * 60 * 60 * 1000
        const testDate = new Date(testUTC)
        const germanTimeString = testDate.toLocaleString('en-US', {
          timeZone: 'Europe/Berlin',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
        
        const [datePart, timePart] = germanTimeString.split(', ')
        const [testMonth, testDay, testYear] = datePart.split('/').map(Number)
        const [testHours, testMinutes, testSeconds] = timePart.split(':').map(Number)
        
        // Prüfe, ob die deutsche Zeit übereinstimmt
        if (testYear === year && 
            testMonth === month + 1 && 
            testDay === day && 
            testHours === hours && 
            testMinutes === minutes && 
            testSeconds === seconds) {
          return testDate
        }
      }
      
      // Fallback: Verwende eine Schätzung (CET = UTC+1)
      return new Date(isoString + '+01:00')
    }

    // Hilfsfunktion: Gibt die aktuelle deutsche Zeit als Date-Objekt zurück
    const getCurrentGermanTime = () => {
      const now = new Date()
      const germanTimeString = now.toLocaleString('en-US', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      
      const [datePart, timePart] = germanTimeString.split(', ')
      const [month, day, year] = datePart.split('/').map(Number)
      const [hours, minutes, seconds] = timePart.split(':').map(Number)
      
      // Konvertiere die deutsche Zeit zu einem Date-Objekt
      return germanTimeToDate(year, month - 1, day, hours, minutes, seconds)
    }

    const calculateTimeRemaining = () => {
      // Mappe Tag zu Datum
      const dayToDate = {
        dienstag: { day: 11, month: 10 }, // November ist Monat 10 (0-basiert)
        mittwoch: { day: 12, month: 10 },
        donnerstag: { day: 13, month: 10 }
      }

      const dateInfo = dayToDate[day]
      if (!dateInfo || !eventTime) {
        setTimeRemaining('')
        setIsFinished(false)
        return
      }

      // Parse die Startzeit (z.B. '09:00' oder '09:00-09:30')
      const startTime = eventTime.split('-')[0].trim()
      const [hours, minutes] = startTime.split(':').map(Number)

      // Hole die aktuelle deutsche Zeit
      const nowGerman = getCurrentGermanTime()
      
      // Hole das Jahr aus der aktuellen deutschen Zeit
      const now = new Date()
      const germanNowString = now.toLocaleString('en-US', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      const [datePart] = germanNowString.split(', ')
      const [, , year] = datePart.split('/').map(Number)

      // Erstelle das Event-Datum in deutscher Zeit
      const eventStartDate = germanTimeToDate(year, dateInfo.month, dateInfo.day, hours, minutes)
      
      // Berechne die Endzeit (Startzeit + Dauer in Minuten)
      const duration = event.duration || 30
      const eventEndDate = new Date(eventStartDate.getTime() + duration * 60 * 1000)
      
      // Berechne die Endzeit + 1 Stunde (Button bleibt 1 Stunde nach Ende aktiv)
      const eventEndDatePlus1Hour = new Date(eventEndDate.getTime() + 60 * 60 * 1000)
      
      // Prüfe, ob das Event bereits vorbei ist (Endzeit + 1 Stunde)
      if (nowGerman > eventEndDatePlus1Hour) {
        setIsFinished(true)
        setTimeRemaining('Session vorbei')
        return
      }
      
      // Berechne die Differenz zur Startzeit
      const diff = eventStartDate.getTime() - nowGerman.getTime()

      if (diff <= 0) {
        setIsFinished(false)
        setTimeRemaining('Gestartet')
        return
      }

      setIsFinished(false)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hoursRem = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutesRem = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secondsRem = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hoursRem}h ${minutesRem}m`)
      } else if (hoursRem > 0) {
        setTimeRemaining(`${hoursRem}h ${minutesRem}m ${secondsRem}s`)
      } else if (minutesRem > 0) {
        setTimeRemaining(`${minutesRem}m ${secondsRem}s`)
      } else {
        setTimeRemaining(`${secondsRem}s`)
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [eventTime, day, event.duration])

  const barColor = getBarColor(event.startTime)

  return (
    <Card className="bg-white rounded-2xl p-0 flex flex-col md:flex-row hover:bg-gray-50 transition-all border-0 relative overflow-hidden" style={{ boxShadow: '0 0 18px 3px rgba(0, 0, 0, 0.08)' }}>
      {/* Farbiger Balken links */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: barColor, borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem' }}></div>
      
      {/* Event-Typ Pill oben rechts */}
      {event.eventType && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}>
            {getEventIcon(event.eventType)}
            {event.eventType}
          </span>
        </div>
      )}
      
      {/* Speaker Bild - oben zentriert auf Mobile, links auf Desktop */}
      <div className="flex-shrink-0 flex items-center justify-center md:justify-start pt-3 md:pt-0 pl-0 md:pl-4 lg:pl-6">
        {event.speakerImage5 ? (
          // Fünf Bilder für Panels mit vielen Speakern - symmetrische Anordnung
          <div className="relative w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44">
            {/* Bild 1 - oben links (Udo), nach rechts verschoben, etwas höher */}
            <div className="absolute left-2 -top-1 md:left-3 md:-top-1 lg:left-4 lg:-top-1 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white" style={{ zIndex: 1 }}>
              {event.speakerImage ? (
                <Image
                  src={event.speakerImage}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Bild 2 - oben rechts (Georg Müller-Loeffelholz), nach rechts verschoben (weniger right), etwas höher */}
            <div className="absolute right-2 -top-1 md:right-3 md:-top-1 lg:right-4 lg:-top-1 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white" style={{ zIndex: 2 }}>
              {event.speakerImage2 ? (
                <Image
                  src={event.speakerImage2}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Bild 3 - mitte links (Georg Listing), nach links verschoben (mehr left) */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 md:left-3 lg:left-4 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white" style={{ zIndex: 3 }}>
              {event.speakerImage3 ? (
                <Image
                  src={event.speakerImage3}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Bild 4 - mitte rechts (Dorothea), nach links verschoben (mehr right) */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 md:right-3 lg:right-4 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white" style={{ zIndex: 4 }}>
              {event.speakerImage4 ? (
                <Image
                  src={event.speakerImage4}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Bild 5 - unten mitte */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white" style={{ zIndex: 5 }}>
              <Image
                src={event.speakerImage5}
                alt={event.speakerName}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : event.speakerImage4 ? (
          // Vier Bilder für Panels mit mehreren Speakern - symmetrische Anordnung wie KI Panel
          <div className="relative w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44">
            {/* Bild 1 - oben links, nach rechts verschoben, weiter unten */}
            <div className="absolute left-2 top-2 md:left-3 md:top-3 lg:left-4 lg:top-4 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white" style={{ zIndex: 1 }}>
              {event.speakerImage ? (
                <Image
                  src={event.speakerImage}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Bild 2 - oben rechts, nach rechts verschoben, weiter unten */}
            <div className="absolute right-2 top-2 md:right-3 md:top-3 lg:right-4 lg:top-4 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white" style={{ zIndex: 2 }}>
              {event.speakerImage2 ? (
                <Image
                  src={event.speakerImage2}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Bild 3 - mitte links, nach links verschoben, weiter unten */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 md:left-3 lg:left-4" style={{ top: 'calc(50% + 1rem)', zIndex: 3 }}>
              <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white">
                {event.speakerImage3 ? (
                  <Image
                    src={event.speakerImage3}
                    alt={event.speakerName}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
            </div>
            {/* Bild 4 - mitte rechts, nach links verschoben, weiter unten */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 md:right-3 lg:right-4" style={{ top: 'calc(50% + 1rem)', zIndex: 4 }}>
              <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-[3px] border-white">
                <Image
                  src={event.speakerImage4}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ) : event.speakerImage2 ? (
          // Zwei diagonal überlappende Bilder für Panels mit mehreren Speakern
          <div className="relative w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36">
            {/* Erstes Bild - hinten links */}
            <div className="absolute left-0 top-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-white" style={{ zIndex: 2 }}>
              {event.speakerImage ? (
                <Image
                  src={event.speakerImage}
                  alt={event.speakerName}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            {/* Zweites Bild - vorne rechts, diagonal überlappend */}
            <div className="absolute right-0 bottom-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-white" style={{ zIndex: 3 }}>
              <Image
                src={event.speakerImage2}
                alt={event.speakerName}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          // Einzelnes Bild (Standard)
        <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden" style={{ boxShadow: '0 0 12px rgba(0, 0, 0, 0.08)' }}>
          {event.speakerImage ? (
            <Image
              src={event.speakerImage}
              alt={event.speakerName}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl md:text-4xl">
              {event.speakerName.charAt(0)}
            </div>
          )}
        </div>
        )}
      </div>
      
      {/* Name, Beschreibung und Button - zentriert auf Mobile, links auf Desktop */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left p-4 md:p-6 min-h-0">
        <div className="flex-1 w-full">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 mt-4 md:mt-4">
            {event.speakerName}
          </h3>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            {event.description}
          </p>
          {/* Powered by Logo */}
          {(event.speakerName === 'Mariem Kthiri' || 
            event.speakerName === 'Julian Behnke' || 
            event.speakerName === 'Kerstin Kriha' || 
            event.speakerName === 'Sofia Saraiva de Figueiredo' || 
            event.speakerName === 'Bettina Stix' || 
            event.speakerName === 'Susanne Bretfeld' ||
            event.speakerName === 'Tour durch ein Rechenzentrum') && (
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <span className="text-xs text-gray-500 italic">Powered by</span>
              <Image
                src="/logos/Speaker/Amazon_logo_2.png"
                alt="Amazon Logo"
                width={80}
                height={24}
                className="h-5 w-auto object-contain"
              />
            </div>
          )}
          {(event.speakerName === 'Karolina Decker' || 
            event.speakerName === 'Workshop mit Schulgold' || 
            event.speakerName === 'Schülerworkshop mit Schulgold' ||
            event.speakerName === 'Lehrerworkshop mit Schulgold') && (
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <span className="text-xs text-gray-500 italic">Powered by</span>
              <Image
                src="/logos/Speaker/Schulgold_Logo_2.png"
                alt="Schulgold Logo"
                width={80}
                height={24}
                className="h-5 w-auto object-contain"
              />
            </div>
          )}
          {event.speakerName === 'Gianni Matheja – präsentiert FU Berlin' && (
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <span className="text-xs text-gray-500 italic">Powered by</span>
              <Image
                src="/logos/Speaker/FU_Berlin_Logo_2.png"
                alt="FU Berlin Logo"
                width={80}
                height={24}
                className="h-5 w-auto object-contain"
              />
            </div>
          )}
          {event.speakerName === 'Gründerpanel mit Stefan Krause' && (
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <span className="text-xs text-gray-500 italic">Powered by</span>
              <Image
                src="/logos/Speaker/Factory_Berlin_2.png"
                alt="Factory Berlin Logo"
                width={80}
                height={24}
                className="h-5 w-auto object-contain"
              />
            </div>
          )}
        </div>
        
        {/* Startet in / Jetzt teilnehmen / Session vorbei Button */}
        {isFinished ? (
          <button 
            className="w-full mt-4 text-white py-2 md:py-3 text-sm md:text-base font-semibold rounded-lg flex items-center justify-center gap-2 group transition-colors opacity-50 cursor-not-allowed"
            style={{ backgroundColor: '#9CA3AF' }}
            disabled
          >
            Session vorbei
            <ArrowRight className="w-4 h-4 transition-transform duration-300" />
          </button>
        ) : isActive ? (
          <a
            href={streamLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 text-white py-2 md:py-3 text-sm md:text-base font-semibold rounded-lg flex items-center justify-center gap-2 group transition-colors hover:opacity-90"
            style={{ backgroundColor: '#4A3DF1' }}
          >
            Jetzt teilnehmen
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        ) : (
        <button 
          className="w-full mt-4 text-white py-2 md:py-3 text-sm md:text-base font-semibold rounded-lg flex items-center justify-center gap-2 group transition-colors opacity-50 cursor-not-allowed"
          style={{ backgroundColor: '#9CA3AF' }}
          disabled
        >
          Startet in {timeRemaining || '...'}
          <ArrowRight className="w-4 h-4 transition-transform duration-300" />
        </button>
        )}
      </div>
    </Card>
  )
}

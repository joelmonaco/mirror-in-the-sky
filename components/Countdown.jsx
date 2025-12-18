'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Ziel-Datum: 11. November, 9:00 Uhr
    const targetDate = new Date()
    const currentYear = targetDate.getFullYear()
    let target = new Date(currentYear, 10, 11, 9, 0, 0) // 10 = November (0-indexed)
    
    // Wenn das Datum bereits vorbei ist in diesem Jahr, nimm nächstes Jahr
    if (target < targetDate) {
      target = new Date(currentYear + 1, 10, 11, 9, 0, 0)
    }

    const updateCountdown = () => {
      const now = new Date()
      const difference = target.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const timeUnits = [
    { label: 'Tage', value: timeLeft.days },
    { label: 'Stunden', value: timeLeft.hours },
    { label: 'Minuten', value: timeLeft.minutes },
    { label: 'Sekunden', value: timeLeft.seconds },
  ]

  return (
    <div className="flex justify-center gap-4 md:gap-6 mt-8">
      {timeUnits.map((unit, index) => (
        <Card 
          key={index} 
          className="w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center text-center bg-black/30 backdrop-blur-md shadow-xl border border-white/20 rounded-xl"
        >
          <div className="text-2xl md:text-4xl font-bold text-white mb-1">
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className="text-xs md:text-sm text-white font-medium">
            {unit.label}
          </div>
        </Card>
      ))}
    </div>
  )
}


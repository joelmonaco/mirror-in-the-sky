'use client'

import { useState, useEffect } from 'react'

export function IlluminatedTitle() {
  const fullText = 'Inspiration Days'
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  useEffect(() => {
    let currentIndex = 0
    let timeoutId

    // Variable Typing-Geschwindigkeit für realistischen Effekt
    const getRandomTypingSpeed = () => {
      // Basis-Geschwindigkeit zwischen 80-180ms, manchmal länger bei Leerzeichen
      const baseSpeed = Math.random() * 100 + 80
      
      // Prüfe ob currentIndex noch im gültigen Bereich liegt
      if (currentIndex >= fullText.length) {
        return baseSpeed
      }
      
      const currentChar = fullText[currentIndex]
      
      // Leerzeichen und Großbuchstaben etwas langsamer
      if (currentChar === ' ') {
        return baseSpeed + 50
      }
      if (currentChar && currentChar === currentChar.toUpperCase() && currentChar !== fullText[0]) {
        return baseSpeed + 30
      }
      return baseSpeed
    }

    const typeText = () => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        currentIndex++
        const speed = getRandomTypingSpeed()
        timeoutId = setTimeout(typeText, speed)
      } else {
        // Warte kurz bevor das Leuchten langsam startet
        timeoutId = setTimeout(() => {
          setIsTypingComplete(true)
        }, 500)
      }
    }

    // Starte die Animation nach einem kurzen Delay
    timeoutId = setTimeout(typeText, 200)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <h1 
      className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-white drop-shadow-lg ${isTypingComplete ? 'shimmer-glow' : ''}`}
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {displayedText}
      {!isTypingComplete && (
        <span 
          className="inline-block bg-white ml-1" 
          style={{ 
            width: '2px', 
            height: '1em',
            animation: 'cursor-blink 1s infinite'
          }}
        />
      )}
    </h1>
  )
}


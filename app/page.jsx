'use client'

import { useState, useEffect, useRef } from 'react'

// Verschiedene verschlüsselte Zeichen für mehr Variation
const encryptedChars = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', '▪', '▫']
const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', '▪', '▫', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// Generiere verschlüsselte Zeichen basierend auf der Wortlänge
function generateEncrypted(word) {
  const length = word.length
  const encrypted = []
  for (let i = 0; i < length; i++) {
    const randomChar = encryptedChars[Math.floor(Math.random() * encryptedChars.length)]
    encrypted.push(randomChar)
  }
  return encrypted.join('')
}

// Komponente für ein verschlüsseltes Wort
function EncryptedWord({ word, isPunctuation = false }) {
  const [isHovered, setIsHovered] = useState(false)
  const [revealedChars, setRevealedChars] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const intervalRef = useRef(null)
  const glitchIntervalRef = useRef(null)
  const encryptedText = useRef(generateEncrypted(word))

  useEffect(() => {
    if (isHovered) {
      // Typing-Effekt: Zeichen nacheinander aufdecken
      setRevealedChars(0)
      let currentChars = 0
      
      const typingInterval = setInterval(() => {
        currentChars++
        setRevealedChars(currentChars)
        
        if (currentChars >= word.length) {
          clearInterval(typingInterval)
          setDisplayText(word)
        }
      }, 25) // Geschwindigkeit des Typing-Effekts

      intervalRef.current = typingInterval

      // Glitch-Effekt während des Übergangs
      const glitchInterval = setInterval(() => {
        if (currentChars < word.length) {
          const glitch = Array.from({ length: word.length }, (_, i) => {
            if (i < currentChars) {
              return word[i]
            }
            return glitchChars[Math.floor(Math.random() * glitchChars.length)]
          }).join('')
          setDisplayText(glitch)
        }
      }, 40)

      glitchIntervalRef.current = glitchInterval

      return () => {
        clearInterval(typingInterval)
        clearInterval(glitchInterval)
      }
    } else {
      // Zurück zur verschlüsselten Ansicht mit Fade-Out
      setRevealedChars(0)
      setDisplayText(encryptedText.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current)
    }
  }, [isHovered, word])

  if (isPunctuation) {
    return <span className="text-white">{word}</span>
  }

  const showText = isHovered ? displayText : encryptedText.current
  const isFullyRevealed = isHovered && revealedChars >= word.length

  return (
    <span
      className="inline-block cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
      }}
    >
      <span 
        className={`inline-block transition-all duration-300 ${
          isFullyRevealed ? 'text-white opacity-100' : 'text-white opacity-60'
        }`}
        style={{
          textShadow: isFullyRevealed 
            ? '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)'
            : 'none',
          transform: isHovered && !isFullyRevealed ? 'translateX(0.5px)' : 'translateX(0)',
        }}
      >
        {showText}
      </span>
      {isHovered && !isFullyRevealed && (
        <span 
          className="absolute inset-0 text-white opacity-90"
          style={{
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            animation: 'glitch 0.08s infinite',
            pointerEvents: 'none',
          }}
        >
          {displayText}
        </span>
      )}
      <style jsx>{`
        @keyframes glitch {
          0%, 100% { 
            transform: translateX(0) translateY(0);
            opacity: 0.9;
          }
          20% { 
            transform: translateX(-1px) translateY(1px);
            opacity: 0.8;
          }
          40% { 
            transform: translateX(1px) translateY(-1px);
            opacity: 0.85;
          }
          60% { 
            transform: translateX(-0.5px) translateY(0.5px);
            opacity: 0.9;
          }
          80% { 
            transform: translateX(0.5px) translateY(-0.5px);
            opacity: 0.85;
          }
        }
      `}</style>
    </span>
  )
}

export default function HomePage() {
  const text = `Aurelia, das hier ist der Beginn deines Rätsels. Die Spielregeln sind ganz einfach, denn...es gibt im Prinzip keine! Keine Tipps, nichts kann übersprungen werden.

Wie lange wird es gehen? Lange. Erwarte nicht, dass du es heute lösen kannst. Auch nicht morgen...oder nächste Woche. Also lass dich überraschen. Und damit: Legen wir los!`

  // Teile den Text in Wörter und Zeichen auf
  function parseText(text) {
    const parts = []
    const words = text.split(/(\s+|[.,!?;:…])/)
    
    words.forEach((word, index) => {
      if (!word.trim()) {
        // Leerzeichen
        parts.push({ type: 'space', content: word })
      } else if (/^[.,!?;:…]+$/.test(word)) {
        // Interpunktion
        parts.push({ type: 'punctuation', content: word })
      } else {
        // Wort
        parts.push({ type: 'word', content: word })
      }
    })
    
    return parts
  }

  const parts = parseText(text)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-4xl mx-auto">
        <div className="text-white text-lg sm:text-xl md:text-2xl leading-relaxed">
          {parts.map((part, index) => {
            if (part.type === 'space') {
              return <span key={index}>{part.content}</span>
            } else if (part.type === 'punctuation') {
              return <EncryptedWord key={index} word={part.content} isPunctuation={true} />
            } else {
              return (
                <EncryptedWord 
                  key={index} 
                  word={part.content}
                />
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}

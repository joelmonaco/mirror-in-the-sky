'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

// Verschiedene verschlüsselte Zeichen für mehr Variation
const encryptedChars = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', '▪', '▫']
const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', '▪', '▫', 'A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// Einfacher Hash-Funktion für deterministische "Zufallszahlen"
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Generiere verschlüsselte Zeichen basierend auf der Wortlänge (deterministisch)
function generateEncrypted(word) {
  const length = word.length
  const encrypted = []
  const seed = simpleHash(word)
  
  for (let i = 0; i < length; i++) {
    // Verwende einen deterministischen "Zufallswert" basierend auf dem Seed und der Position
    const pseudoRandom = (seed + i * 17) % encryptedChars.length
    const char = encryptedChars[pseudoRandom]
    encrypted.push(char)
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
          isFullyRevealed ? 'text-white opacity-100' : 'text-white opacity-100'
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

export default function LepusAlbusPage() {
  const [inputs, setInputs] = useState(['', '', '', '', ''])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  
  const CORRECT_ANSWER = ['+', '!', '&', '+', ':)']
  
  const text = `Gratuliere! Den ersten Teil hast du schon mal geschafft. Jetzt hast du ein Gefühl für das Spiel. Wenn ich dir eins mitgeben kann für alle Rätsel, die noch kommen werden, dann das: Der Weg ist das Ziel.`

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

  const handleInputChange = (index, value) => {
    // Für das letzte Feld erlauben wir bis zu 2 Zeichen, für die anderen nur 1
    const maxLength = index === 4 ? 2 : 1
    const filteredValue = value.slice(0, maxLength)
    
    const newInputs = [...inputs]
    newInputs[index] = filteredValue
    setInputs(newInputs)

    // Automatisch zum nächsten Feld springen, wenn ein Zeichen eingegeben wurde (außer beim letzten Feld)
    if (filteredValue && index < 4) {
      const nextInput = document.getElementById(`input-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // Backspace: Gehe zum vorherigen Feld, wenn aktuelles Feld leer ist
    if (e.key === 'Backspace' && !inputs[index] && index > 0) {
      const prevInput = document.getElementById(`input-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
    // Enter: Bestätigen, wenn alle Felder ausgefüllt sind
    if (e.key === 'Enter' && inputs.every(input => input !== '')) {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    // Prüfe, ob die Antwort korrekt ist
    const isCorrect = inputs.every((input, index) => input === CORRECT_ANSWER[index])
    
    if (isCorrect) {
      // Korrekt: Alles ausblenden und Erfolgsansicht anzeigen
      setShowSuccess(true)
    } else {
      // Falsch: Wackel-Animation
      setIsShaking(true)
      setTimeout(() => {
        setIsShaking(false)
      }, 600)
    }
  }

  const allFieldsFilled = inputs.every(input => input !== '')

  const parts = parseText(text)

  // Wenn die Lösung korrekt ist, zeige nur die Koordinaten und den Text
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Koordinaten */}
          <div className="text-white text-2xl sm:text-3xl md:text-4xl font-mono font-bold">
            49°51&apos;13.2&quot;N 8°38&apos;56.9&quot;E
          </div>
          
          {/* Datum */}
          <div className="text-white text-xl sm:text-2xl font-mono">
            Datum: _ _._ _._ _
          </div>
          
          {/* Text */}
          <div className="text-white text-lg sm:text-xl max-w-2xl leading-relaxed">
            Hier wird es weitergehen. Und um zu verstehen wann, musst du an den Anfang zurückkehren.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      <div className="text-center max-w-4xl mx-auto">
        <div className="text-white text-lg sm:text-xl md:text-2xl leading-relaxed mb-12">
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
        
        {/* 5 Input-Felder (das letzte ist doppelt so breit) */}
        <div className="flex gap-3 justify-center items-center flex-wrap">
          {inputs.map((value, index) => (
            <input
              key={index}
              id={`input-${index}`}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={index === 4 ? 2 : 1}
              className={`${
                index === 4 ? 'w-24 sm:w-28' : 'w-12 sm:w-14'
              } h-12 sm:h-14 text-center text-white bg-transparent border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xl sm:text-2xl font-mono transition-all duration-200 ${
                isShaking 
                  ? 'border-red-500 animate-shake' 
                  : 'border-white focus:border-white focus:ring-white'
              }`}
              style={{
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
              }}
            />
          ))}
        </div>

        {/* Bestätigungsbutton - immer gerendert, aber unsichtbar wenn nicht alle Felder ausgefüllt */}
        <div className="mt-8 h-12 flex items-center justify-center">
          <button
            onClick={handleSubmit}
            className={`w-14 h-14 rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${
              allFieldsFilled 
                ? 'opacity-100 pointer-events-auto' 
                : 'opacity-0 pointer-events-none'
            }`}
            disabled={!allFieldsFilled}
          >
            <ArrowRight size={24} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Wackel-Animation CSS */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}


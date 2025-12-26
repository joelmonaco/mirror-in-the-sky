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

// Jump & Run Game Komponente
function JumpAndRunGame() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  
  useEffect(() => {
    if (!gameStarted) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    // Game variables
    const player = {
      x: 80,
      y: 280,
      width: 32,
      height: 48,
      velocityY: 0,
      jumping: false,
      gravity: 0.8,
      jumpPower: -15
    }
    
    const obstacles = []
    const clouds = []
    let obstacleTimer = 0
    let cloudTimer = 0
    let gameScore = 0
    let animationId
    let frameCount = 0
    
    // Ground level
    const groundY = 350
    
    // Nintendo Color Palette
    const colors = {
      sky: '#5c94fc',
      ground: '#8b5524',
      grass: '#00a800',
      brick: '#e39d3e',
      cloud: '#ffffff',
      skin: '#ffcca1',
      hair: '#ffd700',
      dress: '#ff69b4',
      shoes: '#8b4513'
    }
    
    // Draw pixel girl character with animations
    function drawGirl(x, y, isJumping, frame) {
      const pixelSize = 4
      
      // Add rotation when jumping (like Mario)
      if (isJumping) {
        ctx.save()
        ctx.translate(x + 16, y + 24)
        ctx.rotate(Math.PI / 12) // Slight forward rotation
        ctx.translate(-(x + 16), -(y + 24))
      }
      
      if (isJumping) {
        // Jumping pose - arms up, legs together
        // Hair (blonde)
        ctx.fillStyle = colors.hair
        ctx.fillRect(x + pixelSize * 2, y, pixelSize * 4, pixelSize)
        ctx.fillRect(x + pixelSize, y + pixelSize, pixelSize * 6, pixelSize * 2)
        ctx.fillRect(x, y + pixelSize * 3, pixelSize * 8, pixelSize)
        
        // Face (skin)
        ctx.fillStyle = colors.skin
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 3, pixelSize * 4, pixelSize * 3)
        
        // Eyes (excited)
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 4, pixelSize, pixelSize)
        ctx.fillRect(x + pixelSize * 5, y + pixelSize * 4, pixelSize, pixelSize)
        
        // Open mouth (excited)
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 5, pixelSize * 2, pixelSize)
        
        // Dress/Body
        ctx.fillStyle = colors.dress
        ctx.fillRect(x + pixelSize, y + pixelSize * 6, pixelSize * 6, pixelSize * 4)
        
        // Arms UP (jumping pose)
        ctx.fillStyle = colors.skin
        ctx.fillRect(x, y + pixelSize * 5, pixelSize, pixelSize * 2)
        ctx.fillRect(x + pixelSize * 7, y + pixelSize * 5, pixelSize, pixelSize * 2)
        
        // Legs together (jumping)
        ctx.fillStyle = colors.skin
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 10, pixelSize * 2, pixelSize * 2)
        
        // Shoes together
        ctx.fillStyle = colors.shoes
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 11, pixelSize * 4, pixelSize)
        
      } else {
        // Running animation - alternating legs
        const runFrame = Math.floor(frame / 8) % 2
        
        // Hair (blonde)
        ctx.fillStyle = colors.hair
        ctx.fillRect(x + pixelSize * 2, y, pixelSize * 4, pixelSize)
        ctx.fillRect(x + pixelSize, y + pixelSize, pixelSize * 6, pixelSize * 2)
        ctx.fillRect(x, y + pixelSize * 3, pixelSize * 8, pixelSize)
        
        // Face (skin)
        ctx.fillStyle = colors.skin
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 3, pixelSize * 4, pixelSize * 3)
        
        // Eyes
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 4, pixelSize, pixelSize)
        ctx.fillRect(x + pixelSize * 5, y + pixelSize * 4, pixelSize, pixelSize)
        
        // Smile
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 5, pixelSize * 2, pixelSize)
        
        // Dress/Body
        ctx.fillStyle = colors.dress
        ctx.fillRect(x + pixelSize, y + pixelSize * 6, pixelSize * 6, pixelSize * 4)
        
        // Arms swing while running
        ctx.fillStyle = colors.skin
        if (runFrame === 0) {
          // Frame 1: Left arm forward, right arm back
          ctx.fillRect(x, y + pixelSize * 7, pixelSize, pixelSize * 2)
          ctx.fillRect(x + pixelSize * 7, y + pixelSize * 8, pixelSize, pixelSize * 2)
        } else {
          // Frame 2: Right arm forward, left arm back
          ctx.fillRect(x, y + pixelSize * 8, pixelSize, pixelSize * 2)
          ctx.fillRect(x + pixelSize * 7, y + pixelSize * 7, pixelSize, pixelSize * 2)
        }
        
        // Legs - alternating running animation
        ctx.fillStyle = colors.skin
        if (runFrame === 0) {
          // Frame 1: Left leg forward, right leg back
          ctx.fillRect(x + pixelSize * 2, y + pixelSize * 10, pixelSize, pixelSize * 2)
          ctx.fillRect(x + pixelSize * 5, y + pixelSize * 10, pixelSize, pixelSize)
          
          // Shoes
          ctx.fillStyle = colors.shoes
          ctx.fillRect(x + pixelSize, y + pixelSize * 11, pixelSize * 2, pixelSize)
          ctx.fillRect(x + pixelSize * 5, y + pixelSize * 10, pixelSize * 2, pixelSize)
        } else {
          // Frame 2: Right leg forward, left leg back
          ctx.fillRect(x + pixelSize * 2, y + pixelSize * 10, pixelSize, pixelSize)
          ctx.fillRect(x + pixelSize * 5, y + pixelSize * 10, pixelSize, pixelSize * 2)
          
          // Shoes
          ctx.fillStyle = colors.shoes
          ctx.fillRect(x + pixelSize * 2, y + pixelSize * 10, pixelSize * 2, pixelSize)
          ctx.fillRect(x + pixelSize * 4, y + pixelSize * 11, pixelSize * 2, pixelSize)
        }
      }
      
      // Restore canvas state after rotation
      if (isJumping) {
        ctx.restore()
      }
    }
    
    // Draw brick obstacle (like Mario pipes/blocks)
    function drawBrick(x, y, width, height) {
      const brickSize = 16
      ctx.fillStyle = colors.brick
      ctx.fillRect(x, y, width, height)
      
      // Brick pattern
      ctx.strokeStyle = '#c47d2e'
      ctx.lineWidth = 2
      for (let i = 0; i < height; i += brickSize) {
        for (let j = 0; j < width; j += brickSize) {
          ctx.strokeRect(x + j, y + i, brickSize, brickSize)
        }
      }
    }
    
    // Draw cloud
    function drawCloud(x, y) {
      ctx.fillStyle = colors.cloud
      ctx.fillRect(x + 8, y, 32, 16)
      ctx.fillRect(x, y + 8, 48, 16)
      ctx.fillRect(x + 8, y + 16, 32, 8)
    }
    
    // Spawn obstacle
    function spawnObstacle() {
      const height = 32 + Math.floor(Math.random() * 3) * 16
      obstacles.push({
        x: canvas.width,
        y: groundY - height,
        width: 32,
        height: height,
        speed: 4
      })
    }
    
    // Spawn cloud
    function spawnCloud() {
      clouds.push({
        x: canvas.width,
        y: 40 + Math.random() * 80,
        speed: 0.5 + Math.random() * 0.5
      })
    }
    
    // Check collision
    function checkCollision(player, obstacle) {
      return player.x + 8 < obstacle.x + obstacle.width &&
             player.x + player.width - 8 > obstacle.x &&
             player.y + 8 < obstacle.y + obstacle.height &&
             player.y + player.height > obstacle.y
    }
    
    // Jump function
    function jump() {
      if (!player.jumping && !gameOver) {
        player.velocityY = player.jumpPower
        player.jumping = true
      }
    }
    
    // Handle keypress
    function handleKeyPress(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameOver) {
          // Restart game
          setGameOver(false)
          setScore(0)
          obstacles.length = 0
          clouds.length = 0
          gameScore = 0
          player.y = 280
          player.velocityY = 0
          player.jumping = false
        } else {
          jump()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    
    // Game loop
    function gameLoop() {
      frameCount++
      
      // Draw sky
      ctx.fillStyle = colors.sky
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw clouds
      cloudTimer++
      if (cloudTimer > 150) {
        spawnCloud()
        cloudTimer = 0
      }
      
      for (let i = clouds.length - 1; i >= 0; i--) {
        const cloud = clouds[i]
        cloud.x -= cloud.speed
        drawCloud(cloud.x, cloud.y)
        
        if (cloud.x < -60) {
          clouds.splice(i, 1)
        }
      }
      
      if (!gameOver) {
        // Update player physics
        player.velocityY += player.gravity
        player.y += player.velocityY
        
        // Ground collision
        if (player.y + player.height >= groundY) {
          player.y = groundY - player.height
          player.velocityY = 0
          player.jumping = false
        }
        
        // Spawn obstacles
        obstacleTimer++
        if (obstacleTimer > 120) {
          spawnObstacle()
          obstacleTimer = 0
        }
        
        // Update and draw obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obstacle = obstacles[i]
          obstacle.x -= obstacle.speed
          
          // Draw obstacle
          drawBrick(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
          
          // Check collision
          if (checkCollision(player, obstacle)) {
            setGameOver(true)
          }
          
          // Remove off-screen obstacles and increase score
          if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1)
            gameScore += 10
            setScore(gameScore)
          }
        }
        
        // Draw player with running bob effect
        const runBob = player.jumping ? 0 : Math.sin(frameCount * 0.3) * 2
        drawGirl(player.x, player.y + runBob, player.jumping, frameCount)
      } else {
        // Draw player even when game over
        drawGirl(player.x, player.y, false, 0)
      }
      
      // Draw ground
      ctx.fillStyle = colors.ground
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY)
      
      // Draw grass on top of ground
      ctx.fillStyle = colors.grass
      for (let i = 0; i < canvas.width; i += 16) {
        ctx.fillRect(i, groundY, 16, 4)
      }
      
      // Draw score
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.font = 'bold 24px monospace'
      ctx.strokeText(`SCORE: ${gameScore}`, 10, 30)
      ctx.fillText(`SCORE: ${gameScore}`, 10, 30)
      
      if (gameOver) {
        // Game over screen with retro style
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 4
        ctx.font = 'bold 48px monospace'
        const gameOverText = 'GAME OVER'
        const textWidth = ctx.measureText(gameOverText).width
        ctx.strokeText(gameOverText, canvas.width / 2 - textWidth / 2, canvas.height / 2)
        ctx.fillText(gameOverText, canvas.width / 2 - textWidth / 2, canvas.height / 2)
        
        ctx.font = 'bold 20px monospace'
        const restartText = 'LEERTASTE ZUM NEUSTART'
        const restartWidth = ctx.measureText(restartText).width
        ctx.strokeText(restartText, canvas.width / 2 - restartWidth / 2, canvas.height / 2 + 50)
        ctx.fillText(restartText, canvas.width / 2 - restartWidth / 2, canvas.height / 2 + 50)
      }
      
      animationId = requestAnimationFrame(gameLoop)
    }
    
    gameLoop()
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [gameStarted, gameOver])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#5c94fc' }}>
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-6xl font-mono font-bold" style={{ 
            color: '#ffffff',
            textShadow: '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.3)',
            letterSpacing: '0.1em'
          }}>
            JUMP & RUN
          </h1>
          <div className="text-2xl font-mono font-bold text-white" style={{
            textShadow: '2px 2px 0px #000000'
          }}>
            🌟 Springe über die Hindernisse! 🌟
          </div>
          <p className="text-xl font-mono text-white" style={{
            textShadow: '2px 2px 0px #000000'
          }}>
            Drücke LEERTASTE zum Springen
          </p>
          <button
            onClick={() => setGameStarted(true)}
            className="px-12 py-6 text-2xl font-mono font-bold rounded-lg transition-all duration-200 transform hover:scale-110"
            style={{
              background: '#00a800',
              color: '#ffffff',
              border: '4px solid #006400',
              boxShadow: '0 6px 0 #006400, 0 8px 8px rgba(0,0,0,0.4)',
              textShadow: '2px 2px 0px #006400'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(4px) scale(1.1)'
              e.currentTarget.style.boxShadow = '0 2px 0 #006400, 0 4px 4px rgba(0,0,0,0.4)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1.1)'
              e.currentTarget.style.boxShadow = '0 6px 0 #006400, 0 8px 8px rgba(0,0,0,0.4)'
            }}
          >
            ▶ START
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="rounded-lg"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '8px solid #8b5524',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
            }}
          />
          <div className="text-2xl font-mono font-bold px-6 py-3 rounded-lg" style={{
            background: '#000000',
            color: '#ffffff',
            border: '4px solid #ffffff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
          }}>
            💎 Score: {score} | ⬆️ LEERTASTE zum Springen
          </div>
        </div>
      )}
    </div>
  )
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

  // Wenn die Lösung korrekt ist, zeige das Jump & Run Spiel
  if (showSuccess) {
    return <JumpAndRunGame />
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


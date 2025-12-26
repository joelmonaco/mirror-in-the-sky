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
  const [isPaused, setIsPaused] = useState(false)
  const [isMusicMuted, setIsMusicMuted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Audio refs
  const soundtrackRef = useRef(null)
  const jumpSoundRef = useRef(null)
  const gameOverSoundRef = useRef(null)
  const coinSoundRef = useRef(null)
  
  // Detect mobile/tablet on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    if (!gameStarted) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    // Ground level (dynamic based on canvas height)
    const groundY = canvas.height - 50
    
    // Game variables
    const player = {
      x: 120,
      y: groundY - 120,
      width: 48,
      height: 72,
      velocityY: 0,
      jumping: false,
      gravity: 1.0,
      jumpPower: -16.5
    }
    
    const dog = {
      x: 50,
      y: groundY - 90,
      width: 32,
      height: 24,
      velocityY: 0,
      jumping: false,
      offsetX: -60
    }
    
    const obstacles = []
    const gaps = [] // Holes in the ground
    const diamonds = []
    const confetti = []
    const clouds = []
    let obstacleTimer = 0
    let cloudTimer = 0
    let gapTimer = 0
    let diamondTimer = 0
    let gameScore = 0
    let animationId
    let frameCount = 0
    let gameWon = false
    let showingCoordinates = false
    let confettiTimer = 0
    let lastObstacleX = -500 // Track last obstacle position
    let lastGapX = -500 // Track last gap position
    
    // Get sky colors based on score
    function getSkyColors(score) {
      if (score < 500) {
        // Day sky (blue)
        return {
          skyTop: '#5c94fc',
          skyMiddle: '#7eabfc',
          skyBottom: '#a4c8fc',
          cloud: '#ffffff'
        }
      } else if (score < 750) {
        // Sunset transition (500-750)
        const progress = (score - 500) / 250 // 0 to 1
        
        // Interpolate from day to sunset
        const dayTop = { r: 92, g: 148, b: 252 }
        const sunsetTop = { r: 255, g: 107, b: 53 }
        const dayMiddle = { r: 126, g: 171, b: 252 }
        const sunsetMiddle = { r: 255, g: 154, b: 86 }
        const dayBottom = { r: 164, g: 200, b: 252 }
        const sunsetBottom = { r: 255, g: 214, b: 165 }
        
        const topR = Math.floor(dayTop.r + (sunsetTop.r - dayTop.r) * progress)
        const topG = Math.floor(dayTop.g + (sunsetTop.g - dayTop.g) * progress)
        const topB = Math.floor(dayTop.b + (sunsetTop.b - dayTop.b) * progress)
        
        const midR = Math.floor(dayMiddle.r + (sunsetMiddle.r - dayMiddle.r) * progress)
        const midG = Math.floor(dayMiddle.g + (sunsetMiddle.g - dayMiddle.g) * progress)
        const midB = Math.floor(dayMiddle.b + (sunsetMiddle.b - dayMiddle.b) * progress)
        
        const botR = Math.floor(dayBottom.r + (sunsetBottom.r - dayBottom.r) * progress)
        const botG = Math.floor(dayBottom.g + (sunsetBottom.g - dayBottom.g) * progress)
        const botB = Math.floor(dayBottom.b + (sunsetBottom.b - dayBottom.b) * progress)
        
        return {
          skyTop: `rgb(${topR}, ${topG}, ${topB})`,
          skyMiddle: `rgb(${midR}, ${midG}, ${midB})`,
          skyBottom: `rgb(${botR}, ${botG}, ${botB})`,
          cloud: '#ffeaa7' // Golden clouds
        }
      } else {
        // Night sky transition (750+)
        const progress = Math.min((score - 750) / 250, 1) // 0 to 1, capped at 1
        
        // Interpolate from sunset to night
        const sunsetTop = { r: 255, g: 107, b: 53 }
        const nightTop = { r: 10, g: 10, b: 40 }
        const sunsetMiddle = { r: 255, g: 154, b: 86 }
        const nightMiddle = { r: 20, g: 20, b: 60 }
        const sunsetBottom = { r: 255, g: 214, b: 165 }
        const nightBottom = { r: 40, g: 40, b: 80 }
        
        const topR = Math.floor(sunsetTop.r + (nightTop.r - sunsetTop.r) * progress)
        const topG = Math.floor(sunsetTop.g + (nightTop.g - sunsetTop.g) * progress)
        const topB = Math.floor(sunsetTop.b + (nightTop.b - sunsetTop.b) * progress)
        
        const midR = Math.floor(sunsetMiddle.r + (nightMiddle.r - sunsetMiddle.r) * progress)
        const midG = Math.floor(sunsetMiddle.g + (nightMiddle.g - sunsetMiddle.g) * progress)
        const midB = Math.floor(sunsetMiddle.b + (nightMiddle.b - sunsetMiddle.b) * progress)
        
        const botR = Math.floor(sunsetBottom.r + (nightBottom.r - sunsetBottom.r) * progress)
        const botG = Math.floor(sunsetBottom.g + (nightBottom.g - sunsetBottom.g) * progress)
        const botB = Math.floor(sunsetBottom.b + (nightBottom.b - sunsetBottom.b) * progress)
        
        return {
          skyTop: `rgb(${topR}, ${topG}, ${topB})`,
          skyMiddle: `rgb(${midR}, ${midG}, ${midB})`,
          skyBottom: `rgb(${botR}, ${botG}, ${botB})`,
          cloud: progress > 0.5 ? '#555577' : '#aa9988' // Darker clouds at night
        }
      }
    }
    
    // Nintendo Color Palette
    const colors = {
      ground: '#8b5524',
      grass: '#00a800',
      brick: '#e39d3e',
      skin: '#ffcca1',
      hair: '#ffd700',
      shirt: '#0066ff',
      logo: '#ff0000',
      logoYellow: '#ffcc00',
      pants: '#0033aa',
      shoes: '#8b4513',
      eyes: '#6b8e7d',
      lips: '#c75b7a',
      dogNose: '#d4a574'
    }
    
    // Draw pixel girl character with animations
    function drawGirl(x, y, isJumping, frame) {
      const pixelSize = 6
      
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
        
        // Eyes (excited) - green/grey, closer together
        ctx.fillStyle = colors.eyes
        ctx.fillRect(x + pixelSize * 2.5, y + pixelSize * 4, pixelSize, pixelSize)
        ctx.fillRect(x + pixelSize * 4.5, y + pixelSize * 4, pixelSize, pixelSize)
        
        // Pupils (black dots in eyes)
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + pixelSize * 2.8, y + pixelSize * 4.3, pixelSize * 0.4, pixelSize * 0.4)
        ctx.fillRect(x + pixelSize * 4.8, y + pixelSize * 4.3, pixelSize * 0.4, pixelSize * 0.4)
        
        // Lips (dark pink)
        ctx.fillStyle = colors.lips
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 5.5, pixelSize * 2, pixelSize * 0.5)
        
        // Blue T-Shirt
        ctx.fillStyle = colors.shirt
        ctx.fillRect(x + pixelSize, y + pixelSize * 6, pixelSize * 6, pixelSize * 4)
        
        // Superman-style Logo background (shield shape)
        ctx.fillStyle = colors.logo
        // Shield/pentagon shape - larger and more visible
        ctx.fillRect(x + pixelSize * 2.5, y + pixelSize * 7, pixelSize * 3, pixelSize * 0.8)
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 7.8, pixelSize * 4, pixelSize * 1.2)
        ctx.fillRect(x + pixelSize * 2.5, y + pixelSize * 9, pixelSize * 3, pixelSize * 0.8)
        
        // Letter "A" in the logo - clear and bold
        ctx.fillStyle = colors.logoYellow
        // Left side of A
        ctx.fillRect(x + pixelSize * 2.8, y + pixelSize * 7.5, pixelSize * 0.7, pixelSize * 2)
        // Right side of A
        ctx.fillRect(x + pixelSize * 4.5, y + pixelSize * 7.5, pixelSize * 0.7, pixelSize * 2)
        // Top of A
        ctx.fillRect(x + pixelSize * 3.5, y + pixelSize * 7.5, pixelSize, pixelSize * 0.6)
        // Crossbar of A (middle bar)
        ctx.fillRect(x + pixelSize * 2.8, y + pixelSize * 8.5, pixelSize * 2.4, pixelSize * 0.5)
        
        // Pants/Shorts
        ctx.fillStyle = colors.pants
        ctx.fillRect(x + pixelSize, y + pixelSize * 10, pixelSize * 6, pixelSize)
        
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
        
        // Eyes - green/grey, closer together
        ctx.fillStyle = colors.eyes
        ctx.fillRect(x + pixelSize * 2.5, y + pixelSize * 4, pixelSize, pixelSize)
        ctx.fillRect(x + pixelSize * 4.5, y + pixelSize * 4, pixelSize, pixelSize)
        
        // Pupils (black dots in eyes)
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + pixelSize * 2.8, y + pixelSize * 4.3, pixelSize * 0.4, pixelSize * 0.4)
        ctx.fillRect(x + pixelSize * 4.8, y + pixelSize * 4.3, pixelSize * 0.4, pixelSize * 0.4)
        
        // Lips (dark pink)
        ctx.fillStyle = colors.lips
        ctx.fillRect(x + pixelSize * 3, y + pixelSize * 5.5, pixelSize * 2, pixelSize * 0.5)
        
        // Blue T-Shirt
        ctx.fillStyle = colors.shirt
        ctx.fillRect(x + pixelSize, y + pixelSize * 6, pixelSize * 6, pixelSize * 4)
        
        // Superman-style Logo background (shield shape)
        ctx.fillStyle = colors.logo
        // Shield/pentagon shape - larger and more visible
        ctx.fillRect(x + pixelSize * 2.5, y + pixelSize * 7, pixelSize * 3, pixelSize * 0.8)
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 7.8, pixelSize * 4, pixelSize * 1.2)
        ctx.fillRect(x + pixelSize * 2.5, y + pixelSize * 9, pixelSize * 3, pixelSize * 0.8)
        
        // Letter "A" in the logo - clear and bold
        ctx.fillStyle = colors.logoYellow
        // Left side of A
        ctx.fillRect(x + pixelSize * 2.8, y + pixelSize * 7.5, pixelSize * 0.7, pixelSize * 2)
        // Right side of A
        ctx.fillRect(x + pixelSize * 4.5, y + pixelSize * 7.5, pixelSize * 0.7, pixelSize * 2)
        // Top of A
        ctx.fillRect(x + pixelSize * 3.5, y + pixelSize * 7.5, pixelSize, pixelSize * 0.6)
        // Crossbar of A (middle bar)
        ctx.fillRect(x + pixelSize * 2.8, y + pixelSize * 8.5, pixelSize * 2.4, pixelSize * 0.5)
        
        // Pants/Shorts
        ctx.fillStyle = colors.pants
        ctx.fillRect(x + pixelSize, y + pixelSize * 10, pixelSize * 6, pixelSize)
        
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
    
    // Draw white dog character
    function drawDog(x, y, isJumping, frame) {
      const pixelSize = 4
      
      if (isJumping) {
        // Jumping pose - legs together, ears up
        // Body (white)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x + pixelSize, y + pixelSize * 2, pixelSize * 6, pixelSize * 3)
        
        // Head
        ctx.fillRect(x + pixelSize * 5, y, pixelSize * 3, pixelSize * 3)
        
        // Ears (up when jumping)
        ctx.fillRect(x + pixelSize * 5, y - pixelSize, pixelSize, pixelSize)
        ctx.fillRect(x + pixelSize * 7, y - pixelSize, pixelSize, pixelSize)
        
        // Snout
        ctx.fillStyle = '#ffcca1'
        ctx.fillRect(x + pixelSize * 7, y + pixelSize, pixelSize * 2, pixelSize * 2)
        
        // Nose (light brown)
        ctx.fillStyle = colors.dogNose
        ctx.fillRect(x + pixelSize * 8, y + pixelSize, pixelSize, pixelSize)
        
        // Eyes
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + pixelSize * 5, y + pixelSize, pixelSize, pixelSize)
        ctx.fillRect(x + pixelSize * 7, y + pixelSize, pixelSize, pixelSize)
        
        // Legs together (jumping)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x + pixelSize * 2, y + pixelSize * 5, pixelSize * 2, pixelSize)
        ctx.fillRect(x + pixelSize * 4, y + pixelSize * 5, pixelSize * 2, pixelSize)
        
        // Tail up
        ctx.fillRect(x, y + pixelSize, pixelSize * 2, pixelSize * 2)
        
      } else {
        // Running animation
        const runFrame = Math.floor(frame / 8) % 2
        
        // Body (white)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x + pixelSize, y + pixelSize * 2, pixelSize * 6, pixelSize * 3)
        
        // Head
        ctx.fillRect(x + pixelSize * 5, y, pixelSize * 3, pixelSize * 3)
        
        // Ears (floppy)
        ctx.fillRect(x + pixelSize * 5, y + pixelSize, pixelSize, pixelSize * 2)
        ctx.fillRect(x + pixelSize * 7, y + pixelSize, pixelSize, pixelSize * 2)
        
        // Snout
        ctx.fillStyle = '#ffcca1'
        ctx.fillRect(x + pixelSize * 7, y + pixelSize, pixelSize * 2, pixelSize * 2)
        
        // Nose (light brown)
        ctx.fillStyle = colors.dogNose
        ctx.fillRect(x + pixelSize * 8, y + pixelSize, pixelSize, pixelSize)
        
        // Eyes
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + pixelSize * 5, y + pixelSize, pixelSize, pixelSize)
        ctx.fillRect(x + pixelSize * 7, y + pixelSize, pixelSize, pixelSize)
        
        // Legs - running animation
        ctx.fillStyle = '#ffffff'
        if (runFrame === 0) {
          // Frame 1: Left legs forward
          ctx.fillRect(x + pixelSize * 2, y + pixelSize * 5, pixelSize, pixelSize)
          ctx.fillRect(x + pixelSize * 5, y + pixelSize * 5, pixelSize, pixelSize)
        } else {
          // Frame 2: Right legs forward
          ctx.fillRect(x + pixelSize * 3, y + pixelSize * 5, pixelSize, pixelSize)
          ctx.fillRect(x + pixelSize * 4, y + pixelSize * 5, pixelSize, pixelSize)
        }
        
        // Tail wagging
        if (runFrame === 0) {
          ctx.fillRect(x, y + pixelSize * 2, pixelSize * 2, pixelSize)
        } else {
          ctx.fillRect(x, y + pixelSize * 3, pixelSize * 2, pixelSize)
        }
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
    function drawCloud(x, y, cloudColor) {
      ctx.fillStyle = cloudColor
      ctx.fillRect(x + 8, y, 32, 16)
      ctx.fillRect(x, y + 8, 48, 16)
      ctx.fillRect(x + 8, y + 16, 32, 8)
    }
    
    // Draw diamond collectible
    function drawDiamond(x, y, frame) {
      const size = 24
      const bounce = Math.sin(frame * 0.1) * 5
      const actualY = y + bounce
      
      // Outer diamond (cyan/turquoise)
      ctx.fillStyle = '#00d4ff'
      ctx.beginPath()
      ctx.moveTo(x + size / 2, actualY)
      ctx.lineTo(x + size, actualY + size / 2)
      ctx.lineTo(x + size / 2, actualY + size)
      ctx.lineTo(x, actualY + size / 2)
      ctx.closePath()
      ctx.fill()
      
      // Inner sparkle (bright cyan)
      ctx.fillStyle = '#7fffd4'
      ctx.beginPath()
      ctx.moveTo(x + size / 2, actualY + size / 3)
      ctx.lineTo(x + size * 0.65, actualY + size / 2)
      ctx.lineTo(x + size / 2, actualY + size * 0.7)
      ctx.lineTo(x + size * 0.35, actualY + size / 2)
      ctx.closePath()
      ctx.fill()
      
      // Sparkle effect
      if (frame % 20 < 10) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x - 4, actualY + size / 2 - 1, 3, 3)
        ctx.fillRect(x + size + 2, actualY + size / 2 - 1, 3, 3)
        ctx.fillRect(x + size / 2 - 1, actualY - 4, 3, 3)
        ctx.fillRect(x + size / 2 - 1, actualY + size + 2, 3, 3)
      }
    }
    
    // Draw gap/hole in ground
    function drawGap(x, width) {
      // Black void/abyss
      ctx.fillStyle = '#000000'
      ctx.fillRect(x, groundY, width, 50)
      
      // Yellow/Black warning stripes on LEFT edge (diagonal pattern)
      ctx.fillStyle = '#ffff00'
      for (let i = 0; i < 50; i += 8) {
        ctx.fillRect(x - 8, groundY + i, 8, 4)
      }
      ctx.fillStyle = '#000000'
      for (let i = 0; i < 50; i += 8) {
        ctx.fillRect(x - 8, groundY + i + 4, 8, 4)
      }
      
      // Yellow/Black warning stripes on RIGHT edge
      ctx.fillStyle = '#ffff00'
      for (let i = 0; i < 50; i += 8) {
        ctx.fillRect(x + width, groundY + i, 8, 4)
      }
      ctx.fillStyle = '#000000'
      for (let i = 0; i < 50; i += 8) {
        ctx.fillRect(x + width, groundY + i + 4, 8, 4)
      }
      
      // Red danger border around the gap
      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 3
      ctx.strokeRect(x, groundY, width, 5)
      
      // Draw some depth lines in the hole
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      for (let i = 0; i < width; i += 10) {
        ctx.beginPath()
        ctx.moveTo(x + i, groundY)
        ctx.lineTo(x + i, groundY + 50)
        ctx.stroke()
      }
    }
    
    // Draw confetti particle
    function drawConfetti(particle) {
      ctx.fillStyle = particle.color
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.fillRect(-4, -4, 8, 8)
      ctx.restore()
    }
    
    // Check if area is clear for spawning
    function isAreaClear(x, minDistance) {
      // Check all existing obstacles
      for (let obstacle of obstacles) {
        if (Math.abs(obstacle.x - x) < minDistance) {
          return false
        }
      }
      // Check all existing gaps
      for (let gap of gaps) {
        if (Math.abs(gap.x - x) < minDistance) {
          return false
        }
      }
      return true
    }
    
    // Spawn obstacle (more varied timing)
    function spawnObstacle() {
      const minDistance = 280 // Minimum distance between different obstacle types
      
      // Check if area is clear
      if (!isAreaClear(canvas.width, minDistance)) {
        return false // Don't spawn, too close to another obstacle
      }
      
      const height = 32 + Math.floor(Math.random() * 4) * 16
      obstacles.push({
        x: canvas.width,
        y: groundY - height,
        width: 32,
        height: height,
        speed: 4
      })
      lastObstacleX = canvas.width
      
      // Sometimes spawn another obstacle close behind (15% chance, reduced for fairness)
      if (Math.random() < 0.15) {
        setTimeout(() => {
          const height2 = 32 + Math.floor(Math.random() * 3) * 16
          obstacles.push({
            x: canvas.width + 150,
            y: groundY - height2,
            width: 32,
            height: height2,
            speed: 4
          })
        }, 350)
      }
      
      return true
    }
    
    // Spawn gap/hole
    function spawnGap() {
      const minDistance = 280 // Minimum distance between different obstacle types
      
      // Check if area is clear
      if (!isAreaClear(canvas.width, minDistance)) {
        return false // Don't spawn, too close to another obstacle
      }
      
      const width = 70 + Math.random() * 20 // Smaller, more jumpable gaps
      gaps.push({
        x: canvas.width,
        width: width,
        speed: 4
      })
      lastGapX = canvas.width
      
      return true
    }
    
    // Spawn diamond
    function spawnDiamond() {
      // Check if area is relatively clear (smaller distance requirement for diamonds)
      if (!isAreaClear(canvas.width, 150)) {
        return false // Don't spawn if too crowded
      }
      
      // Spawn diamonds between 100-300 pixels above ground, proportional to screen size
      const minHeight = Math.min(100, canvas.height * 0.2)
      const maxHeight = Math.min(300, canvas.height * 0.5)
      const height = groundY - minHeight - Math.random() * (maxHeight - minHeight)
      diamonds.push({
        x: canvas.width,
        y: height,
        width: 24,
        height: 24,
        speed: 4,
        collected: false
      })
      
      return true
    }
    
    // Spawn cloud
    function spawnCloud() {
      const cloudMinY = canvas.height * 0.08 // 8% from top
      const cloudMaxY = canvas.height * 0.25 // 25% from top
      clouds.push({
        x: canvas.width,
        y: cloudMinY + Math.random() * (cloudMaxY - cloudMinY),
        speed: 0.5 + Math.random() * 0.5
      })
    }
    
    // Create confetti
    function createConfetti() {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500']
      for (let i = 0; i < 150; i++) {
        confetti.push({
          x: canvas.width / 2,
          y: canvas.height / 3,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10 - 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        })
      }
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
      if (!player.jumping && !gameOver && !gameWon && !isPaused) {
        player.velocityY = player.jumpPower
        player.jumping = true
        
        // Play jump sound
        if (jumpSoundRef.current) {
          jumpSoundRef.current.currentTime = 0
          jumpSoundRef.current.play().catch(e => console.log('Jump sound error:', e))
        }
      }
    }
    
    // Handle keypress
    function handleKeyPress(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameOver || showingCoordinates) {
          // Restart game
          setGameOver(false)
          setScore(0)
          obstacles.length = 0
          gaps.length = 0
          diamonds.length = 0
          confetti.length = 0
          clouds.length = 0
          gameScore = 0
          gameWon = false
          showingCoordinates = false
          confettiTimer = 0
          lastObstacleX = -500
          lastGapX = -500
          obstacleTimer = 0
          gapTimer = 0
          diamondTimer = 0
          player.y = groundY - 120
          player.velocityY = 0
          player.jumping = false
          dog.y = groundY - 90
          dog.velocityY = 0
          dog.jumping = false
          
          // Restart soundtrack
          if (soundtrackRef.current && !isMusicMuted) {
            soundtrackRef.current.currentTime = 0
            soundtrackRef.current.play().catch(e => console.log('Soundtrack error:', e))
          }
        } else {
          jump()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    
    // Draw stars for night sky
    function drawStars(score) {
      if (score < 750) return
      
      const starProgress = Math.min((score - 750) / 250, 1)
      const numStars = Math.floor(starProgress * 80)
      
      // Seed-based random stars so they stay in same place
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < numStars; i++) {
        const x = (i * 1234.5 % canvas.width)
        const y = (i * 789.3 % (groundY - 50))
        const size = (i % 3) === 0 ? 2 : 1
        ctx.fillRect(x, y, size, size)
        
        // Twinkling effect
        if ((frameCount + i * 10) % 60 < 30) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.fillRect(x, y, size, size)
          ctx.fillStyle = '#ffffff'
        }
      }
    }
    
    // Game loop
    function gameLoop() {
      // Skip updates if paused, but still draw
      if (!isPaused) {
        frameCount++
      }
      
      // Get dynamic sky colors based on score
      const skyColors = getSkyColors(gameScore)
      
      // Draw dynamic sky with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, skyColors.skyTop)
      gradient.addColorStop(0.5, skyColors.skyMiddle)
      gradient.addColorStop(1, skyColors.skyBottom)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw stars if night time (score >= 750)
      drawStars(gameScore)
      
      // Update and draw clouds
      if (!isPaused) {
        cloudTimer++
        if (cloudTimer > 150) {
          spawnCloud()
          cloudTimer = 0
        }
        
        for (let i = clouds.length - 1; i >= 0; i--) {
          const cloud = clouds[i]
          cloud.x -= cloud.speed
          if (cloud.x < -60) {
            clouds.splice(i, 1)
          }
        }
      }
      
      // Always draw clouds with dynamic color
      for (let i = 0; i < clouds.length; i++) {
        drawCloud(clouds[i].x, clouds[i].y, skyColors.cloud)
      }
      
      if (!gameOver && !gameWon && !isPaused) {
        // Update player physics
        player.velocityY += player.gravity
        player.y += player.velocityY
        
        // Ground collision
        if (player.y + player.height >= groundY) {
          player.y = groundY - player.height
          player.velocityY = 0
          player.jumping = false
        }
        
        // Update dog physics - follow player
        dog.x = player.x + dog.offsetX
        
        // Dog jumps when player jumps
        if (player.jumping && !dog.jumping && player.velocityY < 0) {
          dog.velocityY = player.jumpPower
          dog.jumping = true
        }
        
        dog.velocityY += player.gravity
        dog.y += dog.velocityY
        
        // Dog ground collision
        if (dog.y + dog.height >= groundY) {
          dog.y = groundY - dog.height
          dog.velocityY = 0
          dog.jumping = false
        }
        
        // Spawn obstacles (more varied timing)
        obstacleTimer++
        const obstacleSpawnInterval = 90 + Math.random() * 60
        if (obstacleTimer > obstacleSpawnInterval) {
          const spawned = spawnObstacle()
          if (spawned !== false) {
            obstacleTimer = 0
          } else {
            // If spawn was blocked, wait a bit and try again
            obstacleTimer = obstacleSpawnInterval - 30
          }
        }
        
        // Spawn gaps occasionally (less frequent now)
        gapTimer++
        if (gapTimer > 500) {
          const spawned = spawnGap()
          if (spawned !== false) {
            gapTimer = Math.random() * 150 // Random offset
          } else {
            // If spawn was blocked, wait a bit and try again
            gapTimer = 450
          }
        }
        
        // Spawn diamonds regularly
        diamondTimer++
        if (diamondTimer > 100) {
          const spawned = spawnDiamond()
          if (spawned !== false) {
            diamondTimer = 0
          } else {
            // If spawn was blocked, try again soon
            diamondTimer = 80
          }
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
            // Play game over sound
            if (gameOverSoundRef.current) {
              gameOverSoundRef.current.currentTime = 0
              gameOverSoundRef.current.play().catch(e => console.log('Game over sound error:', e))
            }
            // Stop soundtrack
            if (soundtrackRef.current) {
              soundtrackRef.current.pause()
            }
          }
          
          // Remove off-screen obstacles and increase score
          if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1)
            gameScore += 10
            setScore(gameScore)
          }
        }
        
        // Update lastObstacleX to the rightmost obstacle on screen
        if (obstacles.length > 0) {
          lastObstacleX = Math.max(...obstacles.map(o => o.x))
        } else {
          lastObstacleX = -500
        }
        
        // Update gaps (just move them, don't draw yet)
        for (let i = gaps.length - 1; i >= 0; i--) {
          const gap = gaps[i]
          gap.x -= gap.speed
          
          // Check if PLAYER (not dog) falls into gap (very lenient hitbox)
          const playerCenterX = player.x + player.width / 2
          const playerOnGround = player.y + player.height >= groundY - 2
          
          // Only game over if the CENTER of PLAYER is WELL inside the gap AND touching ground
          // Dog can fall in, doesn't matter!
          if (playerOnGround && playerCenterX > gap.x + 20 && playerCenterX < gap.x + gap.width - 20) {
            setGameOver(true)
            // Play game over sound
            if (gameOverSoundRef.current) {
              gameOverSoundRef.current.currentTime = 0
              gameOverSoundRef.current.play().catch(e => console.log('Game over sound error:', e))
            }
            // Stop soundtrack
            if (soundtrackRef.current) {
              soundtrackRef.current.pause()
            }
          }
          
          // Remove off-screen gaps
          if (gap.x + gap.width < 0) {
            gaps.splice(i, 1)
            gameScore += 5
            setScore(gameScore)
          }
        }
        
        // Update lastGapX to the rightmost gap on screen
        if (gaps.length > 0) {
          lastGapX = Math.max(...gaps.map(g => g.x))
        } else {
          lastGapX = -500
        }
        
        // Update and draw diamonds
        for (let i = diamonds.length - 1; i >= 0; i--) {
          const diamond = diamonds[i]
          diamond.x -= diamond.speed
          
          // Draw diamond
          drawDiamond(diamond.x, diamond.y, frameCount)
          
          // Check collection
          if (!diamond.collected && 
              player.x < diamond.x + diamond.width &&
              player.x + player.width > diamond.x &&
              player.y < diamond.y + diamond.height &&
              player.y + player.height > diamond.y) {
            diamond.collected = true
            gameScore += 20
            setScore(gameScore)
            diamonds.splice(i, 1)
            
            // Play coin sound
            if (coinSoundRef.current) {
              coinSoundRef.current.currentTime = 0
              coinSoundRef.current.play().catch(e => console.log('Coin sound error:', e))
            }
            continue
          }
          
          // Remove off-screen diamonds
          if (diamond.x + diamond.width < 0) {
            diamonds.splice(i, 1)
          }
        }
        
        // Check win condition
        if (gameScore >= 1000 && !gameWon) {
          gameWon = true
          createConfetti()
        }
      }
      
      // Continue moving obstacles even when won (until coordinates show)
      if (gameWon && !showingCoordinates && !isPaused) {
        // Keep obstacles moving
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obstacle = obstacles[i]
          obstacle.x -= obstacle.speed
          drawBrick(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
          if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1)
          }
        }
        
        // Keep gaps moving (don't draw yet)
        for (let i = gaps.length - 1; i >= 0; i--) {
          const gap = gaps[i]
          gap.x -= gap.speed
          if (gap.x + gap.width < 0) {
            gaps.splice(i, 1)
          }
        }
        
        // Keep diamonds moving
        for (let i = diamonds.length - 1; i >= 0; i--) {
          const diamond = diamonds[i]
          diamond.x -= diamond.speed
          drawDiamond(diamond.x, diamond.y, frameCount)
          if (diamond.x + diamond.width < 0) {
            diamonds.splice(i, 1)
          }
        }
      }
      
      if (!gameOver && !showingCoordinates) {
        // Draw dog first (behind player)
        const dogBob = dog.jumping ? 0 : Math.sin(frameCount * 0.3) * 1.5
        drawDog(dog.x, dog.y + dogBob, dog.jumping, frameCount)
        
        // Draw player with running bob effect
        const runBob = player.jumping ? 0 : Math.sin(frameCount * 0.3) * 2
        drawGirl(player.x, player.y + runBob, player.jumping, frameCount)
      } else if (!showingCoordinates) {
        // Draw dog even when game over
        drawDog(dog.x, dog.y, false, 0)
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
      
      // Draw gaps/holes AFTER ground (so they're visible)
      for (let i = 0; i < gaps.length; i++) {
        drawGap(gaps[i].x, gaps[i].width)
      }
      
      // Update and draw confetti
      if (gameWon && !isPaused) {
        confettiTimer++
        
        for (let i = confetti.length - 1; i >= 0; i--) {
          const particle = confetti[i]
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.3 // Gravity
          particle.rotation += particle.rotationSpeed
          
          drawConfetti(particle)
          
          // Remove particles that fell off screen
          if (particle.y > canvas.height) {
            confetti.splice(i, 1)
          }
        }
        
        // After confetti (3 seconds), show coordinates
        if (confettiTimer > 180) {
          showingCoordinates = true
        }
      } else if (gameWon && isPaused) {
        // Still draw confetti when paused, just don't update
        for (let i = 0; i < confetti.length; i++) {
          drawConfetti(confetti[i])
        }
      }
      
      // Draw score
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.font = 'bold 24px monospace'
      ctx.strokeText(`SCORE: ${gameScore}`, 10, 30)
      ctx.fillText(`SCORE: ${gameScore}`, 10, 30)
      
      if (showingCoordinates) {
        // Win screen with coordinates
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 4
        
        // Congratulations text
        ctx.font = 'bold 36px monospace'
        const winText = 'DU HAST ES GESCHAFFT!'
        const winWidth = ctx.measureText(winText).width
        ctx.strokeText(winText, canvas.width / 2 - winWidth / 2, canvas.height / 2 - 80)
        ctx.fillText(winText, canvas.width / 2 - winWidth / 2, canvas.height / 2 - 80)
        
        // Coordinates (bold and centered)
        ctx.font = 'bold 28px monospace'
        const coords = '49.853666531564116, 8.64915914604958'
        const coordsWidth = ctx.measureText(coords).width
        ctx.strokeText(coords, canvas.width / 2 - coordsWidth / 2, canvas.height / 2)
        ctx.fillText(coords, canvas.width / 2 - coordsWidth / 2, canvas.height / 2)
        
        // Date text
        ctx.font = 'bold 22px monospace'
        const dateText = 'Datum: _ _._ _._ _'
        const dateWidth = ctx.measureText(dateText).width
        ctx.strokeText(dateText, canvas.width / 2 - dateWidth / 2, canvas.height / 2 + 50)
        ctx.fillText(dateText, canvas.width / 2 - dateWidth / 2, canvas.height / 2 + 50)
        
        // Message
        ctx.font = 'bold 16px monospace'
        const msg1 = 'Hier wird es weitergehen.'
        const msg2 = 'Und um zu verstehen wann, musst du'
        const msg3 = 'an den Anfang zurückkehren.'
        const msg1Width = ctx.measureText(msg1).width
        const msg2Width = ctx.measureText(msg2).width
        const msg3Width = ctx.measureText(msg3).width
        ctx.strokeText(msg1, canvas.width / 2 - msg1Width / 2, canvas.height / 2 + 100)
        ctx.fillText(msg1, canvas.width / 2 - msg1Width / 2, canvas.height / 2 + 100)
        ctx.strokeText(msg2, canvas.width / 2 - msg2Width / 2, canvas.height / 2 + 125)
        ctx.fillText(msg2, canvas.width / 2 - msg2Width / 2, canvas.height / 2 + 125)
        ctx.strokeText(msg3, canvas.width / 2 - msg3Width / 2, canvas.height / 2 + 150)
        ctx.fillText(msg3, canvas.width / 2 - msg3Width / 2, canvas.height / 2 + 150)
        
        // Restart hint
        ctx.font = 'bold 14px monospace'
        const restartText = 'LEERTASTE ZUM NEUSTART'
        const restartWidth = ctx.measureText(restartText).width
        ctx.strokeText(restartText, canvas.width / 2 - restartWidth / 2, canvas.height / 2 + 190)
        ctx.fillText(restartText, canvas.width / 2 - restartWidth / 2, canvas.height / 2 + 190)
        
      } else if (gameOver) {
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
  
  // Initialize audio on start
  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      // Set volumes
      if (jumpSoundRef.current) jumpSoundRef.current.volume = 0.3
      if (coinSoundRef.current) coinSoundRef.current.volume = 0.5
      if (gameOverSoundRef.current) gameOverSoundRef.current.volume = 0.6
      if (soundtrackRef.current) soundtrackRef.current.volume = 0.4
      
      // Play soundtrack
      if (soundtrackRef.current && !isMusicMuted) {
        soundtrackRef.current.loop = true
        soundtrackRef.current.play().catch(e => console.log('Soundtrack error:', e))
      }
    }
  }, [gameStarted])
  
  // Handle soundtrack mute/unmute
  useEffect(() => {
    if (soundtrackRef.current) {
      if (isMusicMuted || isPaused || gameOver) {
        soundtrackRef.current.pause()
      } else if (gameStarted && !gameOver) {
        soundtrackRef.current.play().catch(e => console.log('Soundtrack error:', e))
      }
    }
  }, [isMusicMuted, isPaused, gameOver, gameStarted])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#5c94fc' }}>
      {/* Hidden audio elements */}
      <audio ref={soundtrackRef} src="/soundtrack.mp3" />
      <audio ref={jumpSoundRef} src="/jump.mp3" />
      <audio ref={gameOverSoundRef} src="/game_over.mp3" />
      <audio ref={coinSoundRef} src="/coin.mp3" />
      
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-6 max-w-3xl">
          <h1 className="text-5xl font-mono font-bold text-center" style={{ 
            color: '#ffffff',
            textShadow: '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.3)',
            letterSpacing: '0.05em',
            lineHeight: '1.3'
          }}>
            AURELIA & AMY<br/>
            <span style={{ fontSize: '0.7em' }}>JUMPING & RUNNING</span>
          </h1>
          
          <div className="bg-black bg-opacity-70 p-6 rounded-lg border-4 border-white max-w-2xl">
            <div className="text-xl font-mono font-bold text-white mb-4" style={{
              textShadow: '2px 2px 0px #000000',
              textAlign: 'center'
            }}>
              🎯 SPIELANLEITUNG 🎯
            </div>
            <div className="text-base font-mono text-white space-y-3" style={{
              textShadow: '1px 1px 0px #000000',
              lineHeight: '1.6'
            }}>
              <p>
                <span className="font-bold text-yellow-300">🏆 Ziel:</span> Erreiche 1.000 Punkte, um das Spiel zu gewinnen!
              </p>
              <p>
                <span className="font-bold text-green-300">💎 Punkte sammeln:</span> Springe über Hürden und sammle Diamanten.
              </p>
              <p>
                <span className="font-bold text-blue-300">🦸‍♀️ Aurelia:</span> Berührst du eine Hürde = Game Over!
              </p>
              <p>
                <span className="font-bold text-pink-300">🐕 Amy:</span> Sie darf Hürden berühren - kein Problem!
              </p>
              <p className="mt-4 pt-4 border-t-2 border-white">
                <span className="font-bold text-orange-300">💻 Wichtig:</span> Bitte spiele dieses Spiel unbedingt auf einem Laptop!
              </p>
            </div>
          </div>
          
          <p className="text-xl font-mono font-bold text-white" style={{
            textShadow: '2px 2px 0px #000000'
          }}>
            ⬆️ Drücke LEERTASTE zum Springen
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
        <div className="flex flex-col items-center gap-6 w-full px-4">
          <div className="relative w-full max-w-5xl">
            {/* Music Control Button - Top Right */}
            <div className="absolute top-2 right-2 z-10">
              {/* Mute/Unmute Button */}
              <button
                onClick={() => setIsMusicMuted(!isMusicMuted)}
                className="w-12 h-12 rounded-lg font-bold transition-all duration-200 transform hover:scale-110"
                style={{
                  background: isMusicMuted ? '#ff0000' : '#00a800',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  boxShadow: '0 4px 0 #000000',
                  fontSize: '20px'
                }}
                title={isMusicMuted ? 'Musik einschalten' : 'Musik ausschalten'}
              >
                {isMusicMuted ? '🔇' : '🔊'}
              </button>
            </div>
            
            <canvas
              ref={canvasRef}
              width={isMobile ? 600 : 1000}
              height={isMobile ? 900 : 500}
              className="rounded-lg"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                border: '8px solid #8b5524',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
              }}
            />
          </div>
          
          {/* Desktop Info (nur auf großen Laptops/Desktops) */}
          <div className="hidden lg:block text-2xl font-mono font-bold px-6 py-3 rounded-lg" style={{
            background: '#000000',
            color: '#ffffff',
            border: '4px solid #ffffff',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
          }}>
            💎 Score: {score} | ⬆️ LEERTASTE zum Springen
          </div>
          
          {/* Mobile/Tablet/iPad Jump Button */}
          <div className="block lg:hidden w-full max-w-md">
            <button
              onClick={() => {
                // Trigger jump via code
                const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' })
                window.dispatchEvent(spaceEvent)
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' })
                window.dispatchEvent(spaceEvent)
              }}
              className="w-full py-8 text-4xl font-mono font-bold rounded-lg transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(180deg, #00d400 0%, #00a800 100%)',
                color: '#ffffff',
                border: '6px solid #006400',
                boxShadow: '0 8px 0 #006400, 0 12px 16px rgba(0,0,0,0.5)',
                textShadow: '3px 3px 0px #006400',
                touchAction: 'manipulation'
              }}
            >
              ⬆️ JUMP ⬆️
            </button>
            <div className="text-center text-xl font-mono font-bold mt-4 px-4 py-2 rounded" style={{
              background: 'rgba(0,0,0,0.7)',
              color: '#ffffff',
              textShadow: '1px 1px 0px #000000'
            }}>
              💎 Score: {score}
            </div>
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
  const [inputs, setInputs] = useState(['', '', '', '', '', ''])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  
  const CORRECT_ANSWER = ['+', '#', '!', '&', '+', ':)']
  
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
    const maxLength = index === 5 ? 2 : 1
    const filteredValue = value.slice(0, maxLength)
    
    const newInputs = [...inputs]
    newInputs[index] = filteredValue
    setInputs(newInputs)

    // Automatisch zum nächsten Feld springen, wenn ein Zeichen eingegeben wurde (außer beim letzten Feld)
    if (filteredValue && index < 5) {
      const nextInput = document.getElementById(`input-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }
  
  // Prüfe ob ein einzelnes Feld korrekt ist
  const isFieldCorrect = (index) => {
    return inputs[index] && inputs[index] === CORRECT_ANSWER[index]
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
        
        {/* 6 Input-Felder (das letzte ist doppelt so breit) */}
        <div className="flex gap-3 justify-center items-center flex-wrap">
          {inputs.map((value, index) => (
            <input
              key={index}
              id={`input-${index}`}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={index === 5 ? 2 : 1}
              className={`${
                index === 5 ? 'w-24 sm:w-28' : 'w-12 sm:w-14'
              } h-12 sm:h-14 text-center text-white bg-transparent border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xl sm:text-2xl font-mono transition-all duration-200 ${
                isShaking 
                  ? 'border-red-500 animate-shake' 
                  : isFieldCorrect(index)
                  ? 'border-green-500 bg-green-500 bg-opacity-20 focus:border-green-500 focus:ring-green-500'
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


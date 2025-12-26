'use client'

import { useState, useEffect, useRef } from 'react'

// 3D Racing Game Component - Mario Kart 64 Style
function RacingGame() {
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [timer, setTimer] = useState(90) // 90 Sekunden Zeit
  const [speed, setSpeed] = useState(0)
  const [drifting, setDrifting] = useState(false)
  const [collisions, setCollisions] = useState(0)
  const [coins, setCoins] = useState(0)
  const [distance, setDistance] = useState(0)
  
  // Audio refs
  const engineSoundRef = useRef(null)
  const driftSoundRef = useRef(null)
  const crashSoundRef = useRef(null)
  const winSoundRef = useRef(null)
  const coinSoundRef = useRef(null)
  
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Game state
    let animationId
    let frameCount = 0
    
    // Player car state
    const player = {
      x: 0, // Position auf der Strecke (-1 bis 1)
      speed: 0,
      maxSpeed: 200,
      acceleration: 5,
      braking: 10,
      deceleration: 2,
      position: 0, // Position auf der Strecke
      isDrifting: false,
      driftPower: 0
    }
    
    // Camera/View
    const camera = {
      height: 1500,
      depth: 1 / player.speed,
      fieldOfView: 100
    }
    
    // Track segments - Mode 7 Style
    const roadSegments = []
    const segmentLength = 200
    const totalSegments = 300
    const rumbleLength = 3
    
    // Create track with curves
    for (let i = 0; i < totalSegments; i++) {
      const segment = {
        index: i,
        point: {
          world: { z: i * segmentLength },
          camera: {},
          screen: {}
        },
        color: Math.floor(i / rumbleLength) % 2 ? {
          road: '#7a7a7a',
          grass: '#10aa10',
          rumble: '#ffffff',
          lane: '#ffffff'
        } : {
          road: '#6a6a6a',
          grass: '#009a00',
          rumble: '#000000',
          lane: '#000000'
        },
        curve: 0,
        sprites: []
      }
      
      // Add curves
      if (i > 50 && i < 100) segment.curve = -3
      if (i > 150 && i < 200) segment.curve = 3.5
      if (i > 250) segment.curve = i % 2 === 0 ? 2 : -2
      
      roadSegments.push(segment)
    }
    
    // Items and obstacles
    const items = []
    const obstacles = []
    
    // Spawn items (question boxes like Mario Kart)
    for (let i = 0; i < 30; i++) {
      const segmentIdx = Math.floor(Math.random() * (totalSegments - 20)) + 20
      items.push({
        segment: segmentIdx,
        x: (Math.random() - 0.5) * 1.5,
        collected: false,
        type: 'coin'
      })
    }
    
    // Spawn obstacles
    for (let i = 0; i < 40; i++) {
      const segmentIdx = Math.floor(Math.random() * (totalSegments - 30)) + 30
      obstacles.push({
        segment: segmentIdx,
        x: (Math.random() - 0.5) * 1.8,
        type: Math.random() > 0.5 ? 'cone' : 'tree'
      })
    }
    
    // Track progress
    let distance = 0
    const targetDistance = totalSegments * segmentLength * 0.85
    let collectedCoins = 0
    
    // Input state
    const keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false
    }
    
    // Projection from 3D world to 2D screen
    function project(point, camX, camY, camZ) {
      const transX = point.world.x - camX
      const transY = point.world.y - camY
      const transZ = point.world.z - camZ
      
      point.camera.x = transX
      point.camera.y = transY
      point.camera.z = transZ
      
      point.screen.scale = camera.depth / transZ
      point.screen.x = Math.round((width / 2) + (point.screen.scale * transX * width / 2))
      point.screen.y = Math.round((height / 2) - (point.screen.scale * transY * height / 2))
      point.screen.w = Math.round(point.screen.scale * roadSegments[0].point.world.roadWidth * width / 2)
    }
    
    // Draw polygon (road segment)
    function drawPolygon(x1, y1, x2, y2, x3, y3, x4, y4, color) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.lineTo(x4, y4)
      ctx.closePath()
      ctx.fill()
    }
    
    // Draw road segment
    function drawSegment(segment, prevSegment) {
      const p1 = segment.point.screen
      const p2 = prevSegment ? prevSegment.point.screen : segment.point.screen
      
      const roadWidth1 = p1.w
      const roadWidth2 = p2.w
      const laneWidth1 = roadWidth1 / 8
      const laneWidth2 = roadWidth2 / 8
      
      // Draw grass (background)
      ctx.fillStyle = segment.color.grass
      ctx.fillRect(0, p2.y, width, p1.y - p2.y)
      
      // Draw road
      drawPolygon(
        p1.x - roadWidth1 - (roadWidth1 * 0.3), p1.y,
        p1.x + roadWidth1 + (roadWidth1 * 0.3), p1.y,
        p2.x + roadWidth2 + (roadWidth2 * 0.3), p2.y,
        p2.x - roadWidth2 - (roadWidth2 * 0.3), p2.y,
        segment.color.road
      )
      
      // Draw road rumble strips
      drawPolygon(
        p1.x - roadWidth1 - (roadWidth1 * 0.3), p1.y,
        p1.x - roadWidth1, p1.y,
        p2.x - roadWidth2, p2.y,
        p2.x - roadWidth2 - (roadWidth2 * 0.3), p2.y,
        segment.color.rumble
      )
      drawPolygon(
        p1.x + roadWidth1, p1.y,
        p1.x + roadWidth1 + (roadWidth1 * 0.3), p1.y,
        p2.x + roadWidth2 + (roadWidth2 * 0.3), p2.y,
        p2.x + roadWidth2, p2.y,
        segment.color.rumble
      )
      
      // Draw lane markers
      if (segment.color.lane) {
        drawPolygon(
          p1.x - laneWidth1, p1.y,
          p1.x + laneWidth1, p1.y,
          p2.x + laneWidth2, p2.y,
          p2.x - laneWidth2, p2.y,
          segment.color.lane
        )
      }
    }
    
    // Draw sprite (item, obstacle, etc.)
    function drawSprite(sprite, segment) {
      if (!segment.point.screen.scale || segment.point.camera.z <= camera.depth) return
      
      const scale = segment.point.screen.scale
      const spriteX = segment.point.screen.x + (scale * sprite.x * width / 2)
      const spriteY = segment.point.screen.y - (scale * 50)
      const spriteW = scale * 40
      const spriteH = scale * 60
      
      if (spriteW < 1 || spriteH < 1) return
      
      // Draw based on sprite type
      if (sprite.type === 'coin') {
        if (sprite.collected) return
        // Gold coin (spinning effect)
        const spinOffset = Math.sin(frameCount * 0.1) * 5
        ctx.fillStyle = '#ffd700'
        ctx.beginPath()
        ctx.arc(spriteX, spriteY, spriteW / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffaa00'
        ctx.beginPath()
        ctx.arc(spriteX + spinOffset, spriteY, spriteW / 3, 0, Math.PI * 2)
        ctx.fill()
      } else if (sprite.type === 'cone') {
        // Traffic cone
        ctx.fillStyle = '#ff6600'
        ctx.beginPath()
        ctx.moveTo(spriteX, spriteY - spriteH / 2)
        ctx.lineTo(spriteX - spriteW / 2, spriteY + spriteH / 2)
        ctx.lineTo(spriteX + spriteW / 2, spriteY + spriteH / 2)
        ctx.closePath()
        ctx.fill()
        // White stripe
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(spriteX - spriteW / 3, spriteY, spriteW * 2 / 3, spriteH / 8)
      } else if (sprite.type === 'tree') {
        // Simple tree
        // Trunk
        ctx.fillStyle = '#654321'
        ctx.fillRect(spriteX - spriteW / 6, spriteY, spriteW / 3, spriteH / 2)
        // Leaves
        ctx.fillStyle = '#228b22'
        ctx.beginPath()
        ctx.arc(spriteX, spriteY - spriteH / 4, spriteW / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // Draw player car (from behind - Mario Kart style)
    function drawCar() {
      const carWidth = 60
      const carHeight = 90
      const carX = width / 2
      const carY = height - 120
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(carX, carY + carHeight / 2 + 5, carWidth * 0.7, carWidth * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Drift angle effect
      ctx.save()
      ctx.translate(carX, carY)
      if (player.isDrifting) {
        ctx.rotate((keys.left ? -0.15 : keys.right ? 0.15 : 0))
      }
      ctx.translate(-carX, -carY)
      
      // Kart body (red like Mario)
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(carX - carWidth / 2, carY - carHeight / 2, carWidth, carHeight)
      
      // Kart top
      ctx.fillStyle = '#cc0000'
      ctx.fillRect(carX - carWidth / 3, carY - carHeight / 3, carWidth * 2 / 3, carHeight / 2)
      
      // Driver helmet (visible from behind)
      ctx.fillStyle = '#0066ff'
      ctx.beginPath()
      ctx.arc(carX, carY - carHeight / 4, carWidth / 4, 0, Math.PI * 2)
      ctx.fill()
      
      // Wheels
      ctx.fillStyle = '#000000'
      // Back wheels
      ctx.fillRect(carX - carWidth / 2 - 8, carY + carHeight / 4, 12, 18)
      ctx.fillRect(carX + carWidth / 2 - 4, carY + carHeight / 4, 12, 18)
      // Front wheels (smaller, visible in perspective)
      ctx.fillRect(carX - carWidth / 2 - 6, carY - carHeight / 3, 10, 14)
      ctx.fillRect(carX + carWidth / 2 - 4, carY - carHeight / 3, 10, 14)
      
      // Drift effect
      if (player.isDrifting) {
        // Drift sparks
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = player.driftPower > 30 ? '#ff00ff' : '#ffff00'
          const sparkX = carX + (keys.left ? -carWidth / 2 - 10 : carWidth / 2 + 10)
          const sparkY = carY + carHeight / 4 + Math.random() * 20
          ctx.beginPath()
          ctx.arc(sparkX + (Math.random() - 0.5) * 10, sparkY, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      ctx.restore()
    }
    
    // Handle keyboard input
    function handleKeyDown(e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault()
        keys.left = true
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault()
        keys.right = true
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault()
        keys.up = true
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault()
        keys.down = true
      }
      if (e.code === 'Space') {
        e.preventDefault()
        keys.space = true
      }
    }
    
    function handleKeyUp(e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false
      if (e.code === 'Space') keys.space = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // Initialize road segment world positions
    roadSegments.forEach(segment => {
      segment.point.world.x = 0
      segment.point.world.y = 0
      segment.point.world.roadWidth = 2000
    })
    
    
    // Game loop - Mode 7 style rendering
    function gameLoop() {
      frameCount++
      
      // Update physics
      if (keys.up) {
        player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed)
      } else if (keys.down) {
        player.speed = Math.max(player.speed - player.braking, 0)
      } else {
        player.speed = Math.max(player.speed - player.deceleration, 0)
      }
      
      // Steering
      if (keys.left) {
        player.x -= 0.05 * (player.speed / player.maxSpeed)
      }
      if (keys.right) {
        player.x += 0.05 * (player.speed / player.maxSpeed)
      }
      
      // Drifting
      if (keys.space && player.speed > 50) {
        player.isDrifting = true
        setDrifting(true)
        player.driftPower = Math.min(player.driftPower + 1, 50)
        if (keys.left) {
          player.x -= 0.08
        } else if (keys.right) {
          player.x += 0.08
        }
      } else {
        if (player.isDrifting && player.driftPower > 30) {
          // Speed boost after drift
          player.speed = Math.min(player.speed + 30, player.maxSpeed + 20)
        }
        player.isDrifting = false
        setDrifting(false)
        player.driftPower = 0
      }
      
      // Keep player on track
      player.x = Math.max(-2, Math.min(2, player.x))
      
      // Update position
      player.position += player.speed
      distance = Math.floor(player.position)
      
      // Update displays
      setDistance(distance)
      setSpeed(Math.floor(player.speed))
      
      // Check win condition
      if (distance >= targetDistance) {
        setGameWon(true)
        if (winSoundRef.current) {
          winSoundRef.current.play().catch(e => console.log('Win sound error:', e))
        }
        return
      }
      
      // Clear canvas - Sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6)
      skyGradient.addColorStop(0, '#7ec0ee')
      skyGradient.addColorStop(1, '#b0d0e8')
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, width, height * 0.6)
      
      // Mountains in background
      ctx.fillStyle = '#5a7d5a'
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const x = (i / 10) * width
        const h = 100 + Math.sin(i * 0.8) * 50
        ctx.lineTo(x, height * 0.6 - h)
      }
      ctx.lineTo(width, height * 0.6)
      ctx.lineTo(0, height * 0.6)
      ctx.closePath()
      ctx.fill()
      
      // Camera/view calculations
      camera.depth = 0.84 / (player.speed === 0 ? 0.01 : player.speed)
      const baseSegment = Math.floor(player.position / segmentLength)
      
      // Project and draw road segments
      let maxY = height
      
      for (let n = 0; n < 150; n++) {
        const segment = roadSegments[(baseSegment + n) % roadSegments.length]
        const prevSegment = n > 0 ? roadSegments[(baseSegment + n - 1) % roadSegments.length] : null
        
        // Apply curves
        segment.point.world.x = prevSegment ? prevSegment.point.world.x + segment.curve : 0
        segment.point.world.y = 0
        
        // Project 3D to 2D
        project(segment.point, player.x * segment.point.world.roadWidth, camera.height, player.position - (n < 3 ? 0 : 0))
        
        // Only draw if in front and visible
        if (segment.point.camera.z > camera.depth && segment.point.screen.y < maxY) {
          maxY = segment.point.screen.y
          
          // Draw segment
          if (prevSegment && prevSegment.point.screen.y < height) {
            drawSegment(segment, prevSegment)
          }
          
          // Draw sprites on this segment
          segment.sprites.forEach(sprite => {
            drawSprite(sprite, segment)
          })
        }
      }
      
      // Check collisions and collect items
      const currentSegmentIdx = Math.floor(player.position / segmentLength)
      const currentSegment = roadSegments[currentSegmentIdx % roadSegments.length]
      
      // Check items
      items.forEach(item => {
        if (item.segment === currentSegmentIdx && !item.collected) {
          const dx = Math.abs(player.x - item.x)
          if (dx < 0.5) {
            item.collected = true
            collectedCoins++
            setCoins(collectedCoins)
            setTimer(prev => Math.min(prev + 3, 120))
            if (coinSoundRef.current) {
              coinSoundRef.current.currentTime = 0
              coinSoundRef.current.play().catch(e => console.log('Coin sound error:', e))
            }
          }
        }
        
        // Add to segment for rendering
        if (Math.abs(item.segment - currentSegmentIdx) < 100) {
          const seg = roadSegments[item.segment % roadSegments.length]
          if (!item.collected && !seg.sprites.find(s => s === item)) {
            seg.sprites = [item]
          } else if (item.collected) {
            seg.sprites = []
          }
        }
      })
      
      // Check obstacles
      obstacles.forEach(obstacle => {
        if (obstacle.segment === currentSegmentIdx) {
          const dx = Math.abs(player.x - obstacle.x)
          if (dx < 0.4 && !obstacle.hit) {
            obstacle.hit = true
            setCollisions(prev => prev + 1)
            player.speed *= 0.4
            if (crashSoundRef.current) {
              crashSoundRef.current.currentTime = 0
              crashSoundRef.current.play().catch(e => console.log('Crash sound error:', e))
            }
          }
        }
        
        // Add to segment for rendering
        if (Math.abs(obstacle.segment - currentSegmentIdx) < 100) {
          const seg = roadSegments[obstacle.segment % roadSegments.length]
          if (!seg.sprites.find(s => s === obstacle)) {
            seg.sprites = [obstacle]
          }
        }
      })
      
      // Draw player car
      drawCar()
      
      // Draw HUD - Mario Kart style
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(5, 5, 200, 110)
      
      ctx.fillStyle = '#ffff00'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.font = 'bold 16px Arial'
      ctx.strokeText(`Distanz: ${distance}m`, 15, 25)
      ctx.fillText(`Distanz: ${distance}m`, 15, 25)
      
      ctx.fillStyle = '#ffffff'
      ctx.strokeText(`Zeit: ${timer}s`, 15, 50)
      ctx.fillText(`Zeit: ${timer}s`, 15, 50)
      
      ctx.fillStyle = '#00ff00'
      ctx.strokeText(`Speed: ${Math.floor(player.speed)}`, 15, 75)
      ctx.fillText(`Speed: ${Math.floor(player.speed)}`, 15, 75)
      
      ctx.fillStyle = '#ffd700'
      ctx.strokeText(`Münzen: ${collectedCoins}`, 15, 100)
      ctx.fillText(`Münzen: ${collectedCoins}`, 15, 100)
      
      // Progress bar
      const progressWidth = 250
      const progress = (distance / targetDistance) * progressWidth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(width / 2 - progressWidth / 2 - 5, 10, progressWidth + 10, 30)
      ctx.fillStyle = '#444444'
      ctx.fillRect(width / 2 - progressWidth / 2, 15, progressWidth, 20)
      
      // Rainbow gradient for progress
      const progressGradient = ctx.createLinearGradient(width / 2 - progressWidth / 2, 0, width / 2 + progressWidth / 2, 0)
      progressGradient.addColorStop(0, '#00ff00')
      progressGradient.addColorStop(0.5, '#ffff00')
      progressGradient.addColorStop(1, '#ff0000')
      ctx.fillStyle = progressGradient
      ctx.fillRect(width / 2 - progressWidth / 2, 15, progress, 20)
      
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.strokeRect(width / 2 - progressWidth / 2, 15, progressWidth, 20)
      
      // Drift indicator
      if (player.isDrifting) {
        const driftColor = player.driftPower > 30 ? '#ff00ff' : '#00ffff'
        ctx.fillStyle = driftColor
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 3
        ctx.font = 'bold 32px Arial'
        ctx.strokeText('DRIFT!', width - 150, 50)
        ctx.fillText('DRIFT!', width - 150, 50)
      }
      
      animationId = requestAnimationFrame(gameLoop)
    }
    
    gameLoop()
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [gameStarted, gameOver, gameWon])
  
  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [gameStarted, gameOver, gameWon])
  
  const handleRestart = () => {
    setGameOver(false)
    setGameWon(false)
    setGameStarted(false)
    setTimer(90)
    setSpeed(0)
    setDrifting(false)
    setCollisions(0)
    setCoins(0)
    setDistance(0)
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#1a1a1a' }}>
      {/* Hidden audio elements */}
      <audio ref={engineSoundRef} src="/soundtrack.mp3" loop />
      <audio ref={driftSoundRef} src="/jump.mp3" />
      <audio ref={crashSoundRef} src="/game_over.mp3" />
      <audio ref={winSoundRef} src="/coin.mp3" />
      <audio ref={coinSoundRef} src="/coin.mp3" />
      
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-6 max-w-3xl">
          <h1 className="text-5xl font-mono font-bold text-center" style={{ 
            color: '#ffffff',
            textShadow: '4px 4px 0px #ff0000, 8px 8px 0px rgba(255,0,0,0.3)',
            letterSpacing: '0.05em',
            lineHeight: '1.3'
          }}>
            TURBO RACE<br/>
            <span style={{ fontSize: '0.7em', color: '#ff6600' }}>3D RACING</span>
          </h1>
          
          <div className="bg-black bg-opacity-70 p-6 rounded-lg border-4 border-red-600 max-w-2xl">
            <div className="text-xl font-mono font-bold text-white mb-4" style={{
              textShadow: '2px 2px 0px #000000',
              textAlign: 'center'
            }}>
              🏁 SPIELANLEITUNG 🏁
            </div>
            <div className="text-base font-mono text-white space-y-3" style={{
              textShadow: '1px 1px 0px #000000',
              lineHeight: '1.6'
            }}>
              <p>
                <span className="font-bold text-yellow-300">🎯 Ziel:</span> Fahre die gesamte Strecke in 90 Sekunden!
              </p>
              <p>
                <span className="font-bold text-green-300">⌨️ Steuerung:</span>
              </p>
              <ul className="ml-6 space-y-1">
                <li>▲ / W - Gas geben</li>
                <li>▼ / S - Bremsen</li>
                <li>◄ / A - Nach links lenken</li>
                <li>► / D - Nach rechts lenken</li>
                <li>LEERTASTE - Driften (bei hoher Geschwindigkeit)</li>
              </ul>
              <p>
                <span className="font-bold text-orange-300">⚠️ Achtung:</span> Weiche Hindernissen aus! Kollisionen bremsen dich ab.
              </p>
              <p>
                <span className="font-bold text-cyan-300">💰 Münzen:</span> Sammle Münzen für +3 Sekunden Bonuszeit!
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setGameStarted(true)}
            className="px-12 py-6 text-2xl font-mono font-bold rounded-lg transition-all duration-200 transform hover:scale-110"
            style={{
              background: '#ff0000',
              color: '#ffffff',
              border: '4px solid #cc0000',
              boxShadow: '0 6px 0 #cc0000, 0 8px 8px rgba(0,0,0,0.4)',
              textShadow: '2px 2px 0px #cc0000'
            }}
          >
            🏁 START RACE
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full px-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="rounded-lg"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '8px solid #ff0000',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
            }}
          />
          
          {gameOver && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-50">
              <div className="bg-black bg-opacity-95 p-10 rounded-lg border-4 border-red-600 shadow-2xl">
                <h2 className="text-6xl font-bold text-red-600 mb-6" style={{ textShadow: '3px 3px 0px #000000' }}>
                  ZEIT ABGELAUFEN!
                </h2>
                <div className="text-2xl text-white mb-2">
                  <span className="font-bold text-yellow-300">Distanz:</span> {Math.floor(distance)}m
                </div>
                <div className="text-2xl text-white mb-2">
                  <span className="font-bold text-green-300">Geschwindigkeit:</span> {speed} km/h
                </div>
                <div className="text-2xl text-white mb-2">
                  <span className="font-bold text-orange-300">Kollisionen:</span> {collisions}
                </div>
                <div className="text-2xl text-white mb-8">
                  <span className="font-bold text-cyan-300">Münzen:</span> {coins} 💰
                </div>
                <button
                  onClick={handleRestart}
                  className="px-10 py-5 text-2xl font-bold rounded-lg transform hover:scale-105 transition-all"
                  style={{
                    background: 'linear-gradient(180deg, #00ff00 0%, #00cc00 100%)',
                    color: '#000000',
                    border: '4px solid #008800',
                    boxShadow: '0 6px 0 #008800, 0 8px 16px rgba(0,0,0,0.5)',
                    textShadow: '1px 1px 0px #00ff00'
                  }}
                >
                  🔄 NOCHMAL VERSUCHEN
                </button>
              </div>
            </div>
          )}
          
          {gameWon && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-50">
              <div className="bg-black bg-opacity-95 p-10 rounded-lg border-4 border-yellow-400 shadow-2xl">
                <h2 className="text-6xl font-bold text-yellow-400 mb-6" style={{ textShadow: '3px 3px 0px #000000' }}>
                  🏆 GEWONNEN! 🏆
                </h2>
                <div className="text-2xl text-white mb-2">
                  <span className="font-bold text-yellow-300">Restzeit:</span> {timer}s
                </div>
                <div className="text-2xl text-white mb-2">
                  <span className="font-bold text-green-300">Durchschnitts-Speed:</span> {Math.floor((distance / (90 - timer)) * 0.6)} km/h
                </div>
                <div className="text-2xl text-white mb-2">
                  <span className="font-bold text-orange-300">Kollisionen:</span> {collisions}
                </div>
                <div className="text-2xl text-white mb-8">
                  <span className="font-bold text-cyan-300">Münzen gesammelt:</span> {coins} 💰
                </div>
                <button
                  onClick={handleRestart}
                  className="px-10 py-5 text-2xl font-bold rounded-lg transform hover:scale-105 transition-all"
                  style={{
                    background: 'linear-gradient(180deg, #ffd700 0%, #ffaa00 100%)',
                    color: '#000000',
                    border: '4px solid #ff8800',
                    boxShadow: '0 6px 0 #ff8800, 0 8px 16px rgba(0,0,0,0.5)',
                    textShadow: '1px 1px 0px #ffffff'
                  }}
                >
                  🔄 NOCHMAL SPIELEN
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LepusAlbus222Page() {
  return <RacingGame />
}


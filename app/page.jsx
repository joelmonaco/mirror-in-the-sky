'use client'

import Image from 'next/image'

// Avatar Bilder aus dem Startseite_Avatare Ordner
const avatarImages = [
  '/Startseite_Avatare/home_1.png',
  '/Startseite_Avatare/home_2.png',
  '/Startseite_Avatare/home_3.png',
  '/Startseite_Avatare/home_4.png',
  '/Startseite_Avatare/home_5.png',
  '/Startseite_Avatare/home_6.png',
  '/Startseite_Avatare/home_7.png',
  '/Startseite_Avatare/home_8.png',
  '/Startseite_Avatare/home_9.png',
  '/Startseite_Avatare/home_10.png',
  '/Startseite_Avatare/home_11.png',
  '/Startseite_Avatare/home_12.png',
]

// Kunterbunt gemischte Gruppen - benachbarte Spalten haben nie dieselben Bilder
const groupA = [avatarImages[3], avatarImages[8], avatarImages[1], avatarImages[11], avatarImages[5], avatarImages[6]] // 4,9,2,12,6,7
const groupB = [avatarImages[0], avatarImages[7], avatarImages[4], avatarImages[10], avatarImages[2], avatarImages[9]] // 1,8,5,11,3,10

// Mische ein Array mit einem Seed
function shuffleWithSeed(array, seed) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Wähle 5 zufällige Bilder aus einer Gruppe
function selectFromGroup(group, seed) {
  const shuffled = shuffleWithSeed(group, seed)
  return shuffled.slice(0, 5)
}

// Erstelle mehrere Wiederholungen für seamless loop
function createRepeatedImages(images, repeats = 3) {
  const repeated = []
  for (let i = 0; i < repeats; i++) {
    repeated.push(...images)
  }
  return repeated
}

// Avatar Column Komponente - vertikale Bewegung
function AvatarColumn({ images, direction = 'up', speed = 30, columnIndex }) {
  // 5 Bilder, 8x wiederholt für smooth loop
  const repeatedImages = createRepeatedImages(images, 8)
  
  return (
    <div className="overflow-hidden h-full">
      <div 
        className={`flex flex-col gap-5 ${direction === 'up' ? 'animate-scroll-up' : 'animate-scroll-down'}`}
        style={{ 
          animationDuration: `${speed}s`,
        }}
      >
        {repeatedImages.map((src, index) => (
          <div
            key={`${columnIndex}-${index}`}
            className="flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48 rounded-2xl overflow-hidden bg-white shadow-lg"
          >
            <Image
              src={src}
              alt={`Avatar ${(index % images.length) + 1}`}
              width={192}
              height={256}
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  // Ungerade Spalten (1,3,5,7) bekommen Bilder aus Gruppe A (verschiedene Seeds)
  // Gerade Spalten (2,4,6,8) bekommen Bilder aus Gruppe B (verschiedene Seeds)
  // Alles kunterbunt durchgemischt!
  const allColumns = [
    { images: selectFromGroup(groupA, 42), direction: 'up', speed: 150 },
    { images: selectFromGroup(groupB, 17), direction: 'down', speed: 180 },
    { images: selectFromGroup(groupA, 89), direction: 'up', speed: 160 },
    { images: selectFromGroup(groupB, 53), direction: 'down', speed: 190 },
    { images: selectFromGroup(groupA, 31), direction: 'up', speed: 170 },
    { images: selectFromGroup(groupB, 76), direction: 'down', speed: 200 },
    { images: selectFromGroup(groupA, 64), direction: 'up', speed: 155 },
    { images: selectFromGroup(groupB, 28), direction: 'down', speed: 185 },
  ]

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Google Fonts für Logo */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Animierter Avatar Hintergrund - 18 Grad nach rechts geneigt */}
      <div 
        className="absolute flex justify-center items-stretch"
        style={{
          transform: 'rotate(18deg)',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
        }}
      >
        <div className="flex gap-5 h-full">
          {/* Spalte 1-2: Immer sichtbar */}
          <AvatarColumn {...allColumns[0]} columnIndex={0} />
          <AvatarColumn {...allColumns[1]} columnIndex={1} />
          
          {/* Spalte 3-4: Ab sm (640px) sichtbar */}
          <div className="hidden sm:flex gap-5 h-full">
            <AvatarColumn {...allColumns[2]} columnIndex={2} />
            <AvatarColumn {...allColumns[3]} columnIndex={3} />
          </div>
          
          {/* Spalte 5-6: Ab md (768px) sichtbar */}
          <div className="hidden md:flex gap-5 h-full">
            <AvatarColumn {...allColumns[4]} columnIndex={4} />
            <AvatarColumn {...allColumns[5]} columnIndex={5} />
          </div>
          
          {/* Spalte 7-8: Ab lg (1024px) sichtbar */}
          <div className="hidden lg:flex gap-5 h-full">
            <AvatarColumn {...allColumns[6]} columnIndex={6} />
            <AvatarColumn {...allColumns[7]} columnIndex={7} />
          </div>
        </div>
      </div>

      {/* Gradient Overlay am unteren Rand - Bilder laufen ins Weiße */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-72 md:h-96 lg:h-[450px] pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, white 100%)',
        }}
      />

      {/* Content Layer - Logo, Buttons und Text */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-end pb-12 md:pb-16 lg:pb-20 px-4">
        <div className="text-center w-full max-w-4xl mx-auto">
          {/* Logo "mirror-in-the-sky" */}
          <h1 
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-900 mb-6 tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            mirror-in-the-sky
          </h1>

          {/* Untertitel */}
          <p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
            }}
          >
            The knowledge of hundreds of experts at your fingertips
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button 
              className="px-6 py-2 text-sm font-medium rounded-full text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: '#678173',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5a7063'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#678173'
              }}
            >
              Explore
            </button>
            <button 
              className="px-6 py-2 text-sm font-medium rounded-full bg-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#678173',
                border: '2px solid #678173',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f4f2'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white'
              }}
            >
              Create Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

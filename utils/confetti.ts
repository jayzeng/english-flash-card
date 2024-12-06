import confetti from 'canvas-confetti'

export const schoolPride = () => {
  const end = Date.now() + (5 * 1000)
  const colors = ['#bb0000', '#ffffff']
  
  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    })
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    })
    
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

export const fireworks = () => {
  const end = Date.now() + (5 * 1000)
  const colors = ['#ff0000', '#00ff00', '#0000ff']

  const frame = () => {
    confetti({
      particleCount: 20,
      angle: 90,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: colors
    })
    
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

export const spray = () => {
  const end = Date.now() + (5 * 1000)
  const colors = ['#ffff00', '#00ffff', '#ff00ff']

  const frame = () => {
    confetti({
      particleCount: 10,
      angle: 45,
      spread: 120,
      origin: { x: 0.5, y: 0.6 },
      colors: colors
    })
    
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

export const celebrate = () => {
  const confettiPatterns = [schoolPride, fireworks, spray]
  const randomPattern = confettiPatterns[Math.floor(Math.random() * confettiPatterns.length)]
  randomPattern()
}


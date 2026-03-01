export interface ShareCardData {
  playerName: string
  score: number
  maxScore: number
  rounds: number
  perfect: number
  close: number
  far: number
  gameUrl: string
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const SIZE = 1080
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  // ── Background ───────────────────────────────────────────────
  ctx.fillStyle = '#f9fafb' // gray-50
  ctx.fillRect(0, 0, SIZE, SIZE)

  // ── Header band ──────────────────────────────────────────────
  const headerH = 260
  ctx.fillStyle = '#15803d' // green-700
  ctx.fillRect(0, 0, SIZE, headerH)

  // Emblem
  try {
    const emblem = await loadImage('/halenkovice_znak.png')
    const emblemSize = 120
    ctx.drawImage(emblem, SIZE / 2 - emblemSize / 2, 28, emblemSize, emblemSize)
  } catch {
    // emblem optional — skip if fails
  }

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 58px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Poznej Halenkovice', SIZE / 2, 222)

  // ── Score section ─────────────────────────────────────────────
  const scoreY = headerH + 80
  ctx.fillStyle = '#111827' // gray-900
  ctx.font = 'bold 96px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.score.toLocaleString('cs-CZ'), SIZE / 2, scoreY)

  ctx.fillStyle = '#6b7280' // gray-500
  ctx.font = '36px system-ui, sans-serif'
  ctx.fillText(`z ${data.maxScore.toLocaleString('cs-CZ')} bodů`, SIZE / 2, scoreY + 54)

  // Player name
  ctx.fillStyle = '#374151' // gray-700
  ctx.font = '40px system-ui, sans-serif'
  ctx.fillText(data.playerName, SIZE / 2, scoreY + 124)

  // ── Divider ───────────────────────────────────────────────────
  ctx.strokeStyle = '#e5e7eb' // gray-200
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, scoreY + 168)
  ctx.lineTo(SIZE - 80, scoreY + 168)
  ctx.stroke()

  // ── Tier breakdown ────────────────────────────────────────────
  const tiers: Array<{ label: string; count: number; color: string }> = [
    { label: 'Perfektní', count: data.perfect, color: '#22c55e' },
    { label: 'Blízko',    count: data.close,   color: '#facc15' },
    { label: 'Daleko',    count: data.far,      color: '#ef4444' },
  ]

  const tierStartY = scoreY + 220
  const tierRowH = 82
  ctx.textAlign = 'left'

  tiers.forEach(({ label, count, color }, i) => {
    const y = tierStartY + i * tierRowH

    // Colored dot
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(130, y, 18, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.fillStyle = '#374151'
    ctx.font = '40px system-ui, sans-serif'
    ctx.fillText(label, 170, y + 14)

    // Count
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 40px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`×${count}`, SIZE - 130, y + 14)
    ctx.textAlign = 'left'
  })

  // ── Footer ────────────────────────────────────────────────────
  const footerY = SIZE - 80
  ctx.fillStyle = '#d1fae5' // green-100
  ctx.fillRect(0, footerY - 30, SIZE, 110)

  ctx.fillStyle = '#15803d'
  ctx.font = '36px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.gameUrl, SIZE / 2, footerY + 28)

  // ── Border ────────────────────────────────────────────────────
  ctx.strokeStyle = '#d1d5db' // gray-300
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, SIZE - 4, SIZE - 4)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}

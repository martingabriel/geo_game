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
  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── Background ───────────────────────────────────────────────
  ctx.fillStyle = '#f9fafb'
  ctx.fillRect(0, 0, W, H)

  // ── Header band (blue) ───────────────────────────────────────
  const headerH = 420
  ctx.fillStyle = '#1e40af' // blue-800 — matches Halenkovice emblem
  ctx.fillRect(0, 0, W, headerH)

  // Emblem
  try {
    const emblem = await loadImage('/halenkovice_znak.png')
    const emblemSize = 180
    ctx.drawImage(emblem, W / 2 - emblemSize / 2, 40, emblemSize, emblemSize)
  } catch {
    // emblem optional — skip if fails
  }

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 62px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Poznej Halenkovice', W / 2, 370)

  // ── Score section (generous spacing above and below) ─────────
  const scoreY = 660  // 240px below header end

  // Score number
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 110px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.score.toLocaleString('cs-CZ'), W / 2, scoreY)

  // "z X bodů"
  ctx.fillStyle = '#6b7280'
  ctx.font = '42px system-ui, sans-serif'
  ctx.fillText(`z ${data.maxScore.toLocaleString('cs-CZ')} bodů`, W / 2, scoreY + 70)

  // Player name (extra spacing below score)
  ctx.fillStyle = '#374151'
  ctx.font = '46px system-ui, sans-serif'
  ctx.fillText(data.playerName, W / 2, scoreY + 200)

  // ── Divider ───────────────────────────────────────────────────
  const dividerY = scoreY + 310  // extra spacing below player name
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, dividerY)
  ctx.lineTo(W - 80, dividerY)
  ctx.stroke()

  // ── Tier breakdown ────────────────────────────────────────────
  const tiers: Array<{ label: string; count: number; color: string }> = [
    { label: 'Perfektní', count: data.perfect, color: '#22c55e' },
    { label: 'Blízko',    count: data.close,   color: '#facc15' },
    { label: 'Daleko',    count: data.far,      color: '#ef4444' },
  ]

  const tierStartY = dividerY + 100
  const tierRowH = 110
  ctx.textAlign = 'left'

  tiers.forEach(({ label, count, color }, i) => {
    const y = tierStartY + i * tierRowH

    // Colored dot
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(130, y, 20, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.fillStyle = '#374151'
    ctx.font = '44px system-ui, sans-serif'
    ctx.fillText(label, 175, y + 16)

    // Count
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 44px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`×${count}`, W - 130, y + 16)
    ctx.textAlign = 'left'
  })

  // ── Hashtag / decorative tagline ──────────────────────────────
  ctx.fillStyle = '#d1d5db'
  ctx.font = '38px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('#PoznejHalenkovice', W / 2, tierStartY + tiers.length * tierRowH + 160)

  // ── Footer ────────────────────────────────────────────────────
  const footerH = 120
  const footerY = H - footerH
  ctx.fillStyle = '#dbeafe' // blue-100
  ctx.fillRect(0, footerY, W, footerH)

  ctx.fillStyle = '#1e40af'
  ctx.font = '38px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.gameUrl, W / 2, footerY + 72)

  // ── Border ────────────────────────────────────────────────────
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, W - 4, H - 4)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}

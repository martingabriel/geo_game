import type { ScoreTier } from '@/types/index'

export interface ShareCardResult {
  filename: string
  tier: ScoreTier
}

export interface ShareCardData {
  playerName: string
  score: number
  maxScore: number
  rounds: number
  results: ShareCardResult[]
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

/** Draw an image cropped to fill a rectangle (object-cover behaviour). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const srcAspect = img.naturalWidth / img.naturalHeight
  const dstAspect = w / h
  let sx: number, sy: number, sw: number, sh: number
  if (srcAspect > dstAspect) {
    sh = img.naturalHeight; sw = sh * dstAspect
    sx = (img.naturalWidth - sw) / 2; sy = 0
  } else {
    sw = img.naturalWidth; sh = sw / dstAspect
    sx = 0; sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

const TIER_COLOR: Record<ScoreTier, string> = {
  Perfect: '#22c55e',
  Close:   '#facc15',
  Far:     '#ef4444',
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
  ctx.fillStyle = '#1e40af'
  ctx.fillRect(0, 0, W, headerH)

  // Emblem
  try {
    const emblem = await loadImage('/halenkovice_znak.png')
    const emblemSize = 180
    ctx.drawImage(emblem, W / 2 - emblemSize / 2, 40, emblemSize, emblemSize)
  } catch { /* optional */ }

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 62px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Poznej Halenkovice', W / 2, 370)

  // ── Score section ─────────────────────────────────────────────
  const scoreY = 660

  ctx.fillStyle = '#111827'
  ctx.font = 'bold 110px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.score.toLocaleString('cs-CZ'), W / 2, scoreY)

  ctx.fillStyle = '#6b7280'
  ctx.font = '42px system-ui, sans-serif'
  ctx.fillText(`z ${data.maxScore.toLocaleString('cs-CZ')} bodů`, W / 2, scoreY + 70)

  ctx.fillStyle = '#374151'
  ctx.font = '46px system-ui, sans-serif'
  ctx.fillText(data.playerName, W / 2, scoreY + 200)

  // ── Divider ───────────────────────────────────────────────────
  const dividerY = scoreY + 310
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, dividerY)
  ctx.lineTo(W - 80, dividerY)
  ctx.stroke()

  // ── Photo grid ────────────────────────────────────────────────
  const COLS = 5
  const GAP = 12
  const PADDING = 80
  const gridStartY = dividerY + 80
  const gridEndMax = H - 120 - 80   // above footer + bottom padding
  const availW = W - 2 * PADDING
  const rowCount = Math.ceil(data.results.length / COLS)

  // Fit cell size within both width and height constraints
  const cellFromW = Math.floor((availW - (COLS - 1) * GAP) / COLS)
  const cellFromH = Math.floor((gridEndMax - gridStartY - (rowCount - 1) * GAP) / rowCount)
  const cellSize = Math.min(cellFromW, cellFromH)

  // Load all photos in parallel
  const photoResults = await Promise.allSettled(
    data.results.map(r => loadImage(`/img/${r.filename}`))
  )

  data.results.forEach((result, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = PADDING + col * (cellSize + GAP)
    const y = gridStartY + row * (cellSize + GAP)

    const loaded = photoResults[i]
    if (loaded.status === 'fulfilled') {
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, cellSize, cellSize)
      ctx.clip()
      drawCover(ctx, loaded.value, x, y, cellSize, cellSize)
      ctx.restore()
    } else {
      ctx.fillStyle = '#e5e7eb'
      ctx.fillRect(x, y, cellSize, cellSize)
    }

    // Tier border
    ctx.strokeStyle = TIER_COLOR[result.tier]
    ctx.lineWidth = 8
    ctx.strokeRect(x + 4, y + 4, cellSize - 8, cellSize - 8)
  })

  // ── Hashtag ───────────────────────────────────────────────────
  const gridBottomY = gridStartY + rowCount * cellSize + (rowCount - 1) * GAP
  const hashtagY = gridBottomY + 100
  if (hashtagY + 50 < H - 120 - 40) {
    ctx.fillStyle = '#d1d5db'
    ctx.font = '38px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('#PoznejHalenkovice', W / 2, hashtagY)
  }

  // ── Footer ────────────────────────────────────────────────────
  const footerH = 120
  const footerY = H - footerH
  ctx.fillStyle = '#dbeafe'
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

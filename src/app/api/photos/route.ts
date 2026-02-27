import { NextResponse } from 'next/server'
import { unlink, writeFile } from 'fs/promises'
import path from 'path'
import { getPhotos, addPhoto, deletePhoto, updatePhotoRadii } from '@/lib/photos'
import { isAdminAuthenticated } from '@/lib/auth'
import type { Photo } from '@/types/index'

export async function GET() {
  const photos = await getPhotos()
  return NextResponse.json(photos)
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('photo') as File | null
  const lat = formData.get('lat') as string | null
  const lng = formData.get('lng') as string | null
  const perfectRadius = formData.get('perfectRadius') as string | null
  const closeRadius = formData.get('closeRadius') as string | null

  if (!file || !lat || !lng || !perfectRadius || !closeRadius) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const id = `photo_${Date.now()}`
  const ext = path.extname(file.name) || '.png'
  const filename = `${id}${ext}`
  const filePath = path.join(process.cwd(), 'public', 'img', filename)

  await writeFile(filePath, buffer)

  const newPhoto: Photo = {
    id,
    filename,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    perfectRadius: parseInt(perfectRadius, 10),
    closeRadius: parseInt(closeRadius, 10),
  }

  await addPhoto(newPhoto)
  return NextResponse.json(newPhoto, { status: 201 })
}

export async function PATCH(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const body = (await request.json()) as { perfectRadius?: unknown; closeRadius?: unknown }
  const perfectRadius = typeof body.perfectRadius === 'number' ? body.perfectRadius : null
  const closeRadius = typeof body.closeRadius === 'number' ? body.closeRadius : null

  if (perfectRadius === null || closeRadius === null) {
    return NextResponse.json({ error: 'Missing perfectRadius or closeRadius' }, { status: 400 })
  }

  await updatePhotoRadii(id, perfectRadius, closeRadius)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const photos = await getPhotos()
  const photo = photos.find((p) => p.id === id)
  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  try {
    await unlink(path.join(process.cwd(), 'public', 'img', photo.filename))
  } catch {
    // File may already be missing — that's fine, continue to remove from JSON
  }

  await deletePhoto(id)
  return NextResponse.json({ ok: true })
}

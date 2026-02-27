import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { Photo } from '@/types/index'

const PHOTOS_PATH = path.join(process.cwd(), 'data', 'photos.json')

export async function getPhotos(): Promise<Photo[]> {
  const raw = await readFile(PHOTOS_PATH, 'utf-8')
  return JSON.parse(raw) as Photo[]
}

export async function addPhoto(photo: Photo): Promise<void> {
  const photos = await getPhotos()
  photos.push(photo)
  await writeFile(PHOTOS_PATH, JSON.stringify(photos, null, 2))
}

export async function deletePhoto(id: string): Promise<void> {
  const photos = await getPhotos()
  const filtered = photos.filter((p) => p.id !== id)
  await writeFile(PHOTOS_PATH, JSON.stringify(filtered, null, 2))
}

export async function updatePhotoRadii(
  id: string,
  perfectRadius: number,
  closeRadius: number
): Promise<void> {
  const photos = await getPhotos()
  const updated = photos.map((p) =>
    p.id === id ? { ...p, perfectRadius, closeRadius } : p
  )
  await writeFile(PHOTOS_PATH, JSON.stringify(updated, null, 2))
}

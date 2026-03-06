import { readFile } from 'fs/promises'
import path from 'path'
import type { Photo } from '@/types/index'

const PHOTOS_PATH = path.join(process.cwd(), 'data', 'photos.json')

export async function getPhotos(): Promise<Photo[]> {
  const raw = await readFile(PHOTOS_PATH, 'utf-8')
  return JSON.parse(raw) as Photo[]
}

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: unknown }
  const password = typeof body.password === 'string' ? body.password : null

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.headers.set(
    'Set-Cookie',
    'admin_session=1; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax'
  )
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.headers.set(
    'Set-Cookie',
    'admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  )
  return response
}

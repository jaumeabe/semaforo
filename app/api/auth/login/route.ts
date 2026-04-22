import { NextRequest, NextResponse } from 'next/server'

const LOGIN_USER = process.env.LOGIN_USER || 'premier'
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'premier'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (username !== LOGIN_USER || password !== LOGIN_PASSWORD) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set('auth_token', 'session_active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Error en la solicitud' }, { status: 400 })
  }
}

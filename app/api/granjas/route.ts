import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema, getDb } from '@/lib/db'
import type { Estado } from '@/lib/granjas'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const VALID_ESTADOS: Estado[] = ['verde', 'amarillo', 'rojo']

export async function GET() {
  try {
    await ensureSchema()
    const sql = getDb()
    const rows = await sql`
      SELECT id, nombre, estado, updated_at
      FROM granjas
      ORDER BY nombre ASC
    `
    return NextResponse.json({ granjas: rows })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('GET /api/granjas failed:', msg)
    return NextResponse.json({ error: `DB error: ${msg}` }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { nombre, estado } = await req.json()

    if (typeof nombre !== 'string' || !VALID_ESTADOS.includes(estado)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    await ensureSchema()
    const sql = getDb()
    const result = await sql`
      UPDATE granjas
      SET estado = ${estado}, updated_at = NOW()
      WHERE nombre = ${nombre}
      RETURNING id, nombre, estado, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Granja no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ granja: result[0] })
  } catch {
    return NextResponse.json({ error: 'Error en la solicitud' }, { status: 400 })
  }
}

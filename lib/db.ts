import { neon } from '@neondatabase/serverless'
import { GRANJAS } from './granjas'

export function getDb() {
  return neon(process.env.DATABASE_URL!)
}

let schemaReady = false

export async function ensureSchema() {
  if (schemaReady) return
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS granjas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) UNIQUE NOT NULL,
      estado VARCHAR(20) NOT NULL DEFAULT 'verde',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  for (const nombre of GRANJAS) {
    await sql`
      INSERT INTO granjas (nombre) VALUES (${nombre})
      ON CONFLICT (nombre) DO NOTHING
    `
  }
  schemaReady = true
}

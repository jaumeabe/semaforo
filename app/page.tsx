'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ESTADO_COLORS, MADRES, NEXT_ESTADO, type Estado } from '@/lib/granjas'

type Granja = {
  id: number
  nombre: string
  estado: Estado
  updated_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [granjas, setGranjas] = useState<Granja[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/granjas', { cache: 'no-store' })
        const text = await res.text()
        if (cancelled) return
        if (!res.ok) {
          setError(`HTTP ${res.status}: ${text.slice(0, 500)}`)
          return
        }
        try {
          const data = JSON.parse(text)
          setGranjas(data.granjas || [])
        } catch {
          setError(`Respuesta no-JSON (HTTP ${res.status}): ${text.slice(0, 300)}`)
        }
      } catch (e) {
        if (!cancelled) setError(`Fetch falló: ${e instanceof Error ? e.message : String(e)}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    return granjas.reduce(
      (acc, g) => {
        acc[g.estado] = (acc[g.estado] || 0) + 1
        return acc
      },
      { verde: 0, amarillo: 0, rojo: 0 } as Record<Estado, number>,
    )
  }, [granjas])

  const granjasMadres = useMemo(() => granjas.filter(g => MADRES.has(g.nombre)), [granjas])
  const granjasOtras = useMemo(() => granjas.filter(g => !MADRES.has(g.nombre)), [granjas])

  const handleClick = async (g: Granja) => {
    if (savingId !== null) return
    const nuevoEstado = NEXT_ESTADO[g.estado]
    const prev = granjas
    setGranjas(granjas.map(x => (x.id === g.id ? { ...x, estado: nuevoEstado } : x)))
    setSavingId(g.id)
    try {
      const res = await fetch('/api/granjas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: g.nombre, estado: nuevoEstado }),
      })
      if (!res.ok) {
        setGranjas(prev)
        setError('No se pudo actualizar')
      }
    } catch {
      setGranjas(prev)
      setError('Error de conexión')
    } finally {
      setSavingId(null)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <main style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <header
        style={{
          maxWidth: 1400,
          margin: '0 auto 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: '#2f5496', fontSize: 28, fontWeight: 700 }}>
            Semaforo
          </h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
            Sanidad de granjas — haz clic en una granja para cambiar su estado
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge color={ESTADO_COLORS.verde} label={`${counts.verde}`} />
          <Badge color={ESTADO_COLORS.amarillo} label={`${counts.amarillo}`} />
          <Badge color={ESTADO_COLORS.rojo} label={`${counts.rojo}`} />
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 8,
              padding: '8px 14px',
              fontSize: 14,
              fontWeight: 600,
              background: '#fff',
              border: '1px solid #d6dce4',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {error && (
        <p
          style={{
            maxWidth: 1400,
            margin: '0 auto 12px',
            color: '#c62828',
            background: '#fff',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 14,
          }}
        >
          {error}
        </p>
      )}

      {loading ? (
        <section
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 90,
                background: '#e5e7eb',
                borderRadius: 12,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </section>
      ) : (
        <>
          <GranjaGroup
            title="Granjas de Madres"
            granjas={granjasMadres}
            savingId={savingId}
            onClickGranja={handleClick}
          />
          <GranjaGroup
            title="Otras Granjas"
            granjas={granjasOtras}
            savingId={savingId}
            onClickGranja={handleClick}
          />
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  )
}

function GranjaGroup({
  title,
  granjas,
  savingId,
  onClickGranja,
}: {
  title: string
  granjas: Granja[]
  savingId: number | null
  onClickGranja: (g: Granja) => void
}) {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto 32px' }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#2f5496',
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: '2px solid #d6dce4',
        }}
      >
        {title}
        <span
          style={{
            marginLeft: 10,
            fontSize: 14,
            fontWeight: 500,
            color: '#6b7280',
          }}
        >
          ({granjas.length})
        </span>
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {granjas.map(g => (
          <button
            key={g.id}
            onClick={() => onClickGranja(g)}
            disabled={savingId !== null}
            style={{
              minHeight: 90,
              padding: '16px 12px',
              background: ESTADO_COLORS[g.estado],
              border: 'none',
              borderRadius: 12,
              color: g.estado === 'amarillo' ? '#1f2937' : '#fff',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0.3,
              cursor: savingId !== null ? 'wait' : 'pointer',
              boxShadow:
                savingId === g.id
                  ? '0 0 0 3px rgba(68,114,196,0.5)'
                  : '0 2px 6px rgba(0,0,0,0.08)',
              transition: 'background 0.2s, transform 0.05s',
              textAlign: 'center',
              wordBreak: 'break-word',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {g.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 600,
        color: '#374151',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
      {label}
    </span>
  )
}

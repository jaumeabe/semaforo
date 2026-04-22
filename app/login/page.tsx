'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: 16,
    border: '2px solid #d6dce4',
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    marginBottom: 12,
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          padding: '48px 40px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#2f5496', fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>
          Semaforo
        </h1>
        <p style={{ color: '#666', fontSize: 14, margin: '0 0 32px' }}>
          Sanidad de granjas
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Usuario"
            autoFocus
            autoComplete="username"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#4472c4')}
            onBlur={e => (e.currentTarget.style.borderColor = '#d6dce4')}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#4472c4')}
            onBlur={e => (e.currentTarget.style.borderColor = '#d6dce4')}
          />

          {error && (
            <p style={{ color: '#c62828', fontSize: 14, margin: '4px 0 0', fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              marginTop: 20,
              background: loading || !username || !password ? '#a5a5a5' : '#4472c4',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ color: '#bbb', fontSize: 11, marginTop: 32 }}>
          Premier Pigs — Semaforo
        </p>
      </div>
    </main>
  )
}

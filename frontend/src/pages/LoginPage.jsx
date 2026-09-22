import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@arifinance.com')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email dan password harus diisi!')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login berhasil! Selamat datang 👋')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa email dan password.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '20px',
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          right: '10%',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '5%',
          width: 250,
          height: 250,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Wallet size={30} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>AriFinance</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
            Manajemen Keuangan Pribadi Mahasiswa
          </p>
        </div>

        {/* Card */}
        <div
          className="glass"
          style={{
            borderRadius: 20,
            padding: 32,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
            Masuk ke Akun
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
            Gunakan akun demo atau akun Anda sendiri
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="input-field"
                autoComplete="email"
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingRight: 48 }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="btn-login"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 15 }}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 10,
            }}
          >
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
              <strong style={{ color: '#3b82f6' }}>Akun Demo:</strong>
            </p>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Email: <span style={{ color: '#94a3b8' }}>demo@arifinance.com</span>
            </p>
            <p style={{ fontSize: 12, color: '#64748b' }}>
              Password: <span style={{ color: '#94a3b8' }}>password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

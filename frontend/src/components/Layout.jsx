import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, TrendingDown, LogOut, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/income', icon: TrendingUp, label: 'Pemasukan' },
  { to: '/expense', icon: TrendingDown, label: 'Pengeluaran' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout!')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0f172a' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col"
        style={{
          width: 260,
          minHeight: '100vh',
          background: '#1e293b',
          borderRight: '1px solid #334155',
          padding: '24px 16px',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
              AriFinance
            </h1>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Manajemen Keuangan</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info & Logout */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: 16, marginTop: 16 }}>
          <div
            style={{
              background: '#0f172a',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                marginBottom: 8,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{user?.email}</p>
          </div>

          <button onClick={handleLogout} className="sidebar-item" style={{ color: '#ef4444' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: 260,
          flex: 1,
          minHeight: '100vh',
          padding: '32px',
          overflowX: 'hidden',
        }}
      >
        <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

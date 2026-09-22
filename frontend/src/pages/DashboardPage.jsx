import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
} from 'lucide-react'
import api from '../lib/api'
import { formatRupiah, formatDate } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function StatCard({ title, value, icon: Icon, color, trend, subtitle }) {
  const colors = {
    blue: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: '#3b82f6',
      icon: '#3b82f6',
      text: '#3b82f6',
    },
    green: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: '#10b981',
      icon: '#10b981',
      text: '#10b981',
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: '#ef4444',
      icon: '#ef4444',
      text: '#ef4444',
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.1)',
      border: '#8b5cf6',
      icon: '#8b5cf6',
      text: '#8b5cf6',
    },
  }
  const c = colors[color] || colors.blue

  return (
    <div
      className="card card-hover"
      style={{
        borderLeft: `3px solid ${c.border}`,
        background: 'linear-gradient(135deg, #1e293b, #162032)',
      }}
    >
      <div className="flex items-start justify-between">
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: c.text,
              marginTop: 6,
              lineHeight: 1.2,
            }}
          >
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{subtitle}</p>
          )}
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            background: c.bg,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: 16,
          }}
        >
          <Icon size={22} color={c.icon} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryRes, txRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/recent-transactions'),
      ])
      setSummary(summaryRes.data.data)
      setTransactions(txRes.data.data.transactions || [])
    } catch (err) {
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const balance = summary?.balance ?? 0
  const incomeMonth = summary?.incomeThisMonth ?? 0
  const expenseMonth = summary?.expenseThisMonth ?? 0
  const totalIncome = balance + (summary?.expenseThisMonth ?? 0)

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9' }}>
            Halo, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Pantau keuangan kamu hari ini
          </p>
        </div>
        <button
          id="btn-refresh-dashboard"
          onClick={fetchData}
          className="btn btn-ghost btn-sm"
          disabled={loading}
          style={{ gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto', width: 36, height: 36 }} />
          <p style={{ color: '#64748b', marginTop: 12, fontSize: 14 }}>Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Saldo utama */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f, #1e293b)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              marginBottom: 24,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
              }}
            />
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wallet size={14} />
                  Total Saldo Kamu
                </p>
                <p
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: balance >= 0 ? '#10b981' : '#ef4444',
                    lineHeight: 1,
                  }}
                >
                  {formatRupiah(balance)}
                </p>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  Pemasukan − Pengeluaran (semua waktu)
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  id="btn-tambah-pemasukan"
                  onClick={() => navigate('/income')}
                  className="btn btn-success"
                  style={{ fontSize: 13 }}
                >
                  <Plus size={16} />
                  Pemasukan
                </button>
                <button
                  id="btn-tambah-pengeluaran"
                  onClick={() => navigate('/expense')}
                  className="btn btn-danger"
                  style={{ fontSize: 13 }}
                >
                  <Plus size={16} />
                  Pengeluaran
                </button>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            <StatCard
              title="Pemasukan Bulan Ini"
              value={formatRupiah(incomeMonth)}
              icon={TrendingUp}
              color="green"
              subtitle="Total pemasukan bulan ini"
            />
            <StatCard
              title="Pengeluaran Bulan Ini"
              value={formatRupiah(expenseMonth)}
              icon={TrendingDown}
              color="red"
              subtitle="Total pengeluaran bulan ini"
            />
            <StatCard
              title="Sisa Bulan Ini"
              value={formatRupiah(incomeMonth - expenseMonth)}
              icon={Wallet}
              color={incomeMonth - expenseMonth >= 0 ? 'blue' : 'red'}
              subtitle="Pemasukan − Pengeluaran"
            />
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div className="section-header">
              <div>
                <h2 className="section-title">Transaksi Terbaru</h2>
                <p className="section-subtitle">10 transaksi terakhir kamu</p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state">
                <Wallet size={48} />
                <p style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8', marginTop: 8 }}>
                  Belum ada transaksi
                </p>
                <p style={{ fontSize: 13, marginTop: 4 }}>
                  Mulai tambah pemasukan atau pengeluaran
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Deskripsi</th>
                      <th>Tipe</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                          {formatDate(tx.date)}
                        </td>
                        <td>
                          <div>
                            <p style={{ fontWeight: 500 }}>{tx.description}</p>
                            {tx.category && (
                              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                {tx.category}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          {tx.type === 'income' ? (
                            <span className="badge badge-green">
                              <ArrowUpRight size={11} />
                              Pemasukan
                            </span>
                          ) : (
                            <span className="badge badge-red">
                              <ArrowDownRight size={11} />
                              Pengeluaran
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: tx.type === 'income' ? '#10b981' : '#ef4444',
                            }}
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatRupiah(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

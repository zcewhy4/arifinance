import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, TrendingUp, X, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import { formatRupiah, formatDate, todayDate } from '../lib/utils'
import toast from 'react-hot-toast'

function AddIncomeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    amount: '',
    source: '',
    date: todayDate(),
    note: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.source || !form.date) {
      toast.error('Nominal, sumber, dan tanggal harus diisi!')
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Nominal harus berupa angka lebih dari 0')
      return
    }
    setLoading(true)
    try {
      await api.post('/income', {
        amount,
        source: form.source,
        date: form.date,
        note: form.note || null,
      })
      toast.success('Pemasukan berhasil ditambahkan! 🎉')
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan pemasukan'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Tambah Pemasukan</h2>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Catat pemasukan baru kamu</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 8 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Nominal (Rp) *
              </label>
              <input
                id="income-amount"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                placeholder="Contoh: 500000"
                className="input-field"
                min="1"
                step="1000"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Sumber Pemasukan *
              </label>
              <input
                id="income-source"
                name="source"
                type="text"
                value={form.source}
                onChange={handleChange}
                placeholder="Contoh: Uang Saku, Freelance, Gaji..."
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Tanggal *
              </label>
              <input
                id="income-date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Catatan (opsional)
              </label>
              <textarea
                id="income-note"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Catatan tambahan..."
                className="input-field"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="flex gap-3" style={{ paddingTop: 4 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={loading}
              >
                Batal
              </button>
              <button
                id="btn-submit-income"
                type="submit"
                className="btn btn-success"
                style={{ flex: 2, justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : <><Plus size={16} /> Tambah Pemasukan</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const fetchIncomes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/income?limit=50')
      setIncomes(res.data.data.incomes || [])
    } catch {
      toast.error('Gagal memuat data pemasukan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pemasukan ini?')) return
    setDeleting(id)
    try {
      await api.delete(`/income/${id}`)
      toast.success('Pemasukan berhasil dihapus')
      setIncomes((prev) => prev.filter((i) => i.id !== id))
    } catch {
      toast.error('Gagal menghapus pemasukan')
    } finally {
      setDeleting(null)
    }
  }

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={26} color="#10b981" />
            Pemasukan
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Total: <span style={{ color: '#10b981', fontWeight: 700 }}>{formatRupiah(totalIncome)}</span>
            {' '}dari {incomes.length} transaksi
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="btn-refresh-income"
            onClick={fetchIncomes}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            id="btn-open-modal-income"
            onClick={() => setShowModal(true)}
            className="btn btn-success"
          >
            <Plus size={16} />
            Tambah Pemasukan
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #0d2d1a, #1e293b)',
          borderLeft: '3px solid #10b981',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 52,
              height: 52,
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>TOTAL SELURUH PEMASUKAN</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#10b981' }}>{formatRupiah(totalIncome)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="spinner" style={{ margin: '0 auto', width: 32, height: 32 }} />
            <p style={{ color: '#64748b', marginTop: 10, fontSize: 14 }}>Memuat pemasukan...</p>
          </div>
        ) : incomes.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={48} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8', marginTop: 8 }}>
              Belum ada pemasukan
            </p>
            <p style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>
              Klik tombol "Tambah Pemasukan" untuk mulai mencatat
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-success btn-sm">
              <Plus size={14} /> Tambah Sekarang
            </button>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Sumber</th>
                  <th>Catatan</th>
                  <th>Jumlah</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {formatDate(income.date)}
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, color: '#f1f5f9' }}>{income.source}</p>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>
                      {income.note || <span style={{ color: '#334155' }}>-</span>}
                    </td>
                    <td>
                      <span className="amount-income" style={{ fontSize: 15 }}>
                        +{formatRupiah(income.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        id={`btn-delete-income-${income.id}`}
                        onClick={() => handleDelete(income.id)}
                        className="btn btn-ghost btn-sm"
                        disabled={deleting === income.id}
                        style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        {deleting === income.id ? (
                          <div className="spinner" style={{ width: 12, height: 12 }} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddIncomeModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchIncomes}
        />
      )}
    </div>
  )
}

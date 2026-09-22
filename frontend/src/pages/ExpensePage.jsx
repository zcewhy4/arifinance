import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, TrendingDown, X, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import { formatRupiah, formatDate, todayDate } from '../lib/utils'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = ['Cash', 'QRIS', 'Transfer', 'E-Wallet', 'Debit']

function AddExpenseModal({ onClose, onSuccess, categories }) {
  const [form, setForm] = useState({
    amount: '',
    categoryId: '',
    paymentMethod: 'Cash',
    description: '',
    date: todayDate(),
    note: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.categoryId || !form.description || !form.date) {
      toast.error('Semua field wajib harus diisi!')
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Nominal harus berupa angka lebih dari 0')
      return
    }
    setLoading(true)
    try {
      await api.post('/expenses', {
        amount,
        categoryId: parseInt(form.categoryId),
        paymentMethod: form.paymentMethod,
        description: form.description,
        date: form.date,
        note: form.note || null,
      })
      toast.success('Pengeluaran berhasil ditambahkan! 💸')
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan pengeluaran'
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
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Tambah Pengeluaran</h2>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Catat pengeluaran baru kamu</p>
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
                id="expense-amount"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                placeholder="Contoh: 15000"
                className="input-field"
                min="1"
                step="500"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Deskripsi *
              </label>
              <input
                id="expense-description"
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                placeholder="Contoh: Makan siang, Bensin motor..."
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                  Kategori *
                </label>
                <select
                  id="expense-category"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                  Pembayaran *
                </label>
                <select
                  id="expense-payment"
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="input-field"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 8 }}>
                Tanggal *
              </label>
              <input
                id="expense-date"
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
                id="expense-note"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Catatan tambahan..."
                className="input-field"
                rows={2}
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
                id="btn-submit-expense"
                type="submit"
                className="btn btn-danger"
                style={{ flex: 2, justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? <div className="spinner" /> : <><Plus size={16} /> Tambah Pengeluaran</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [expRes, catRes] = await Promise.all([
        api.get('/expenses?limit=50'),
        api.get('/categories?type=expense'),
      ])
      setExpenses(expRes.data.data.expenses || [])
      setCategories(catRes.data.data.categories || [])
    } catch {
      toast.error('Gagal memuat data pengeluaran')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pengeluaran ini?')) return
    setDeleting(id)
    try {
      await api.delete(`/expenses/${id}`)
      toast.success('Pengeluaran berhasil dihapus')
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    } catch {
      toast.error('Gagal menghapus pengeluaran')
    } finally {
      setDeleting(null)
    }
  }

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingDown size={26} color="#ef4444" />
            Pengeluaran
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Total: <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatRupiah(totalExpense)}</span>
            {' '}dari {expenses.length} transaksi
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="btn-refresh-expense"
            onClick={fetchData}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            id="btn-open-modal-expense"
            onClick={() => setShowModal(true)}
            className="btn btn-danger"
          >
            <Plus size={16} />
            Tambah Pengeluaran
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #2d0d0d, #1e293b)',
          borderLeft: '3px solid #ef4444',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 52,
              height: 52,
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingDown size={24} color="#ef4444" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>TOTAL SELURUH PENGELUARAN</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#ef4444' }}>{formatRupiah(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="spinner" style={{ margin: '0 auto', width: 32, height: 32 }} />
            <p style={{ color: '#64748b', marginTop: 10, fontSize: 14 }}>Memuat pengeluaran...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <TrendingDown size={48} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8', marginTop: 8 }}>
              Belum ada pengeluaran
            </p>
            <p style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>
              Klik tombol "Tambah Pengeluaran" untuk mulai mencatat
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-danger btn-sm">
              <Plus size={14} /> Tambah Sekarang
            </button>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi</th>
                  <th>Kategori</th>
                  <th>Pembayaran</th>
                  <th>Jumlah</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {formatDate(expense.date)}
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, color: '#f1f5f9' }}>{expense.description}</p>
                      {expense.note && (
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{expense.note}</p>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-red">
                        {expense.category?.name || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{expense.paymentMethod}</span>
                    </td>
                    <td>
                      <span className="amount-expense" style={{ fontSize: 15 }}>
                        -{formatRupiah(expense.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        id={`btn-delete-expense-${expense.id}`}
                        onClick={() => handleDelete(expense.id)}
                        className="btn btn-ghost btn-sm"
                        disabled={deleting === expense.id}
                        style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        {deleting === expense.id ? (
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
        <AddExpenseModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
          categories={categories}
        />
      )}
    </div>
  )
}

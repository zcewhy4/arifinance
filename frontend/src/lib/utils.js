/**
 * Format number ke Rupiah
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  if (amount === null || amount === undefined) return 'Rp0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date ke Indonesia
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format date ke input date (YYYY-MM-DD)
 * @param {string|Date} date
 * @returns {string}
 */
export function toInputDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Today's date in YYYY-MM-DD
 * @returns {string}
 */
export function todayDate() {
  return new Date().toISOString().split('T')[0]
}

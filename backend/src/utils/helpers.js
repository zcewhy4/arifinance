/**
 * Format angka ke format Rupiah
 * @param {number} amount
 * @returns {string}
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse Decimal dari Prisma ke number
 * @param {*} decimal
 * @returns {number}
 */
function parseDecimal(decimal) {
  return decimal ? parseFloat(decimal.toString()) : 0;
}

/**
 * Get current month and year
 * @returns {{ month: number, year: number }}
 */
function getCurrentPeriod() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

/**
 * Get start and end date of a month
 * @param {number} month
 * @param {number} year
 * @returns {{ startDate: Date, endDate: Date }}
 */
function getMonthDateRange(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

module.exports = {
  formatRupiah,
  parseDecimal,
  getCurrentPeriod,
  getMonthDateRange,
};

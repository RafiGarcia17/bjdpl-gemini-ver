export function parseFlexibleDate(value) {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number' && isFinite(value)) {
    const d = new Date(Math.round((value - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;
    let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) return makeDate(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
    if (m) {
      let y = +m[3];
      if (y < 100) y += 2000;
      return makeDate(y, +m[2] - 1, +m[1]);
    }
  }
  return null;
}

function makeDate(y, mIdx, d) {
  const dt = new Date(y, mIdx, d, 12, 0, 0, 0);
  if (isNaN(dt.getTime())) return null;
  if (dt.getFullYear() !== y || dt.getMonth() !== mIdx || dt.getDate() !== d) return null;
  return dt;
}

export function extractDateFromFilename(filename) {
  if (!filename || typeof filename !== 'string') return null;
  const s = filename.trim();
  // Match DD-MM-YYYY_Namafile or DD-MM-YYYY anywhere at start or in filename
  const m = s.match(/(\d{1,2})[-_.](\d{1,2})[-_.](\d{4})/);
  if (m) {
    const dt = makeDate(+m[3], +m[2] - 1, +m[1]);
    if (dt) return dt;
  }
  return null;
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTHS_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function formatDateID(date) {
  const dt = parseFlexibleDate(date);
  if (!dt) return '-';
  return `${dt.getDate()} ${MONTHS_ID[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatShortDateID(date) {
  const dt = parseFlexibleDate(date);
  if (!dt) return '-';
  const d = String(dt.getDate()).padStart(2, '0');
  return `${d} ${MONTHS_SHORT_ID[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatNumber(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.round(num));
}

export function formatRupiah(val) {
  const num = Number(val) || 0;
  return 'Rp ' + formatNumber(num);
}

export function formatPercent(val, decimals = 2) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num) + '%';
}

export function parseNumber(raw) {
  if (typeof raw === 'number' && isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const cleaned = raw.trim().replace(/[^0-9.-]/g, '');
    const n = Number(cleaned);
    return isFinite(n) ? n : 0;
  }
  return 0;
}

export function cleanEntityLabel(str) {
  if (!str) return '-';
  return String(str).trim();
}

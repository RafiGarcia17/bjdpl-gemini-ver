import * as XLSX from 'xlsx';

export function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function readExcelBuffer(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [], rows: [] };
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', cellDates: true });

  if (!rawRows || rawRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headerSet = new Set();
  const normalizedRows = rawRows.map((raw) => {
    const cleanRow = {};
    for (const key of Object.keys(raw)) {
      const normKey = normalizeHeader(key);
      if (normKey) {
        headerSet.add(normKey);
        const val = raw[key];
        cleanRow[normKey] = typeof val === 'string' ? val.trim() : val;
      }
    }
    return cleanRow;
  });

  return {
    headers: Array.from(headerSet),
    rows: normalizedRows,
  };
}

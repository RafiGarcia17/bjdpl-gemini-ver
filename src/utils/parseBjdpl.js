import { parseNumber, extractDateFromFilename, parseFlexibleDate } from './format.js';

export const AGE_BUCKETS = [
  { id: '1', key: 'b1', label: '1 : 1 sd 15 Hari', shortLabel: '1 : 1 sd 15 Hari' },
  { id: '2', key: 'b2', label: '2 : 16 sd 30 Hari', shortLabel: '2 : 16 sd 30 Hari' },
  { id: '3', key: 'b3', label: '3 : 31 sd 45 Hari', shortLabel: '3 : 31 sd 45 Hari' },
  { id: '4', key: 'b4', label: '4 : 46 sd 60 Hari', shortLabel: '4 : 46 sd 60 Hari' },
  { id: '5', key: 'b5', label: '5 : 61 sd 75 Hari', shortLabel: '5 : 61 sd 75 Hari' },
  { id: '6', key: 'b6', label: '6 : 76 sd 90 Hari', shortLabel: '6 : 76 sd 90 Hari' },
  { id: '7', key: 'b7', label: '7 : > 90 Hari', shortLabel: '7 : > 90 Hari' },
];

export function classifyAgeBucket(rawAge) {
  const s = String(rawAge || '').trim().replace(/\s+/g, ' ');
  if (!s) return null;

  const prefixMatch = s.match(/^([1-7])\s*[:.\-]/);
  if (prefixMatch) {
    return 'b' + prefixMatch[1];
  }

  const lower = s.toLowerCase();
  if (lower.includes('1 sd 15') || lower.includes('1 s/d 15') || lower.includes('1-15')) return 'b1';
  if (lower.includes('16 sd 30') || lower.includes('16 s/d 30') || lower.includes('16-30')) return 'b2';
  if (lower.includes('31 sd 45') || lower.includes('31 s/d 45') || lower.includes('31-45')) return 'b3';
  if (lower.includes('46 sd 60') || lower.includes('46 s/d 60') || lower.includes('46-60')) return 'b4';
  if (lower.includes('61 sd 75') || lower.includes('61 s/d 75') || lower.includes('61-75')) return 'b5';
  if (lower.includes('76 sd 90') || lower.includes('76 s/d 90') || lower.includes('76-90')) return 'b6';
  if (lower.includes('90') || lower.includes('diatas 90') || lower.includes('> 90') || lower.includes('>90')) return 'b7';

  return null;
}

export function parseBjdplRows(headers, rows, filename = '') {
  const requiredCols = ['AREA', 'CABANG', 'UMUR BJDPL', 'BJDPL BULAN INI'];
  const missing = requiredCols.filter((col) => !headers.includes(col));

  if (missing.length > 0) {
    return {
      data: [],
      skipped: 0,
      fileDate: null,
      error: `Kolom wajib tidak ditemukan pada file BJDPL: ${missing.join(', ')}. Pastikan mengupload file Unduh Data BJDPL (UP) yang sesuai.`,
    };
  }

  const fileDate = extractDateFromFilename(filename);
  const data = [];
  let skipped = 0;

  for (const r of rows) {
    const cabang = String(r['CABANG'] || '').trim();
    const area = String(r['AREA'] || '').trim();
    const umurRaw = String(r['UMUR BJDPL'] || '').trim();

    if (!cabang || !area || !umurRaw) {
      skipped += 1;
      continue;
    }

    const bucketKey = classifyAgeBucket(umurRaw);
    if (!bucketKey) {
      skipped += 1;
      continue;
    }

    const rowDate = r['TANGGAL'] ? parseFlexibleDate(r['TANGGAL']) : fileDate;

    data.push({
      kanwil: String(r['KANWIL'] || '').trim(),
      area,
      cabang,
      outlet: String(r['OUTLET'] || cabang).trim(),
      subProduct: String(r['SUB PRODUCT NM'] || r['PRODUCT'] || '-').trim(),
      product: String(r['PRODUCT'] || r['SUB PRODUCT NM'] || '-').trim(),
      flag: String(r['FLAG'] || 'KONVEN').trim(),
      umurRaw,
      bucketKey,
      bjdplTahunLalu: parseNumber(r['BJDPL AKHIR TAHUN LALU']),
      bjdplBulanLalu: parseNumber(r['BJDPL AKHIR BULAN LALU']),
      bjdplBulanIni: parseNumber(r['BJDPL BULAN INI']),
      rpMtm: parseNumber(r['RP MTM']),
      persenMtm: parseNumber(r['PERSEN MTM']),
      rpYtd: parseNumber(r['RP YTD']),
      persenYtd: parseNumber(r['PERSEN YTD']),
      date: rowDate,
    });
  }

  return {
    data,
    skipped,
    fileDate,
    error: null,
  };
}

export function parseOslRows(headers, rows, filename = '') {
  const requiredCols = ['AREA', 'CABANG', 'OSL_BULAN_INI_THNINI'];
  const missing = requiredCols.filter((col) => !headers.includes(col));

  if (missing.length > 0) {
    return {
      data: [],
      skipped: 0,
      fileDate: null,
      error: `Kolom wajib tidak ditemukan pada file OSL: ${missing.join(', ')}. Pastikan mengupload file OSL_POSISI_DETAIL yang sesuai.`,
    };
  }

  const fileDate = extractDateFromFilename(filename);
  const data = [];
  let skipped = 0;

  for (const r of rows) {
    const cabang = String(r['CABANG'] || '').trim();
    const area = String(r['AREA'] || '').trim();

    if (!cabang || !area) {
      skipped += 1;
      continue;
    }

    data.push({
      kanwil: String(r['KANWIL'] || '').trim(),
      flag: String(r['FLAG'] || 'KONVEN').trim(),
      area,
      cabang,
      unit: String(r['UNIT'] || cabang).trim(),
      grupProduk: String(r['GRUP_PRODUK'] || '-').trim(),
      subProduk: String(r['SUB_PRODUK'] || '-').trim(),
      segmen: String(r['SEGMEN'] || '-').trim(),
      kategoriOsl: String(r['KATEGORI_OSL'] || '-').trim(),
      oslTahunLalu: parseNumber(r['OSL_AKHIR_TAHUN_THNLALU']),
      oslBulanLalu: parseNumber(r['OSL_BULAN_LALU_THNINI']),
      oslBulanIni: parseNumber(r['OSL_BULAN_INI_THNINI']),
      date: fileDate,
    });
  }

  return {
    data,
    skipped,
    fileDate,
    error: null,
  };
}

import { AGE_BUCKETS } from './parseBjdpl.js';
import { RATIO_TARGETS } from './targets.js';

function createEmptyBuckets() {
  return {
    b1: 0,
    b2: 0,
    b3: 0,
    b4: 0,
    b5: 0,
    b6: 0,
    b7: 0,
  };
}

export function extractAvailableAreas(bjdplH, bjdplH1, oslData) {
  const areaSet = new Set();
  const addFrom = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const r of arr) {
      if (r.area) areaSet.add(r.area);
    }
  };
  addFrom(bjdplH);
  addFrom(bjdplH1);
  addFrom(oslData);
  return Array.from(areaSet).sort((a, b) => a.localeCompare(b));
}

export function filterRowsByArea(rows, selectedArea) {
  if (!Array.isArray(rows)) return [];
  if (!selectedArea || selectedArea === 'ALL') return rows;
  return rows.filter((r) => r.area === selectedArea);
}

/**
 * Mengagregasi data per CABANG untuk Tabel 1 (Posisi BJDPL Hari H & Rasio OSL)
 * dan Tabel 2 (Komparasi BJDPL Hari H vs H-1 & Delta).
 */
export function aggregateByCabang(bjdplHRows, bjdplH1Rows, oslRows, selectedArea = 'ALL') {
  const rowsH = filterRowsByArea(bjdplHRows, selectedArea);
  const rowsH1 = filterRowsByArea(bjdplH1Rows, selectedArea);
  const rowsOsl = filterRowsByArea(oslRows, selectedArea);

  const map = new Map();

  const ensureCabang = (cabang, area, kanwil) => {
    if (!map.has(cabang)) {
      map.set(cabang, {
        key: cabang,
        cabang,
        area: area || '-',
        kanwil: kanwil || '-',
        bucketsH: createEmptyBuckets(),
        bucketsH1: createEmptyBuckets(),
        grandTotalH: 0,
        grandTotalH1: 0,
        bjdplBulanLaluH: 0,
        bjdplTahunLaluH: 0,
        oslGross: 0,
        oslAktif: 0,
        oslBjdpl: 0,
      });
    }
    return map.get(cabang);
  };

  for (const r of rowsH) {
    const item = ensureCabang(r.cabang, r.area, r.kanwil);
    if (item.bucketsH[r.bucketKey] !== undefined) {
      item.bucketsH[r.bucketKey] += r.bjdplBulanIni;
    }
    item.grandTotalH += r.bjdplBulanIni;
    item.bjdplBulanLaluH += r.bjdplBulanLalu;
    item.bjdplTahunLaluH += r.bjdplTahunLalu;
  }

  for (const r of rowsH1) {
    const item = ensureCabang(r.cabang, r.area, r.kanwil);
    if (item.bucketsH1[r.bucketKey] !== undefined) {
      item.bucketsH1[r.bucketKey] += r.bjdplBulanIni;
    }
    item.grandTotalH1 += r.bjdplBulanIni;
  }

  for (const r of rowsOsl) {
    const item = ensureCabang(r.cabang, r.area, r.kanwil);
    item.oslGross += r.oslBulanIni;
    if (r.kategoriOsl.toUpperCase().includes('BJDPL')) {
      item.oslBjdpl += r.oslBulanIni;
    } else {
      item.oslAktif += r.oslBulanIni;
    }
  }

  const rowsResult = Array.from(map.values()).map((item) => {
    const over60H = item.bucketsH.b5 + item.bucketsH.b6 + item.bucketsH.b7;
    const rasioAll = item.oslGross > 0 ? (item.grandTotalH / item.oslGross) * 100 : 0;
    const rasioOver60 = item.oslGross > 0 ? (over60H / item.oslGross) * 100 : 0;
    const delta = item.grandTotalH - item.grandTotalH1;

    // Target progress visualisasi rasio terhadap ambang batas sehat
    const targetRatio = RATIO_TARGETS.maxAllBjdplRatio;
    const percentOfLimit = targetRatio > 0 ? (rasioAll / targetRatio) * 100 : 0;

    return {
      ...item,
      over60H,
      rasioAll,
      rasioOver60,
      delta,
      targetRatio,
      percentOfLimit,
      count: item.grandTotalH,
    };
  });

  // Sort default berdasarkan kode/nama Cabang ascending agar rapi seperti laporan resmi,
  // atau bisa di-sort di UI
  rowsResult.sort((a, b) => a.cabang.localeCompare(b.cabang));

  // Hitung Grand Total Baris Bawah
  const totals = {
    bucketsH: createEmptyBuckets(),
    bucketsH1: createEmptyBuckets(),
    grandTotalH: 0,
    grandTotalH1: 0,
    over60H: 0,
    oslGross: 0,
    delta: 0,
    rasioAll: 0,
    rasioOver60: 0,
  };

  for (const r of rowsResult) {
    for (const b of AGE_BUCKETS) {
      totals.bucketsH[b.key] += r.bucketsH[b.key];
      totals.bucketsH1[b.key] += r.bucketsH1[b.key];
    }
    totals.grandTotalH += r.grandTotalH;
    totals.grandTotalH1 += r.grandTotalH1;
    totals.over60H += r.over60H;
    totals.oslGross += r.oslGross;
    totals.delta += r.delta;
  }

  totals.rasioAll = totals.oslGross > 0 ? (totals.grandTotalH / totals.oslGross) * 100 : 0;
  totals.rasioOver60 = totals.oslGross > 0 ? (totals.over60H / totals.oslGross) * 100 : 0;

  return {
    rows: rowsResult,
    totals,
  };
}

/**
 * Mengagregasi data untuk Tabel 3 (Tabel Bawah):
 * Rekapitulasi per Area & per Produk (SUB PRODUCT NM / PRODUCT)
 */
export function aggregateTableThree(bjdplHRows, bjdplH1Rows, oslRows, selectedArea = 'ALL') {
  const rowsH = filterRowsByArea(bjdplHRows, selectedArea);
  const rowsH1 = filterRowsByArea(bjdplH1Rows, selectedArea);
  const rowsOsl = filterRowsByArea(oslRows, selectedArea);

  // 3A: Rekap per AREA
  const areaMap = new Map();
  const ensureArea = (area) => {
    const key = area || 'LAINNYA';
    if (!areaMap.has(key)) {
      areaMap.set(key, {
        key,
        label: key,
        bucketsH: createEmptyBuckets(),
        grandTotalH: 0,
        grandTotalH1: 0,
        bjdplBulanLalu: 0,
        bjdplTahunLalu: 0,
        oslGross: 0,
      });
    }
    return areaMap.get(key);
  };

  for (const r of rowsH) {
    const item = ensureArea(r.area);
    if (item.bucketsH[r.bucketKey] !== undefined) {
      item.bucketsH[r.bucketKey] += r.bjdplBulanIni;
    }
    item.grandTotalH += r.bjdplBulanIni;
    item.bjdplBulanLalu += r.bjdplBulanLalu;
    item.bjdplTahunLalu += r.bjdplTahunLalu;
  }

  for (const r of rowsH1) {
    const item = ensureArea(r.area);
    item.grandTotalH1 += r.bjdplBulanIni;
  }

  for (const r of rowsOsl) {
    const item = ensureArea(r.area);
    item.oslGross += r.oslBulanIni;
  }

  const byArea = Array.from(areaMap.values())
    .map((item) => {
      const over60H = item.bucketsH.b5 + item.bucketsH.b6 + item.bucketsH.b7;
      const rasioAll = item.oslGross > 0 ? (item.grandTotalH / item.oslGross) * 100 : 0;
      const rasioOver60 = item.oslGross > 0 ? (over60H / item.oslGross) * 100 : 0;
      const deltaH = item.grandTotalH - item.grandTotalH1;
      const mtmRp = item.grandTotalH - item.bjdplBulanLalu;
      const ytdRp = item.grandTotalH - item.bjdplTahunLalu;
      return {
        ...item,
        over60H,
        rasioAll,
        rasioOver60,
        deltaH,
        mtmRp,
        ytdRp,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  // 3B: Rekap per PRODUK (SUB PRODUCT NM)
  const prodMap = new Map();
  const ensureProd = (prod) => {
    const key = prod || 'LAINNYA';
    if (!prodMap.has(key)) {
      prodMap.set(key, {
        key,
        label: key,
        bucketsH: createEmptyBuckets(),
        grandTotalH: 0,
        grandTotalH1: 0,
        bjdplBulanLalu: 0,
        bjdplTahunLalu: 0,
      });
    }
    return prodMap.get(key);
  };

  for (const r of rowsH) {
    const item = ensureProd(r.subProduct);
    if (item.bucketsH[r.bucketKey] !== undefined) {
      item.bucketsH[r.bucketKey] += r.bjdplBulanIni;
    }
    item.grandTotalH += r.bjdplBulanIni;
    item.bjdplBulanLalu += r.bjdplBulanLalu;
    item.bjdplTahunLalu += r.bjdplTahunLalu;
  }

  for (const r of rowsH1) {
    const item = ensureProd(r.subProduct);
    item.grandTotalH1 += r.bjdplBulanIni;
  }

  const byProduct = Array.from(prodMap.values())
    .map((item) => {
      const over60H = item.bucketsH.b5 + item.bucketsH.b6 + item.bucketsH.b7;
      const deltaH = item.grandTotalH - item.grandTotalH1;
      const mtmRp = item.grandTotalH - item.bjdplBulanLalu;
      const ytdRp = item.grandTotalH - item.bjdplTahunLalu;
      return {
        ...item,
        over60H,
        deltaH,
        mtmRp,
        ytdRp,
      };
    })
    .sort((a, b) => b.grandTotalH - a.grandTotalH || a.label.localeCompare(b.label));

  return {
    byArea,
    byProduct,
  };
}

/**
 * Mengambil rincian lengkap untuk 1 Cabang pada Halaman Detail
 */
export function detailOfCabang(cabangKey, bjdplHRows, bjdplH1Rows, oslRows) {
  const rowsH = (bjdplHRows || []).filter((r) => r.cabang === cabangKey);
  const rowsH1 = (bjdplH1Rows || []).filter((r) => r.cabang === cabangKey);
  const rowsOsl = (oslRows || []).filter((r) => r.cabang === cabangKey);

  const firstRow = rowsH[0] || rowsH1[0] || rowsOsl[0] || {};
  const area = firstRow.area || '-';
  const kanwil = firstRow.kanwil || '-';

  // Rekap per Outlet/UPC di dalam Cabang tersebut
  const outletMap = new Map();
  const ensureOutlet = (outlet) => {
    const k = outlet || cabangKey;
    if (!outletMap.has(k)) {
      outletMap.set(k, {
        outlet: k,
        bucketsH: createEmptyBuckets(),
        grandTotalH: 0,
        grandTotalH1: 0,
      });
    }
    return outletMap.get(k);
  };

  for (const r of rowsH) {
    const o = ensureOutlet(r.outlet);
    if (o.bucketsH[r.bucketKey] !== undefined) {
      o.bucketsH[r.bucketKey] += r.bjdplBulanIni;
    }
    o.grandTotalH += r.bjdplBulanIni;
  }

  for (const r of rowsH1) {
    const o = ensureOutlet(r.outlet);
    o.grandTotalH1 += r.bjdplBulanIni;
  }

  const outlets = Array.from(outletMap.values())
    .map((o) => ({
      ...o,
      delta: o.grandTotalH - o.grandTotalH1,
      over60H: o.bucketsH.b5 + o.bucketsH.b6 + o.bucketsH.b7,
    }))
    .sort((a, b) => b.grandTotalH - a.grandTotalH || a.outlet.localeCompare(b.outlet));

  return {
    cabang: cabangKey,
    area,
    kanwil,
    outlets,
    rawH: rowsH,
    rawH1: rowsH1,
    rawOsl: rowsOsl,
  };
}

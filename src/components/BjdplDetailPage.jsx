import React, { useMemo } from 'react';
import { AGE_BUCKETS } from '../utils/parseBjdpl.js';
import { detailOfCabang } from '../utils/aggregateBjdpl.js';
import { formatNumber, formatPercent, formatDateID } from '../utils/format.js';

export default function BjdplDetailPage({
  cabangKey,
  bjdplHRows,
  bjdplH1Rows,
  oslRows,
  dateH,
  dateH1,
  onBack,
}) {
  const detail = useMemo(
    () => detailOfCabang(cabangKey, bjdplHRows, bjdplH1Rows, oslRows),
    [cabangKey, bjdplHRows, bjdplH1Rows, oslRows]
  );

  const totalH = detail.rawH.reduce((acc, r) => acc + r.bjdplBulanIni, 0);
  const totalH1 = detail.rawH1.reduce((acc, r) => acc + r.bjdplBulanIni, 0);
  const totalOsl = detail.rawOsl.reduce((acc, r) => acc + r.oslBulanIni, 0);
  const delta = totalH - totalH1;
  const rasioAll = totalOsl > 0 ? (totalH / totalOsl) * 100 : 0;

  return (
    <div className="detail-page">
      <div className="detail-topbar no-print">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Kembali ke Dashboard Utama
        </button>
        <button type="button" className="btn-primary" onClick={() => window.print()}>
          Cetak Detail Cabang / PDF
        </button>
      </div>

      <header className="detail-header">
        <span className="eyebrow">RINCIAN UNIT KERJA (CABANG)</span>
        <h1 className="detail-title">{detail.cabang}</h1>
        <p className="detail-subtitle">
          Area: <strong>{detail.area}</strong> • Kanwil: <strong>{detail.kanwil}</strong>
          {dateH && ` • Posisi Hari H: ${formatDateID(dateH)}`}
          {dateH1 && ` • Posisi H-1: ${formatDateID(dateH1)}`}
        </p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">TOTAL BJDPL HARI H</span>
          <div className="kpi-value">Rp {formatNumber(totalH)}</div>
          <div className="kpi-sub">Dari {detail.outlets.length} Outlet / UPC</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">TOTAL BJDPL H-1</span>
          <div className="kpi-value">Rp {formatNumber(totalH1)}</div>
          <div className="kpi-sub">
            Delta: <strong>{delta > 0 ? '+' : ''}Rp {formatNumber(delta)}</strong>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">TOTAL OSL GROSS CABANG</span>
          <div className="kpi-value">Rp {formatNumber(totalOsl)}</div>
          <div className="kpi-sub">
            Rasio All BJDPL: <strong>{formatPercent(rasioAll, 2)}</strong>
          </div>
        </div>
      </div>

      {/* Tabel Rekap per Outlet / UPC di dalam Cabang */}
      <section className="table-section theme-light">
        <div className="section-head">
          <div>
            <span className="eyebrow">BREAKDOWN OUTLET / UPC</span>
            <h2 className="section-title">Distribusi Umur BJDPL per Outlet ({detail.cabang})</h2>
          </div>
        </div>

        <div className="table-responsive">
          <table className="monitoring-table">
            <thead>
              <tr>
                <th rowSpan={2} className="col-sticky">OUTLET / UPC</th>
                <th colSpan={AGE_BUCKETS.length} className="text-center group-header">
                  UMUR BJDPL / MDPL
                </th>
                <th rowSpan={2} className="text-right">GRAND TOTAL H</th>
                <th rowSpan={2} className="text-right">GRAND TOTAL H-1</th>
                <th rowSpan={2} className="text-right">DELTA</th>
              </tr>
              <tr>
                {AGE_BUCKETS.map((b) => (
                  <th key={b.key} className="text-right sub-header">
                    {b.shortLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.outlets.map((o) => (
                <tr key={o.outlet}>
                  <td className="col-sticky font-semibold">{o.outlet}</td>
                  {AGE_BUCKETS.map((b) => (
                    <td key={b.key} className="text-right num-cell">
                      {formatNumber(o.bucketsH[b.key])}
                    </td>
                  ))}
                  <td className="text-right num-cell font-bold cell-total">
                    {formatNumber(o.grandTotalH)}
                  </td>
                  <td className="text-right num-cell">{formatNumber(o.grandTotalH1)}</td>
                  <td
                    className={`text-right num-cell font-bold ${
                      o.delta > 0 ? 'delta-up' : o.delta < 0 ? 'delta-down' : ''
                    }`}
                  >
                    {o.delta > 0 ? '+' : ''}
                    {formatNumber(o.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tabel Rincian Baris Produk BJDPL Hari H */}
      {detail.rawH.length > 0 && (
        <section className="table-section theme-light">
          <div className="section-head">
            <div>
              <span className="eyebrow">DATA TRANSAKSI BJDPL HARI H</span>
              <h2 className="section-title">Rincian Baris per Sub-Produk & Kelompok Umur</h2>
            </div>
          </div>
          <div className="table-responsive">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th>OUTLET</th>
                  <th>SUB PRODUCT NM</th>
                  <th>FLAG</th>
                  <th>UMUR BJDPL</th>
                  <th className="text-right">AKHIR TAHUN LALU</th>
                  <th className="text-right">AKHIR BULAN LALU</th>
                  <th className="text-right">BJDPL BULAN INI (H)</th>
                  <th className="text-right">RP MTM</th>
                  <th className="text-right">RP YTD</th>
                </tr>
              </thead>
              <tbody>
                {detail.rawH.map((r, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{r.outlet}</td>
                    <td>{r.subProduct}</td>
                    <td>{r.flag}</td>
                    <td>{r.umurRaw}</td>
                    <td className="text-right num-cell">{formatNumber(r.bjdplTahunLalu)}</td>
                    <td className="text-right num-cell">{formatNumber(r.bjdplBulanLalu)}</td>
                    <td className="text-right num-cell font-bold cell-total">
                      {formatNumber(r.bjdplBulanIni)}
                    </td>
                    <td className="text-right num-cell">{formatNumber(r.rpMtm)}</td>
                    <td className="text-right num-cell">{formatNumber(r.rpYtd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

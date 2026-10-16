import React, { useState, useMemo } from 'react';
import { AGE_BUCKETS } from '../utils/parseBjdpl.js';
import { formatNumber, formatPercent, formatShortDateID } from '../utils/format.js';
import ProgressBar from './ProgressBar.jsx';
import Leaderboard from './Leaderboard.jsx';

export default function BjdplSection({
  cabangStats,
  tableThreeStats,
  hasBjdplH,
  hasBjdplH1,
  hasOsl,
  dateH,
  dateH1,
  selectedArea,
  searchQuery,
  onSelectCabang,
}) {
  const [sortConfig1, setSortConfig1] = useState({ key: 'cabang', dir: 'asc' });
  const [sortConfig2, setSortConfig2] = useState({ key: 'cabang', dir: 'asc' });

  const filteredRows = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return cabangStats.rows;
    return cabangStats.rows.filter(
      (r) =>
        r.cabang.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q)
    );
  }, [cabangStats.rows, searchQuery]);

  const sortedTable1 = useMemo(() => {
    const arr = [...filteredRows];
    const { key, dir } = sortConfig1;
    const mult = dir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      if (key === 'cabang') return a.cabang.localeCompare(b.cabang) * mult;
      if (key.startsWith('b')) return (a.bucketsH[key] - b.bucketsH[key]) * mult;
      return ((a[key] || 0) - (b[key] || 0)) * mult;
    });
    return arr;
  }, [filteredRows, sortConfig1]);

  const sortedTable2 = useMemo(() => {
    const arr = [...filteredRows];
    const { key, dir } = sortConfig2;
    const mult = dir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      if (key === 'cabang') return a.cabang.localeCompare(b.cabang) * mult;
      if (key.startsWith('b')) return (a.bucketsH[key] - b.bucketsH[key]) * mult;
      return ((a[key] || 0) - (b[key] || 0)) * mult;
    });
    return arr;
  }, [filteredRows, sortConfig2]);

  const toggleSort1 = (key) => {
    setSortConfig1((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
    );
  };

  const toggleSort2 = (key) => {
    setSortConfig2((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
    );
  };

  const { totals } = cabangStats;
  const labelDateH = dateH ? formatShortDateID(dateH) : 'Hari H';
  const labelDateH1 = dateH1 ? formatShortDateID(dateH1) : 'H-1';

  return (
    <div className="sections-wrapper">
      {/* KPI Summary Cards */}
      {hasBjdplH && (
        <section className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">GRAND TOTAL BJDPL ({labelDateH})</span>
            <div className="kpi-value">Rp {formatNumber(totals.grandTotalH)}</div>
            <div className="kpi-sub">
              Umur &gt; 60 Hari (5, 6, 7): <strong>Rp {formatNumber(totals.over60H)}</strong>
            </div>
          </div>

          {hasOsl && (
            <div className="kpi-card">
              <span className="kpi-label">TOTAL OSL GROSS</span>
              <div className="kpi-value">Rp {formatNumber(totals.oslGross)}</div>
              <div className="kpi-sub">
                Rasio ALL BJDPL: <strong>{formatPercent(totals.rasioAll, 2)}</strong> | Rasio &gt; 60 Hr:{' '}
                <strong>{formatPercent(totals.rasioOver60, 2)}</strong>
              </div>
            </div>
          )}

          {hasBjdplH1 && (
            <div className="kpi-card">
              <span className="kpi-label">PERBANDINGAN H VS H-1 ({labelDateH1})</span>
              <div
                className={`kpi-value ${
                  totals.delta > 0 ? 'text-danger' : totals.delta < 0 ? 'text-success' : ''
                }`}
              >
                {totals.delta > 0 ? '+' : ''}Rp {formatNumber(totals.delta)}
              </div>
              <div className="kpi-sub">
                Grand Total H-1: <strong>Rp {formatNumber(totals.grandTotalH1)}</strong>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Leaderboard Ranking Cabang */}
      {hasBjdplH && (
        <Leaderboard rows={filteredRows} onSelectCabang={onSelectCabang} />
      )}

      {/* TABEL 1: MONITORING UMUR BJDPL HARI H & RASIO TERHADAP OSL */}
      {hasBjdplH && (
        <section className="table-section theme-light">
          <div className="section-head">
            <div>
              <span className="eyebrow">TABEL 1 • POSISI BJDPL & RASIO OSL</span>
              <h2 className="section-title">
                Monitoring Umur BJDPL/MDPL per Unit Kerja ({labelDateH})
              </h2>
              <p className="section-desc">
                Klik pada baris Unit Kerja (Cabang) untuk membuka halaman rincian per Outlet/UPC dan Produk.
                {selectedArea !== 'ALL' && ` • Filter Area Aktif: ${selectedArea}`}
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="col-sticky" onClick={() => toggleSort1('cabang')}>
                    UNIT KERJA (CABANG) {sortConfig1.key === 'cabang' ? (sortConfig1.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th colSpan={AGE_BUCKETS.length} className="text-center group-header">
                    UMUR BJDPL / MDPL
                  </th>
                  <th rowSpan={2} className="text-right" onClick={() => toggleSort1('grandTotalH')}>
                    GRAND TOTAL {sortConfig1.key === 'grandTotalH' ? (sortConfig1.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th rowSpan={2} className="text-right" onClick={() => toggleSort1('oslGross')}>
                    OSL {sortConfig1.key === 'oslGross' ? (sortConfig1.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th rowSpan={2} className="text-right" onClick={() => toggleSort1('rasioAll')}>
                    RASIO ALL BJDPL {sortConfig1.key === 'rasioAll' ? (sortConfig1.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th rowSpan={2} className="text-right" onClick={() => toggleSort1('rasioOver60')}>
                    RASIO DIATAS 60 HARI {sortConfig1.key === 'rasioOver60' ? (sortConfig1.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th rowSpan={2} className="text-center no-print">
                    INDIKATOR BATAS
                  </th>
                </tr>
                <tr>
                  {AGE_BUCKETS.map((b) => (
                    <th
                      key={b.key}
                      className={`text-right sub-header ${
                        ['b5', 'b6', 'b7'].includes(b.key) ? 'highlight-over60' : ''
                      }`}
                      onClick={() => toggleSort1(b.key)}
                    >
                      {b.shortLabel} {sortConfig1.key === b.key ? (sortConfig1.dir === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTable1.map((row) => (
                  <tr
                    key={row.cabang}
                    className="clickable-row"
                    onClick={() => onSelectCabang(row.cabang)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectCabang(row.cabang);
                      }
                    }}
                  >
                    <td className="col-sticky font-semibold">
                      <div className="entity-cell">
                        <span className="entity-name">{row.cabang}</span>
                        <span className="entity-area">{row.area}</span>
                      </div>
                    </td>
                    {AGE_BUCKETS.map((b) => (
                      <td
                        key={b.key}
                        className={`text-right num-cell ${
                          ['b5', 'b6', 'b7'].includes(b.key) && row.bucketsH[b.key] > 0
                            ? 'text-warn-bold'
                            : ''
                        }`}
                      >
                        {formatNumber(row.bucketsH[b.key])}
                      </td>
                    ))}
                    <td className="text-right num-cell font-bold cell-total">
                      {formatNumber(row.grandTotalH)}
                    </td>
                    <td className="text-right num-cell">
                      {hasOsl ? formatNumber(row.oslGross) : '-'}
                    </td>
                    <td className="text-right num-cell font-semibold">
                      {hasOsl ? formatPercent(row.rasioAll, 2) : '-'}
                    </td>
                    <td
                      className={`text-right num-cell font-semibold ${
                        row.rasioOver60 > 0 ? 'text-danger' : ''
                      }`}
                    >
                      {hasOsl ? formatPercent(row.rasioOver60, 2) : '-'}
                    </td>
                    <td className="no-print">
                      {hasOsl ? (
                        <ProgressBar
                          percent={row.percentOfLimit}
                          label={`Rasio All: ${formatPercent(row.rasioAll, 2)} dari batas 1,50%`}
                        />
                      ) : (
                        <span className="muted-dash">Upload OSL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="grand-total-row">
                  <td className="col-sticky">GRAND TOTAL</td>
                  {AGE_BUCKETS.map((b) => (
                    <td key={b.key} className="text-right num-cell">
                      {formatNumber(totals.bucketsH[b.key])}
                    </td>
                  ))}
                  <td className="text-right num-cell">{formatNumber(totals.grandTotalH)}</td>
                  <td className="text-right num-cell">
                    {hasOsl ? formatNumber(totals.oslGross) : '-'}
                  </td>
                  <td className="text-right num-cell">
                    {hasOsl ? formatPercent(totals.rasioAll, 2) : '-'}
                  </td>
                  <td className="text-right num-cell">
                    {hasOsl ? formatPercent(totals.rasioOver60, 2) : '-'}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* TABEL 2: PERGERAKAN HARIAN (BJDPL HARI H VS H-1 & DELTA) */}
      {hasBjdplH && hasBjdplH1 && (
        <section className="table-section theme-dark">
          <div className="section-head">
            <div>
              <span className="eyebrow">TABEL 2 • PERGERAKAN HARIAN (H VS H-1)</span>
              <h2 className="section-title">
                Komparasi Posisi BJDPL ({labelDateH1} vs {labelDateH}) & Delta Harian
              </h2>
              <p className="section-desc">
                Menampilkan rincian umur BJDPL Hari H, disandingkan dengan Grand Total BJDPL H-1, Grand Total Hari H, serta selisih (Delta = Hari H dikurangi H-1).
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="col-sticky" onClick={() => toggleSort2('cabang')}>
                    UNIT KERJA (CABANG) {sortConfig2.key === 'cabang' ? (sortConfig2.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th colSpan={AGE_BUCKETS.length} className="text-center group-header">
                    UMUR BJDPL / MDPL ({labelDateH})
                  </th>
                  <th rowSpan={2} className="text-right" onClick={() => toggleSort2('grandTotalH1')}>
                    GRAND TOTAL H-1 ({labelDateH1}) {sortConfig2.key === 'grandTotalH1' ? (sortConfig2.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th rowSpan={2} className="text-right" onClick={() => toggleSort2('grandTotalH')}>
                    GRAND TOTAL HARI H ({labelDateH}) {sortConfig2.key === 'grandTotalH' ? (sortConfig2.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th rowSpan={2} className="text-right" onClick={() => toggleSort2('delta')}>
                    DELTA (H - H-1) {sortConfig2.key === 'delta' ? (sortConfig2.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                </tr>
                <tr>
                  {AGE_BUCKETS.map((b) => (
                    <th
                      key={b.key}
                      className="text-right sub-header"
                      onClick={() => toggleSort2(b.key)}
                    >
                      {b.shortLabel} {sortConfig2.key === b.key ? (sortConfig2.dir === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTable2.map((row) => {
                  const deltaClass =
                    row.delta > 0 ? 'delta-up' : row.delta < 0 ? 'delta-down' : 'delta-flat';
                  return (
                    <tr
                      key={row.cabang}
                      className="clickable-row"
                      onClick={() => onSelectCabang(row.cabang)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectCabang(row.cabang);
                        }
                      }}
                    >
                      <td className="col-sticky font-semibold">
                        <div className="entity-cell">
                          <span className="entity-name">{row.cabang}</span>
                          <span className="entity-area">{row.area}</span>
                        </div>
                      </td>
                      {AGE_BUCKETS.map((b) => (
                        <td key={b.key} className="text-right num-cell">
                          {formatNumber(row.bucketsH[b.key])}
                        </td>
                      ))}
                      <td className="text-right num-cell font-semibold">
                        {formatNumber(row.grandTotalH1)}
                      </td>
                      <td className="text-right num-cell font-bold cell-total">
                        {formatNumber(row.grandTotalH)}
                      </td>
                      <td className={`text-right num-cell font-bold ${deltaClass}`}>
                        {row.delta > 0 ? '+' : ''}
                        {formatNumber(row.delta)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="grand-total-row">
                  <td className="col-sticky">GRAND TOTAL</td>
                  {AGE_BUCKETS.map((b) => (
                    <td key={b.key} className="text-right num-cell">
                      {formatNumber(totals.bucketsH[b.key])}
                    </td>
                  ))}
                  <td className="text-right num-cell">{formatNumber(totals.grandTotalH1)}</td>
                  <td className="text-right num-cell">{formatNumber(totals.grandTotalH)}</td>
                  <td
                    className={`text-right num-cell ${
                      totals.delta > 0 ? 'delta-up' : totals.delta < 0 ? 'delta-down' : ''
                    }`}
                  >
                    {totals.delta > 0 ? '+' : ''}
                    {formatNumber(totals.delta)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* TABEL 3: TABEL BAWAH (REKAPITULASI PER AREA & PER PRODUK) */}
      {hasBjdplH && (
        <section className="table-section theme-light">
          <div className="section-head">
            <div>
              <span className="eyebrow">TABEL 3 • REKAPITULASI BAWAH (AREA & PRODUK)</span>
              <h2 className="section-title">
                Rekapitulasi BJDPL Berdasarkan Area & Produk ({labelDateH})
              </h2>
              <p className="section-desc">
                Ringkasan eksekutif distribusi umur BJDPL per Area Kerja dan per Sub-Produk (KCA, Flexi, Tabungan Emas, Krasida, dll.).
              </p>
            </div>
          </div>

          {/* Sub-tabel 3A: Rekap per Area */}
          <h3 className="subtable-heading">A. Rekapitulasi per Area Kerja</h3>
          <div className="table-responsive" style={{ marginBottom: '2rem' }}>
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="col-sticky">AREA KERJA</th>
                  <th colSpan={AGE_BUCKETS.length} className="text-center group-header">
                    UMUR BJDPL / MDPL
                  </th>
                  <th rowSpan={2} className="text-right">GRAND TOTAL HARI H</th>
                  {hasBjdplH1 && <th rowSpan={2} className="text-right">GRAND TOTAL H-1</th>}
                  {hasBjdplH1 && <th rowSpan={2} className="text-right">DELTA HARIAN</th>}
                  {hasOsl && <th rowSpan={2} className="text-right">OSL GROSS</th>}
                  {hasOsl && <th rowSpan={2} className="text-right">RASIO ALL BJDPL</th>}
                  {hasOsl && <th rowSpan={2} className="text-right">RASIO &gt; 60 HARI</th>}
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
                {tableThreeStats.byArea.map((row) => (
                  <tr key={row.key}>
                    <td className="col-sticky font-bold">{row.label}</td>
                    {AGE_BUCKETS.map((b) => (
                      <td key={b.key} className="text-right num-cell">
                        {formatNumber(row.bucketsH[b.key])}
                      </td>
                    ))}
                    <td className="text-right num-cell font-bold cell-total">
                      {formatNumber(row.grandTotalH)}
                    </td>
                    {hasBjdplH1 && (
                      <td className="text-right num-cell">{formatNumber(row.grandTotalH1)}</td>
                    )}
                    {hasBjdplH1 && (
                      <td
                        className={`text-right num-cell font-bold ${
                          row.deltaH > 0 ? 'delta-up' : row.deltaH < 0 ? 'delta-down' : ''
                        }`}
                      >
                        {row.deltaH > 0 ? '+' : ''}
                        {formatNumber(row.deltaH)}
                      </td>
                    )}
                    {hasOsl && (
                      <td className="text-right num-cell">{formatNumber(row.oslGross)}</td>
                    )}
                    {hasOsl && (
                      <td className="text-right num-cell font-semibold">
                        {formatPercent(row.rasioAll, 2)}
                      </td>
                    )}
                    {hasOsl && (
                      <td className="text-right num-cell font-semibold">
                        {formatPercent(row.rasioOver60, 2)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="grand-total-row">
                  <td className="col-sticky">TOTAL KANWIL / TERFILTER</td>
                  {AGE_BUCKETS.map((b) => (
                    <td key={b.key} className="text-right num-cell">
                      {formatNumber(totals.bucketsH[b.key])}
                    </td>
                  ))}
                  <td className="text-right num-cell">{formatNumber(totals.grandTotalH)}</td>
                  {hasBjdplH1 && (
                    <td className="text-right num-cell">{formatNumber(totals.grandTotalH1)}</td>
                  )}
                  {hasBjdplH1 && (
                    <td className="text-right num-cell">
                      {totals.delta > 0 ? '+' : ''}
                      {formatNumber(totals.delta)}
                    </td>
                  )}
                  {hasOsl && (
                    <td className="text-right num-cell">{formatNumber(totals.oslGross)}</td>
                  )}
                  {hasOsl && (
                    <td className="text-right num-cell">{formatPercent(totals.rasioAll, 2)}</td>
                  )}
                  {hasOsl && (
                    <td className="text-right num-cell">{formatPercent(totals.rasioOver60, 2)}</td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Sub-tabel 3B: Rekap per Produk */}
          <h3 className="subtable-heading">B. Rekapitulasi per Produk (SUB PRODUCT NM)</h3>
          <div className="table-responsive">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="col-sticky">NAMA PRODUK</th>
                  <th colSpan={AGE_BUCKETS.length} className="text-center group-header">
                    UMUR BJDPL / MDPL
                  </th>
                  <th rowSpan={2} className="text-right">GRAND TOTAL HARI H</th>
                  {hasBjdplH1 && <th rowSpan={2} className="text-right">GRAND TOTAL H-1</th>}
                  {hasBjdplH1 && <th rowSpan={2} className="text-right">DELTA HARIAN</th>}
                  <th rowSpan={2} className="text-right">UMUR &gt; 60 HARI</th>
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
                {tableThreeStats.byProduct.map((row) => (
                  <tr key={row.key}>
                    <td className="col-sticky font-bold">{row.label}</td>
                    {AGE_BUCKETS.map((b) => (
                      <td key={b.key} className="text-right num-cell">
                        {formatNumber(row.bucketsH[b.key])}
                      </td>
                    ))}
                    <td className="text-right num-cell font-bold cell-total">
                      {formatNumber(row.grandTotalH)}
                    </td>
                    {hasBjdplH1 && (
                      <td className="text-right num-cell">{formatNumber(row.grandTotalH1)}</td>
                    )}
                    {hasBjdplH1 && (
                      <td
                        className={`text-right num-cell font-bold ${
                          row.deltaH > 0 ? 'delta-up' : row.deltaH < 0 ? 'delta-down' : ''
                        }`}
                      >
                        {row.deltaH > 0 ? '+' : ''}
                        {formatNumber(row.deltaH)}
                      </td>
                    )}
                    <td className="text-right num-cell font-semibold">
                      {formatNumber(row.over60H)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="grand-total-row">
                  <td className="col-sticky">TOTAL SELURUH PRODUK</td>
                  {AGE_BUCKETS.map((b) => (
                    <td key={b.key} className="text-right num-cell">
                      {formatNumber(totals.bucketsH[b.key])}
                    </td>
                  ))}
                  <td className="text-right num-cell">{formatNumber(totals.grandTotalH)}</td>
                  {hasBjdplH1 && (
                    <td className="text-right num-cell">{formatNumber(totals.grandTotalH1)}</td>
                  )}
                  {hasBjdplH1 && (
                    <td className="text-right num-cell">
                      {totals.delta > 0 ? '+' : ''}
                      {formatNumber(totals.delta)}
                    </td>
                  )}
                  <td className="text-right num-cell">{formatNumber(totals.over60H)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

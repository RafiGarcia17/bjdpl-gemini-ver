import React from 'react';
import { formatDateID } from '../utils/format.js';

export default function FilterBar({
  areas = [],
  selectedArea,
  onChangeArea,
  searchQuery,
  onChangeSearch,
  dateH,
  dateH1,
  onPrint,
  onResetAll,
}) {
  return (
    <div className="filter-bar no-print">
      <div className="filter-group">
        <div className="filter-field">
          <label htmlFor="area-select">Filter AREA</label>
          <select
            id="area-select"
            value={selectedArea}
            onChange={(e) => onChangeArea(e.target.value)}
          >
            <option value="ALL">Semua Area ({areas.length} Area)</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="cabang-search">Cari Unit Kerja / Cabang</label>
          <input
            id="cabang-search"
            type="text"
            placeholder="Ketik nama atau kode cabang..."
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-meta-actions">
        <div className="date-pills">
          {dateH1 && (
            <span className="date-pill">
              Posisi H-1: <strong>{formatDateID(dateH1)}</strong>
            </span>
          )}
          {dateH && (
            <span className="date-pill pill-primary">
              Posisi Hari H: <strong>{formatDateID(dateH)}</strong>
            </span>
          )}
        </div>

        <div className="action-buttons">
          <button type="button" className="btn-outline" onClick={onResetAll}>
            Reset Data
          </button>
          <button type="button" className="btn-primary" onClick={onPrint}>
            Cetak / PDF
          </button>
        </div>
      </div>
    </div>
  );
}

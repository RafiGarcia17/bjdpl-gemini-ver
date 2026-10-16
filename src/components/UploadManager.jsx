import React from 'react';
import { readExcelBuffer } from '../utils/fileReader.js';
import { parseBjdplRows, parseOslRows } from '../utils/parseBjdpl.js';
import { formatDateID } from '../utils/format.js';

const UPLOAD_CATEGORIES = [
  {
    id: 'bjdplH',
    title: '1. Data BJDPL Hari H',
    subtitle: 'Contoh: 14-10-2026_Unduh Data BJDPL (UP).xlsx',
    requiredHint: 'Kolom: AREA, CABANG, UMUR BJDPL, BJDPL BULAN INI',
    parser: parseBjdplRows,
  },
  {
    id: 'bjdplH1',
    title: '2. Data BJDPL H-1',
    subtitle: 'Contoh: 13-10-2026_Unduh Data BJDPL (UP).xlsx',
    requiredHint: 'Kolom: AREA, CABANG, UMUR BJDPL, BJDPL BULAN INI',
    parser: parseBjdplRows,
  },
  {
    id: 'oslGross',
    title: '3. Data OSL Gross',
    subtitle: 'Contoh: 14-10-2026_OSL_POSISI_DETAIL_...xlsx',
    requiredHint: 'Kolom: AREA, CABANG, OSL_BULAN_INI_THNINI',
    parser: parseOslRows,
  },
];

export default function UploadManager({ datasets, onUpdateDataset, onLoadDemo }) {
  const handleFileChange = (cat, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const { headers, rows } = readExcelBuffer(buffer);
        if (rows.length === 0) {
          onUpdateDataset(cat.id, {
            rows: [],
            skipped: 0,
            name: file.name,
            fileDate: null,
            error: 'File Excel kosong atau tidak memiliki baris data.',
          });
          return;
        }
        const parsed = cat.parser(headers, rows, file.name);
        onUpdateDataset(cat.id, {
          rows: parsed.data,
          skipped: parsed.skipped,
          name: file.name,
          fileDate: parsed.fileDate,
          error: parsed.error,
        });
      } catch (err) {
        onUpdateDataset(cat.id, {
          rows: [],
          skipped: 0,
          name: file.name,
          fileDate: null,
          error: 'Gagal membaca file Excel. Pastikan format file adalah .xlsx atau .xls yang valid.',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <section className="upload-section no-print">
      <div className="upload-section-header">
        <div>
          <span className="eyebrow">INPUT DATA HARIAN</span>
          <h2 className="section-title">Upload File Monitoring BJDPL & OSL</h2>
          <p className="section-desc">
            Unggah ketiga file Excel di bawah ini. Nama file dengan format{' '}
            <code>DD-MM-YYYY_Namafile.xlsx</code> akan otomatis terbaca tanggal posisinya.
          </p>
        </div>
        {onLoadDemo && (
          <button type="button" className="btn-secondary" onClick={onLoadDemo}>
            Muat Data Contoh (Demo)
          </button>
        )}
      </div>

      <div className="upload-grid">
        {UPLOAD_CATEGORIES.map((cat) => {
          const current = datasets[cat.id];
          const hasData = current && !current.error && current.rows && current.rows.length > 0;
          return (
            <div
              key={cat.id}
              className={`upload-card ${hasData ? 'is-loaded' : ''} ${current?.error ? 'is-error' : ''}`}
            >
              <div className="upload-card-top">
                <span className="upload-badge">
                  {hasData ? 'TERUPLOAD' : current?.error ? 'ERROR' : 'BELUM UPLOAD'}
                </span>
                {current?.fileDate && (
                  <span className="upload-date-chip">
                    Tanggal: {formatDateID(current.fileDate)}
                  </span>
                )}
              </div>

              <h3 className="upload-title">{cat.title}</h3>
              <p className="upload-subtitle">{cat.subtitle}</p>
              <p className="upload-hint">{cat.requiredHint}</p>

              <label className="upload-dropzone">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(cat, f);
                    e.target.value = '';
                  }}
                />
                <span className="dropzone-cta">
                  {hasData ? 'Ganti File Excel (.xlsx)' : 'Pilih / Tarik File Excel (.xlsx)'}
                </span>
              </label>

              {hasData && (
                <div className="upload-status-ok">
                  <strong>{current.name}</strong> — {current.rows.length} baris valid
                  {current.skipped > 0 && (
                    <span className="upload-warning"> ({current.skipped} baris di-skip)</span>
                  )}
                </div>
              )}

              {current?.error && (
                <div className="upload-status-err">
                  <strong>Gagal:</strong> {current.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

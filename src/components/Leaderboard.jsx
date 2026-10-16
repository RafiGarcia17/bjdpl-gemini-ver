import React from 'react';
import { formatNumber, formatPercent } from '../utils/format.js';

export default function Leaderboard({ rows = [], onSelectCabang }) {
  if (!rows || rows.length === 0) return null;

  // Urutkan Cabang berdasarkan Rasio ALL BJDPL terendah (terbaik) yang memiliki OSL > 0,
  // atau jika OSL belum diupload, berdasarkan penurunan Delta terbaik / BJDPL terendah
  const hasOsl = rows.some((r) => r.oslGross > 0);
  const sorted = [...rows]
    .sort((a, b) => {
      if (hasOsl) {
        if (a.rasioAll !== b.rasioAll) return a.rasioAll - b.rasioAll;
      }
      return a.grandTotalH - b.grandTotalH;
    })
    .slice(0, 6);

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-header">
        <div>
          <span className="eyebrow">KINERJA TERBAIK</span>
          <h3 className="card-title">Top Kualitas Portofolio Cabang (Rasio BJDPL Terendah)</h3>
        </div>
      </div>
      <div className="leaderboard-grid">
        {sorted.map((item, idx) => {
          const rank = idx + 1;
          const badgeClass =
            rank === 1 ? 'badge-gold' : rank === 2 ? 'badge-silver' : rank === 3 ? 'badge-bronze' : 'badge-default';
          return (
            <div
              key={item.cabang}
              className="leaderboard-item clickable-row"
              onClick={() => onSelectCabang && onSelectCabang(item.cabang)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCabang && onSelectCabang(item.cabang);
                }
              }}
            >
              <div className={`rank-badge ${badgeClass}`}>
                {rank <= 3 ? `Juara ${rank}` : `#${rank}`}
              </div>
              <div className="leaderboard-info">
                <div className="leaderboard-name">{item.cabang}</div>
                <div className="leaderboard-sub">{item.area}</div>
              </div>
              <div className="leaderboard-metric">
                <div className="metric-primary">
                  {hasOsl ? formatPercent(item.rasioAll, 2) : `Rp ${formatNumber(item.grandTotalH)}`}
                </div>
                <div className="metric-secondary">
                  {hasOsl ? `BJDPL: Rp ${formatNumber(item.grandTotalH)}` : 'Total BJDPL'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

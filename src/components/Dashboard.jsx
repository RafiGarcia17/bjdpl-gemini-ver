import React from 'react';
import BjdplSection from './BjdplSection.jsx';

export default function Dashboard({
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
  // Sesuai aturan arsitektur: Section yang datanya belum diupload tidak dirender sama sekali
  if (!hasBjdplH && !hasBjdplH1 && !hasOsl) {
    return null;
  }

  return (
    <main className="dashboard-main">
      <BjdplSection
        cabangStats={cabangStats}
        tableThreeStats={tableThreeStats}
        hasBjdplH={hasBjdplH}
        hasBjdplH1={hasBjdplH1}
        hasOsl={hasOsl}
        dateH={dateH}
        dateH1={dateH1}
        selectedArea={selectedArea}
        searchQuery={searchQuery}
        onSelectCabang={onSelectCabang}
      />
    </main>
  );
}

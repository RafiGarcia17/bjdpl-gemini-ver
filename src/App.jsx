import React, { useState, useMemo, useEffect } from 'react';
import UploadManager from './components/UploadManager.jsx';
import FilterBar from './components/FilterBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import BjdplDetailPage from './components/BjdplDetailPage.jsx';
import {
  extractAvailableAreas,
  aggregateByCabang,
  aggregateTableThree,
} from './utils/aggregateBjdpl.js';
import { parseFlexibleDate } from './utils/format.js';

function parseHash(hashStr) {
  const clean = (hashStr || '').replace(/^#/, '');
  if (!clean || clean === '/') {
    return { type: 'dashboard' };
  }
  if (clean.startsWith('cabang/')) {
    const key = decodeURIComponent(clean.slice('cabang/'.length));
    if (key) return { type: 'detail', key };
  }
  return { type: 'dashboard' };
}

function viewToHash(view) {
  if (!view || view.type === 'dashboard') return '#/';
  if (view.type === 'detail' && view.key) {
    return `#cabang/${encodeURIComponent(view.key)}`;
  }
  return '#/';
}

export default function App() {
  const [datasets, setDatasets] = useState({
    bjdplH: null,
    bjdplH1: null,
    oslGross: null,
  });

  const [selectedArea, setSelectedArea] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => {
      setView(parseHash(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goTo = (nextView) => {
    window.location.hash = viewToHash(nextView);
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateDataset = (catId, payload) => {
    setDatasets((prev) => ({
      ...prev,
      [catId]: payload,
    }));
  };

  const handleResetAll = () => {
    setDatasets({ bjdplH: null, bjdplH1: null, oslGross: null });
    setSelectedArea('ALL');
    setSearchQuery('');
    goTo({ type: 'dashboard' });
  };

  const handleLoadDemo = () => {
    const demoDateH = parseFlexibleDate('14-10-2026');
    const demoDateH1 = parseFlexibleDate('13-10-2026');

    const demoH = [
      {
        kanwil: '16:KANWIL JAKARTA 2',
        area: '00738:AREA TANJUNG PRIUK',
        cabang: '12754:CP TANJUNG PRIOK',
        outlet: '12754:CP TANJUNG PRIOK',
        subProduct: 'GADAI FLEXI',
        product: 'GADAI FLEXI',
        flag: 'KONVEN',
        umurRaw: '1 : 1 sd 15 Hari',
        bucketKey: 'b1',
        bjdplTahunLalu: 10170000,
        bjdplBulanLalu: 40210000,
        bjdplBulanIni: 70490000,
        rpMtm: 30280000,
        persenMtm: 75.3,
        rpYtd: 60320000,
        persenYtd: 593.12,
        date: demoDateH,
      },
      {
        kanwil: '16:KANWIL JAKARTA 2',
        area: '00738:AREA TANJUNG PRIUK',
        cabang: '12754:CP TANJUNG PRIOK',
        outlet: '12754:CP TANJUNG PRIOK',
        subProduct: 'GADAI KCA',
        product: 'GADAI KCA',
        flag: 'KONVEN',
        umurRaw: '1 : 1 sd 15 Hari',
        bucketKey: 'b1',
        bjdplTahunLalu: 158600000,
        bjdplBulanLalu: 2201920000,
        bjdplBulanIni: 1987560000,
        rpMtm: -214360000,
        persenMtm: -9.74,
        rpYtd: 1828960000,
        persenYtd: 1153.19,
        date: demoDateH,
      },
      {
        kanwil: '16:KANWIL JAKARTA 2',
        area: '00738:AREA TANJUNG PRIUK',
        cabang: '12754:CP TANJUNG PRIOK',
        outlet: '12754:CP TANJUNG PRIOK',
        subProduct: 'GADAI TABUNGAN EMAS',
        product: 'GADAI TABUNGAN EMAS',
        flag: 'KONVEN',
        umurRaw: '5 : 61 sd 75 Hari',
        bucketKey: 'b5',
        bjdplTahunLalu: 10990000,
        bjdplBulanLalu: 114080000,
        bjdplBulanIni: 106040000,
        rpMtm: -8040000,
        persenMtm: -7.05,
        rpYtd: 95050000,
        persenYtd: 864.88,
        date: demoDateH,
      },
      {
        kanwil: '16:KANWIL JAKARTA 2',
        area: '00738:AREA TANJUNG PRIUK',
        cabang: '12990:CP GUNUNG SAHARI',
        outlet: '12339:UPC ITC MANGGA DUA',
        subProduct: 'GADAI KCA',
        product: 'GADAI KCA',
        flag: 'KONVEN',
        umurRaw: '2 : 16 sd 30 Hari',
        bucketKey: 'b2',
        bjdplTahunLalu: 45000000,
        bjdplBulanLalu: 310000000,
        bjdplBulanIni: 285000000,
        rpMtm: -25000000,
        persenMtm: -8.06,
        rpYtd: 240000000,
        persenYtd: 533.33,
        date: demoDateH,
      },
      {
        kanwil: '16:KANWIL JAKARTA 2',
        area: '00741:AREA KALIDERES',
        cabang: '12965:CP KEMANDORAN',
        outlet: '12296:UPC SLIPI JAYA',
        subProduct: 'KRASIDA',
        product: 'KRASIDA',
        flag: 'KONVEN',
        umurRaw: '6 : 76 sd 90 Hari',
        bucketKey: 'b6',
        bjdplTahunLalu: 0,
        bjdplBulanLalu: 55000000,
        bjdplBulanIni: 42000000,
        rpMtm: -13000000,
        persenMtm: -23.64,
        rpYtd: 42000000,
        persenYtd: 100,
        date: demoDateH,
      },
    ];

    const demoH1 = [
      {
        ...demoH[0],
        bjdplBulanIni: 70490000,
        date: demoDateH1,
      },
      {
        ...demoH[1],
        bjdplBulanIni: 1992560000,
        date: demoDateH1,
      },
      {
        ...demoH[2],
        bjdplBulanIni: 106040000,
        date: demoDateH1,
      },
      {
        ...demoH[3],
        bjdplBulanIni: 300000000,
        date: demoDateH1,
      },
      {
        ...demoH[4],
        bjdplBulanIni: 48000000,
        date: demoDateH1,
      },
    ];

    const demoOsl = [
      {
        kanwil: '16:KANWIL JAKARTA 2',
        flag: 'KONVEN',
        area: '00738:AREA TANJUNG PRIUK',
        cabang: '12754:CP TANJUNG PRIOK',
        unit: '12754:CP TANJUNG PRIOK',
        grupProduk: 'KCA',
        subProduk: '1101:GADAI KCA',
        segmen: 'GADAI',
        kategoriOsl: 'AKTIF',
        oslTahunLalu: 185000000000,
        oslBulanLalu: 210000000000,
        oslBulanIni: 225000000000,
        date: demoDateH,
      },
      {
        kanwil: '16:KANWIL JAKARTA 2',
        flag: 'KONVEN',
        area: '00738:AREA TANJUNG PRIUK',
        cabang: '12990:CP GUNUNG SAHARI',
        unit: '12339:UPC ITC MANGGA DUA',
        grupProduk: 'KCA',
        subProduk: '1201:GADAI FLEXI',
        segmen: 'GADAI',
        kategoriOsl: 'AKTIF',
        oslTahunLalu: 140000000000,
        oslBulanLalu: 165000000000,
        oslBulanIni: 172000000000,
        date: demoDateH,
      },
      {
        kanwil: '16:KANWIL JAKARTA 2',
        flag: 'KONVEN',
        area: '00741:AREA KALIDERES',
        cabang: '12965:CP KEMANDORAN',
        unit: '12295:UPC KOTABAMBU',
        grupProduk: 'EMAS',
        subProduk: '3701:MULIA ULTIMATE KONVEN',
        segmen: 'GADAI',
        kategoriOsl: 'AKTIF',
        oslTahunLalu: 110000000000,
        oslBulanLalu: 120000000000,
        oslBulanIni: 128000000000,
        date: demoDateH,
      },
    ];

    setDatasets({
      bjdplH: {
        rows: demoH,
        skipped: 0,
        name: '14-10-2026_Unduh Data BJDPL (UP).xlsx',
        fileDate: demoDateH,
        error: null,
      },
      bjdplH1: {
        rows: demoH1,
        skipped: 0,
        name: '13-10-2026_Unduh Data BJDPL (UP).xlsx',
        fileDate: demoDateH1,
        error: null,
      },
      oslGross: {
        rows: demoOsl,
        skipped: 0,
        name: '14-10-2026_OSL_POSISI_DETAIL_14-Oct-26_KANWIL JAKARTA 2_.xlsx',
        fileDate: demoDateH,
        error: null,
      },
    });
  };

  const bjdplHRows = datasets.bjdplH?.rows || [];
  const bjdplH1Rows = datasets.bjdplH1?.rows || [];
  const oslRows = datasets.oslGross?.rows || [];

  const hasBjdplH = bjdplHRows.length > 0;
  const hasBjdplH1 = bjdplH1Rows.length > 0;
  const hasOsl = oslRows.length > 0;
  const hasAnyData = hasBjdplH || hasBjdplH1 || hasOsl;

  const areas = useMemo(
    () => extractAvailableAreas(bjdplHRows, bjdplH1Rows, oslRows),
    [bjdplHRows, bjdplH1Rows, oslRows]
  );

  // Pastikan selectedArea kembali ke ALL bila area sebelumnya tidak ada di file baru
  useEffect(() => {
    if (selectedArea !== 'ALL' && !areas.includes(selectedArea)) {
      setSelectedArea('ALL');
    }
  }, [areas, selectedArea]);

  const cabangStats = useMemo(
    () => aggregateByCabang(bjdplHRows, bjdplH1Rows, oslRows, selectedArea),
    [bjdplHRows, bjdplH1Rows, oslRows, selectedArea]
  );

  const tableThreeStats = useMemo(
    () => aggregateTableThree(bjdplHRows, bjdplH1Rows, oslRows, selectedArea),
    [bjdplHRows, bjdplH1Rows, oslRows, selectedArea]
  );

  const dateH = datasets.bjdplH?.fileDate || datasets.oslGross?.fileDate || null;
  const dateH1 = datasets.bjdplH1?.fileDate || null;

  const renderView = () => {
    if (view.type === 'detail' && view.key && hasAnyData) {
      return (
        <BjdplDetailPage
          cabangKey={view.key}
          bjdplHRows={bjdplHRows}
          bjdplH1Rows={bjdplH1Rows}
          oslRows={oslRows}
          dateH={dateH}
          dateH1={dateH1}
          onBack={() => goTo({ type: 'dashboard' })}
        />
      );
    }

    return (
      <>
        <UploadManager
          datasets={datasets}
          onUpdateDataset={handleUpdateDataset}
          onLoadDemo={handleLoadDemo}
        />

        {hasAnyData && (
          <FilterBar
            areas={areas}
            selectedArea={selectedArea}
            onChangeArea={setSelectedArea}
            searchQuery={searchQuery}
            onChangeSearch={setSearchQuery}
            dateH={dateH}
            dateH1={dateH1}
            onPrint={() => window.print()}
            onResetAll={handleResetAll}
          />
        )}

        <Dashboard
          cabangStats={cabangStats}
          tableThreeStats={tableThreeStats}
          hasBjdplH={hasBjdplH}
          hasBjdplH1={hasBjdplH1}
          hasOsl={hasOsl}
          dateH={dateH}
          dateH1={dateH1}
          selectedArea={selectedArea}
          searchQuery={searchQuery}
          onSelectCabang={(cabangKey) => goTo({ type: 'detail', key: cabangKey })}
        />
      </>
    );
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <div
            className="brand"
            onClick={() => goTo({ type: 'dashboard' })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goTo({ type: 'dashboard' });
              }
            }}
          >
            <div className="brand-logo">MB</div>
            <div className="brand-text">
              <span className="brand-title">MONITORING DAILY BJDPL</span>
              <span className="brand-sub">Dashboard Monitoring Umur BJDPL/MDPL & Rasio OSL Gross</span>
            </div>
          </div>

          <div className="navbar-right no-print">
            <span className="status-chip">100% Client-Side • Aman</span>
          </div>
        </div>
      </header>

      <div className="container">{renderView()}</div>

      <footer className="footer no-print">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} MONITORING DAILY BJDPL</span>
          <span>Data diproses langsung di browser tanpa disimpan ke server</span>
        </div>
      </footer>
    </div>
  );
}

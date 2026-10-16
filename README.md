# MONITORING DAILY BJDPL

Dashboard monitoring harian **Umur BJDPL/MDPL** dan **Rasio terhadap OSL Gross** berbasis upload file Excel (`.xlsx`), berjalan **100% di sisi browser (Client-Side)** tanpa backend dan tanpa menyimpan data ke server. Dirancang siap deploy langsung ke **Vercel**.

---

## Cara Penggunaan
1. Buka halaman web **MONITORING DAILY BJDPL**.
2. Unggah 3 file Excel pada kotak upload yang tersedia:
   - **Data BJDPL Hari H** (contoh: `14-10-2026_Unduh Data BJDPL (UP).xlsx`)
   - **Data BJDPL H-1** (contoh: `13-10-2026_Unduh Data BJDPL (UP).xlsx`)
   - **Data OSL Gross** (contoh: `14-10-2026_OSL_POSISI_DETAIL_14-Oct-26_KANWIL JAKARTA 2_.xlsx`)
   *(Catatan: Tanggal posisi data otomatis dikenali dari awalan nama file berformat `DD-MM-YYYY_Namafile.xlsx`)*.
3. Gunakan **Filter AREA** atau kolom pencarian untuk menyaring Unit Kerja (`CABANG`).
4. Klik pada baris Unit Kerja (`CABANG`) mana pun untuk melihat **Halaman Detail Cabang** (breakdown per Outlet/UPC dan Sub-Produk).
5. Klik tombol **Cetak / PDF** untuk mencetak laporan dalam orientasi *landscape* yang rapi.

---

## Daftar Kolom Excel yang Dikenali

### 1. File BJDPL Hari H & BJDPL H-1
- **Kolom Wajib**:
  - `AREA`
  - `CABANG`
  - `UMUR BJDPL` (dikenali otomatis untuk subkolom `1 : 1 sd 15 Hari` s/d `7 : > 90 Hari`)
  - `BJDPL BULAN INI`
- **Kolom Opsional (Pendukung Detail & Rekap)**:
  - `KANWIL`, `OUTLET`, `SUB PRODUCT NM`, `PRODUCT`, `FLAG`, `BJDPL AKHIR TAHUN LALU`, `BJDPL AKHIR BULAN LALU`, `RP MTM`, `PERSEN MTM`, `RP YTD`, `PERSEN YTD`

### 2. File OSL Gross
- **Kolom Wajib**:
  - `AREA`
  - `CABANG`
  - `OSL_BULAN_INI_THNINI`
- **Kolom Opsional**:
  - `KANWIL`, `FLAG`, `UNIT`, `GRUP_PRODUK`, `SUB_PRODUK`, `SEGMEN`, `KATEGORI_OSL`, `OSL_AKHIR_TAHUN_THNLALU`, `OSL_BULAN_LALU_THNINI`

---

## Struktur Tabel Output
1. **Tabel 1 (Monitoring Posisi BJDPL & Rasio OSL)**:
   - Menampilkan Unit Kerja (`CABANG`), distribusi Umur BJDPL/MDPL (Subkolom 1 s/d 7), `Grand Total BJDPL`, `OSL`, `Rasio ALL BJDPL` (`Grand Total / OSL`), dan `Rasio Diatas 60 Hari` (`(Subkolom 5 + 6 + 7) / OSL`).
2. **Tabel 2 (Komparasi H vs H-1 & Delta)**:
   - Menampilkan distribusi Umur BJDPL Hari H per `CABANG`, disandingkan dengan `Grand Total BJDPL H-1`, `Grand Total BJDPL Hari H`, dan `Delta` (`Grand Total Hari H - Grand Total H-1`).
3. **Tabel 3 (Rekapitulasi Bawah per Area & per Produk)**:
   - Menampilkan rekapitulasi umur BJDPL, perbandingan H vs H-1, dan rasio OSL yang dikelompokkan berdasarkan **Area Kerja** serta berdasarkan **Produk (`SUB PRODUCT NM`)**.

---

## Cara Deploy ke Vercel (Tanpa Instal Aplikasi di Laptop)
1. Ekstrak file ZIP ini dan unggah seluruh isinya ke repository **GitHub** Anda.
2. Buka **Vercel**, pilih **Add New Project**, lalu hubungkan ke repository GitHub tersebut.
3. Klik **Deploy** — Vercel akan otomatis mendeteksi konfigurasi **Vite** dan mem-build aplikasi hingga siap diakses online.

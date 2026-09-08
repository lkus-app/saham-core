# IDX Core Stock Database & Valuation Terminal 📈

Dashboard interaktif untuk database saham core IHSG (Indonesian Stock Exchange) yang terhubung dengan **Google Apps Script & Google Sheets**, dirancang khusus untuk siap di-push ke **GitHub** dan di-deploy ke **Vercel** dengan 1 klik!

![IDX Core Stock Database Preview](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop)

---

## ✨ Fitur Utama

- **🚀 Terhubung ke Google Apps Script (Project `1uQf_jxtD-s4Jt6SQrJnba9lZua8BrCbNuosY0g2aXZare3cn6liv-IvB`)**:
  - Mendukung penarikan data langsung (Pull) dan penyimpanan kembali (Push) dari/ke Google Sheets.
  - Template script `Code.gs` siap salin di dalam aplikasi.
- **📊 4 Mode Tampilan Interaktif**:
  1. **Tabel Analisis**: Tampilan terminal lengkap dengan metrik Margin of Safety (MOS), PER, PBV, ROE, Dividend Yield, Buy Zone, dan Rekomendasi.
  2. **Kartu Visual**: Kartu visual dengan grafik slider harga sekarang vs nilai wajar (Fair Value).
  3. **Grup Sektor**: Pengelompokan saham per industri (Perbankan, Barang Konsumsi, Energi, Telko, Kesehatan, dll).
  4. **Matriks Valuasi 2D (Bargain Champions)**: Kuadran strategi ROE vs Margin of Safety untuk menemukan saham berkualitas diskon.
- **🧮 Kalkulator Valuasi Terintegrasi**:
  - *Graham Number Calculator*: $\sqrt{22.5 \times EPS \times BVPS}$
  - *P/E Multiple Band*: Menghitung target harga berdasarkan rerata historis PE.
  - *Target Yield Dividen*: Menghitung harga beli maksimal untuk mengunci yield yang diinginkan.
- **💰 Simulasi Dividen Kas**:
  - Kalkulator pasif income dividen per tahun dan per bulan berdasarkan kepemilikan lot saham.
- **💾 Dual Storage**:
  - Berjalan offline dan otomatis menyimpan di browser (`localStorage`).
  - Ekspor/Impor data ke format **CSV (Excel)** dan **JSON**.

---

## 🛠️ Cara Push ke GitHub

Jalankan perintah berikut di terminal:

```bash
# 1. Inisialisasi git
git init

# 2. Tambahkan semua file
git add .

# 3. Buat commit pertama
git commit -m "feat: initial commit idx core stocks database"

# 4. Ubah branch ke main
git branch -M main

# 5. Hubungkan ke repository GitHub Anda
git remote add origin https://github.com/USERNAME/NAMA-REPO-ANDA.git

# 6. Push kode ke GitHub
git push -u origin main
```

---

## ⚡ Cara Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** &gt; pilih **"Project"**.
3. Import repository GitHub yang baru saja Anda push.
4. Vercel akan mendeteksi framework **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - File `vercel.json` sudah disediakan untuk menangani SPA routing.
5. Klik **"Deploy"**. Selesai dalam ~30 detik!

---

## 📝 Setup Google Apps Script (`Code.gs`)

1. Buka project script Anda di [Google Apps Script Editor](https://script.google.com/u/0/home/projects/1uQf_jxtD-s4Jt6SQrJnba9lZua8BrCbNuosY0g2aXZare3cn6liv-IvB/edit).
2. Salin kode yang tersedia pada menu **Google Script > Tab Kode Google Script** di dalam aplikasi ini.
3. Klik tombol biru **Deploy** &gt; **New deployment**.
4. Pilih tipe **Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone** (wajib agar API dapat dibaca aplikasi web)
5. Klik **Deploy** dan salin URL Web app yang berakhiran `/exec`.
6. Tempelkan ke aplikasi di modal pengaturan Google Script.

---

Dibuat dengan React 19, Vite, TypeScript, dan Tailwind CSS.

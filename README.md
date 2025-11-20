# Steam Profile Showcase

Tampilan profil Steam yang dibangun dengan Next.js 15 dan Tailwind CSS. Aplikasi ini mengambil data profil, koleksi gim, dan achievement langsung dari Steam API. Jika API tidak tersedia, data contoh tetap ditampilkan sehingga halaman selalu informatif.

## Fitur
- **Statistik profil**: ringkasan jumlah gim, total achievement, dan estimasi jam bermain.
- **Kartu gim teratas**: menampilkan gim favorit lengkap dengan 3 achievement terbaik dan waktu bermain.
- **Bio & ajakan berteman**: profil singkat serta tombol untuk langsung membuka laman Steam.
- **Fallback data**: konten cadangan otomatis ditampilkan bila API key atau koneksi jaringan belum tersedia.
- **Desain responsif**: tata letak adaptif untuk mobile hingga desktop dengan gaya glassmorphism yang ringan.

## Prasyarat
- Node.js 20 atau lebih baru.
- Akun Steam dengan **Steam API Key** aktif.
- **Steam ID 64** milik pengguna yang ingin ditampilkan.

## Konfigurasi Lingkungan
Buat berkas `.env.local` di akar proyek dan isikan:

```bash
STEAM_API_KEY=masukkan_api_key_anda
STEAM_ID=masukkan_steam_id_anda
```

> **Catatan:** Jangan pernah menaruh API key langsung di kode sumber. Aplikasi ini otomatis memakai data contoh bila variabel lingkungan tidak diisi atau Steam API sedang bermasalah.

## Menjalankan Secara Lokal
1. **Instal dependensi**
   ```bash
   npm install
   ```

2. **Jalankan pengembangan**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` untuk melihat hasilnya.

3. **Build produksi (opsional)**
   ```bash
   npm run build
   npm start
   ```

## Struktur Proyek
- `src/app/page.js` – komponen utama yang memuat profil, statistik gim, dan kartu achievement.
- `src/app/layout.js` – kerangka dasar halaman dan inisialisasi font global.
- `src/app/globals.css` – gaya global dan import Tailwind CSS.
- `public/` – aset statis.
- `next.config.mjs` – konfigurasi Next.js termasuk domain gambar yang diizinkan.

## Catatan Pengembangan
- Fetching data dilakukan di sisi server dengan penanganan error sehingga halaman tetap ter-render walaupun API gagal.
- Jumlah gim yang diambil dibatasi agar responsif dan mengurangi latensi. Silakan sesuaikan logika pemilihan gim di `page.js` sesuai kebutuhan.
- Gunakan `npm run lint` untuk memastikan kode tetap sesuai standar.

Selamat bereksperimen dan semoga halaman profil Anda semakin menarik!

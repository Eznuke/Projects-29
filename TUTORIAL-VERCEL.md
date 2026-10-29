# Tutorial: Pasang Portal Kelas di Vercel (untuk pemula)

Tidak perlu bisa coding dan tidak perlu bayar. Yang kamu butuhkan hanya HP atau laptop, internet, dan email. Tampilan Vercel dan GitHub kadang berubah, kalau nama tombol sedikit berbeda, cari yang paling mirip.

Urutannya: **GitHub (tempat simpan file) → Vercel (tempat website online)**.

---

## Bagian 1. Siapkan file

Download semua file template. Susunannya harus seperti ini:

```
index.html
README.md
api/
   chat.js
   wall.js
```

Aturan penting, banyak error berasal dari sini:
- `index.html` harus di paling luar, bukan di dalam folder lain.
- Folder harus bernama `api` dengan huruf kecil semua (bukan `Api`).
- Nama file `index.html` tidak boleh diganti.

Kalau tidak butuh asisten AI dan Dinding Pesan bersama, file di folder `api` boleh tidak dipakai, website utama tetap jalan.

---

## Bagian 2. Edit data kelas

Sebelum diupload, ganti dulu isinya (bisa juga nanti):

1. Buka `index.html` dengan Notepad atau editor teks apa saja.
2. Cari tulisan `const BRAND`. Ganti nama kelas, tahun ajaran, jumlah siswa, dan sekolah.
3. Ganti jadwal (`JADWAL`), piket (`PIKET`), dan struktur kelas (`ORG_WALI`, `ORG_LEAD`, `ORG_TIM`, `ORG_KOOR`).
4. Simpan.

Panduan lengkapnya ada di `README.md`.

---

## Bagian 3. Buat akun GitHub dan upload file

1. Buka **github.com**, klik **Sign up**, lalu daftar dengan email.
2. Setelah masuk, klik tanda **+** di kanan atas, pilih **New repository**.
3. Isi:
   - **Repository name**: bebas, misalnya `portal-kelas`
   - Pilih **Public** atau **Private**. Private lebih aman, Vercel tetap bisa memakainya.
4. Klik **Create repository**.
5. Di halaman repo yang baru, klik tulisan **uploading an existing file**.
6. Tarik (drag) file `index.html` dan `README.md` ke kotak upload.
7. Untuk folder `api`: tarik folder `api` itu langsung ke kotak upload, supaya isinya ikut dan nama foldernya tetap. Kalau browser tidak bisa menarik folder, lihat bagian "Kalau folder api tidak bisa diupload" di bawah.
8. Scroll ke bawah, klik **Commit changes**.

Cek hasilnya: di halaman repo harus terlihat `index.html` dan folder `api` di daftar paling atas.

### Kalau folder api tidak bisa diupload (biasanya di HP)

1. Di halaman repo klik **Add file → Create new file**.
2. Di kolom nama ketik `api/chat.js`. Ketika kamu mengetik tanda `/`, GitHub otomatis membuat folder `api`.
3. Tempel isi file `chat.js` ke kotak di bawahnya.
4. Klik **Commit changes**.
5. Ulangi untuk `api/wall.js`.

---

## Bagian 4. Hubungkan ke Vercel

1. Buka **vercel.com**, klik **Sign Up**, lalu pilih **Continue with GitHub**. Izinkan akses jika diminta.
2. Setelah masuk, klik **Add New → Project**.
3. Cari repository `portal-kelas` di daftar, klik **Import**. Kalau repo tidak muncul, klik tulisan untuk mengatur akses GitHub (Adjust GitHub App Permissions), lalu izinkan repo itu.
4. Di halaman pengaturan, **biarkan semuanya default**. Jangan mengubah Framework, Build Command, atau Output Directory.
5. Klik **Deploy**.
6. Tunggu sekitar satu menit sampai muncul tulisan selamat dan gambar tampilan website.
7. Klik gambarnya atau tombol **Visit**. Itulah alamat websitemu, bentuknya `nama-project.vercel.app`.

Selesai untuk versi dasar.

---

## Bagian 5. Mengubah isi website di kemudian hari

Tidak perlu deploy ulang secara manual. Setiap file di GitHub berubah, Vercel otomatis memperbarui website dalam satu sampai dua menit.

Cara mengganti file di GitHub:
1. Buka repo, klik file `index.html`.
2. Klik ikon pensil (**Edit this file**) untuk edit langsung, atau pakai **Add file → Upload files** dan upload file baru dengan nama yang sama.
3. Klik **Commit changes**.
4. Tunggu satu sampai dua menit, lalu refresh website.

Kalau website tidak berubah: tekan refresh keras (di HP, buka lewat tab incognito), dan cek tab **Deployments** di Vercel apakah ada tanda error.

---

## Bagian 6. Aktifkan asisten AI (opsional)

1. Buka **console.groq.com**, daftar, lalu buat **API Key**. Salin kuncinya.
2. Di Vercel, buka project kamu, lalu **Settings → Environment Variables**.
3. Isi:
   - **Key**: `GROQ_API_KEY`
   - **Value**: tempel API key tadi
4. Klik **Save**.
5. Buka tab **Deployments**, klik titik tiga di deployment paling atas, pilih **Redeploy**. Variabel baru hanya terbaca setelah redeploy.

Tes: buka `https://alamat-websitemu.vercel.app/api/chat`. Kalau muncul `{"error":"method"}`, berarti sudah benar. Setelah itu coba chat di website.

Jangan menulis API key di dalam file `chat.js` lalu mengupload ke GitHub, apalagi kalau repo Public. Key bisa dicuri orang. Pakai Environment Variable seperti di atas.

---

## Bagian 7. Aktifkan Dinding Pesan bersama (opsional)

Tanpa ini, pesan di dinding hanya terlihat di perangkat yang menulisnya.

1. Di Vercel, buka project, lalu tab **Storage**.
2. Pilih **Upstash** (Redis) dari daftar Marketplace, lalu buat database dengan paket **Free**.
3. Hubungkan ke project kamu (**Connect Project**). Variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` otomatis terisi.
4. **Redeploy** seperti di Bagian 6.

Opsional, tambahkan di Environment Variables:
- `DISCORD_WEBHOOK`: link webhook Discord untuk notifikasi pesan baru
- `ADMIN_KEY`: kata sandi bebas, agar notifikasi memuat link hapus cepat

---

## Masalah umum

| Masalah | Penyebab dan solusi |
| --- | --- |
| Website 404 (NOT_FOUND) | `index.html` tidak di folder paling luar, atau namanya bukan `index.html` |
| Chat: "Asisten AI belum bisa dihubungi [kode 404]" | Folder `api` salah nama (misalnya `Api`) atau `chat.js` tidak ada di dalamnya. Perbaiki lalu tunggu deploy ulang |
| `/api/chat` menampilkan error 500 | `GROQ_API_KEY` belum diisi, atau belum Redeploy setelah mengisinya |
| Dinding pesan tidak sama di HP lain | Upstash belum dihubungkan, atau belum Redeploy |
| Perubahan tidak muncul | Tunggu 1-2 menit, refresh keras, dan cek tab **Deployments** apakah statusnya Ready |
| Foto galeri tidak muncul | Pastikan link gambar bisa dibuka langsung dan diawali `https://` |

---

## Ingin pakai domain sendiri?

Di Vercel buka **Settings → Domains**. Alamat gratis `.vercel.app` sudah cukup untuk kebanyakan kelas. Domain sendiri berbayar dan harus dibeli di penyedia domain.

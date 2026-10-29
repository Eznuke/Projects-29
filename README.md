# Portal Kelas

Website kelas satu file (HTML + CSS + JavaScript, tanpa framework). Bisa dipakai kelas mana saja: tinggal ganti nama kelas, jadwal, piket, dan struktur, lalu deploy gratis di Vercel.

## Fitur

- Kartu kelas, kabar kelas, jadwal pelajaran dan petugas piket
- Struktur kelas (kartu ID, wali kelas di atas, tombol "Lihat selengkapnya")
- Galeri kelas (sampai 5 halaman) dengan kirim foto lewat Discord
- Dinding Pesan: sticky note anonim, otomatis disaring, tiap orang hanya bisa menghapus pesannya sendiri
- Fitur kelas: Time capsule, Voting, dan Kenalan (kartu perkenalan murid)
- Asisten AI khusus kelas (opsional)
- Nyaman di HP, laptop, dan mode desktop

## Isi folder

```
index.html     -> seluruh website
api/chat.js    -> penghubung ke AI (opsional)
api/wall.js    -> penyimpanan Dinding Pesan bersama (opsional)
README.md      -> file ini
```

Nama folder harus `api` (huruf kecil semua) dan `index.html` harus di folder paling luar, kalau tidak Vercel akan menampilkan 404.

## Langkah cepat

1. Buat repository di GitHub, lalu upload semua file di atas.
2. Buka vercel.com, masuk dengan GitHub, klik **Add New > Project**, pilih repository tadi, lalu **Deploy**.
3. Website langsung online. Fitur AI dan Dinding Pesan bersama butuh pengaturan tambahan di bawah.

## Ganti data kelas

Buka `index.html`, cari bagian konfigurasi di awal script:

```js
const BRAND      = 'Kelasku';      // nama portal di pojok kiri atas
const CLASS_NAME = 'X-1';          // nama kelas
const YEAR       = '2025/2026';    // tahun ajaran
const CLASS_SIZE = '35';           // jumlah siswa
const SCHOOL     = 'Nama Sekolah'; // kosongkan '' kalau tidak mau menampilkan sekolah
const IG_HANDLE  = '';             // contoh: '@kelasku'
const IG_URL     = '';             // link Instagram kelas
const SPOTIFY_EMBED = '';          // link embed playlist Spotify
```

Kosongkan nilai yang tidak dipakai, bagiannya akan otomatis tersembunyi.

Data lain diedit langsung di script:

| Nama | Isi |
| --- | --- |
| `JADWAL` | Jadwal per hari (1 = Senin sampai 5 = Jumat), format `['jam','Mapel']`. Pertahankan kata `ISTIRAHAT` dan `ISHOMA` agar asisten AI paham jam istirahat |
| `PIKET` | Daftar nama petugas piket tiap hari |
| `ORG_WALI`, `ORG_LEAD`, `ORG_TIM`, `ORG_KOOR` | Wali kelas, ketua, pengurus, dan koordinator. Isi `n` (nama), `roles` (jabatan), `foto` (link foto, boleh kosong) |
| `KENALAN` | Kartu perkenalan murid |
| `GALERI` | Foto galeri, isi `src` dengan link gambar |

Teks "Kabar kelas" dan "Aturan piket" bisa diubah langsung di bagian HTML.

## Kirim foto dan pesan ke Discord (opsional)

1. Di server Discord, buka **Pengaturan channel > Integrasi > Webhook > Webhook Baru**, lalu salin URL-nya.
2. Tempel ke `WEBHOOK_URL` di `index.html`.

Penting: link webhook yang ada di `index.html` bisa dilihat siapa pun yang membuka website atau repository, dan dipakai orang lain untuk mengirim pesan ke channel kamu. Jangan pakai webhook dari server penting, dan jangan bagikan repository publik dengan webhook asli di dalamnya. Kalau bocor, hapus webhook itu di Discord lalu buat yang baru.

## Asisten AI (opsional)

Memakai Groq API.

1. Buat API key di console.groq.com.
2. Di Vercel: **Settings > Environment Variables**, tambahkan `GROQ_API_KEY` dengan key tadi.
3. Redeploy project.

Jangan menulis API key langsung di file yang diupload ke GitHub. Pakai Environment Variable.

Kalau chat menampilkan "Asisten AI belum bisa dihubungi [kode 404]", biasanya folder `api` salah nama atau salah tempat. Cek dengan membuka `https://alamat-websitemu.vercel.app/api/chat`, hasil yang benar adalah `{"error":"method"}`.

## Dinding Pesan bersama (opsional)

Tanpa ini, pesan hanya tersimpan di perangkat masing-masing. Supaya semua orang melihat pesan yang sama:

1. Di Vercel buka **Storage** (Marketplace), buat database **Upstash Redis** (paket gratis cukup), lalu hubungkan ke project. Variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` terisi otomatis.
2. Redeploy project.

Opsional:
- `DISCORD_WEBHOOK`: kirim notifikasi tiap ada pesan baru, beserta link hapus.
- `ADMIN_KEY`: kunci rahasia untuk menghapus pesan lewat link admin.

## Catatan

- Halaman Developer berisi kredit pembuat dan dikunci supaya tidak tertimpa. Mohon jangan dihapus.
- Data pribadi (nama murid, foto) sebaiknya hanya ditampilkan dengan izin yang bersangkutan, terutama jika website dilihat orang di luar kelas.
- Satu file, tanpa proses build. Bisa diedit di editor teks mana saja.

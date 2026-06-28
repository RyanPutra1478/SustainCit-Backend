# SustainCity Backend untuk VPS

Ini adalah backend Node.js sederhana yang menggunakan Express dan SQLite.
Sangat ringan dan cocok untuk dijalankan di VPS (Ubuntu/CentOS).

## Cara Menjalankan di VPS:
1. Pastikan VPS Anda sudah terinstall **Node.js** (rekomendasi versi 18+).
2. Upload folder `SustainCity-Backend` ini ke dalam VPS Anda.
3. Buka terminal VPS, arahkan ke folder ini, lalu jalankan:
   `npm install`
4. Setelah instalasi selesai, jalankan server:
   `node server.js`
   *(Sangat disarankan menggunakan `pm2` agar server tetap berjalan meskipun terminal ditutup: `npm install -g pm2` lalu `pm2 start server.js`).*
5. Backend akan berjalan di port `3000`. Pastikan firewall VPS membuka port tersebut, atau gunakan Nginx sebagai *Reverse Proxy* untuk menyambungkannya ke domain Anda.

## Cara Mengakses Dashboard Admin:
Buka browser dan ketikkan alamat IP VPS Anda beserta portnya:
`http://IP_VPS_ANDA:3000/`

## Integrasi dengan Unity:
Buka skrip `ServerManager.cs` di dalam project Unity, dan ubah URL endpoint agar mengarah ke `http://IP_VPS_ANDA:3000/api`.

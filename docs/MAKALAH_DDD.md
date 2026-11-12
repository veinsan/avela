**TUGAS 1: MAKALAH DOMAIN-DRIVEN DESIGN AVELA**

**II3160 TEKNOLOGI SISTEM TERINTEGRASI**

Disusun oleh:

Mishael Gilland    18224005

Riantama Putra    18224061

**PROGRAM STUDI SISTEM DAN TEKNOLOGI INFORMASI**

**SEKOLAH TEKNIK ELEKTRO DAN INFORMATIKA**

**INSTITUT TEKNOLOGI BANDUNG**

**2026**

---

## A. Deskripsi Sistem

Kebakaran hutan dan lahan (karhutla) di Indonesia menghasilkan asap yang membawa partikel halus PM2.5 ke permukiman warga. Warga di wilayah terdampak sering hanya menerima angka kualitas udara tanpa penjelasan tentang langkah yang perlu diambil. Ketika keluhan pernapasan muncul, warga harus memutuskan sendiri apakah perlu menempuh perjalanan ke fasilitas kesehatan di tengah kondisi berasap. Perjalanan yang tidak perlu menambah paparan, sedangkan penundaan pemeriksaan dapat membahayakan kondisi yang sebenarnya serius. Kesenjangan ini lebih terasa di wilayah pelosok karena jarak ke fasilitas kesehatan dapat lebih jauh dan informasi kesehatan lebih sulit dijangkau.

Avela adalah aplikasi seluler Android yang mendampingi warga sejak sebelum terpapar asap hingga memperoleh tindak lanjut dari tenaga kesehatan. Sistem ini sejalan dengan tema Health & Wellbeing, yaitu memperluas akses informasi kesehatan tepercaya dan fasilitas kesehatan bagi warga kota maupun pelosok. Avela tidak mendiagnosis penyakit dan tidak memberikan resep secara otomatis. Seluruh penilaian klinis tetap dilakukan oleh tenaga kesehatan, sedangkan aplikasi menghubungkan informasi lingkungan, laporan warga, dan tanggapan petugas dalam satu alur. Pengguna utama sistem adalah warga, sementara tenaga kesehatan di fasilitas mitra berperan sebagai peninjau laporan dan penerbit hasil pemeriksaan melalui layar khusus petugas di aplikasi yang sama.

*Use case* pertama berlangsung sebelum warga terpapar asap. Warga memilih wilayah secara manual atau mengizinkan akses lokasi, lalu Avela menampilkan prakiraan konsentrasi PM2.5 per jam untuk wilayah tersebut. Setiap nilai disertai satuan, waktu berlaku, sumber data, dan keterangan bahwa nilai itu merupakan prakiraan model regional, bukan pengukuran sensor di rumah warga. Di layar yang sama, warga melihat jumlah laporan keluhan dari wilayahnya selama tujuh hari terakhir dalam bentuk agregat anonim. Avela kemudian menampilkan panduan perlindungan dari sumber kesehatan yang ditinjau, misalnya pertimbangan sebelum beraktivitas di luar ruangan dan gejala yang perlu diwaspadai. Informasi akses darurat selalu tersedia tanpa harus masuk akun atau mengirim laporan.

*Use case* kedua berlangsung ketika warga mulai merasakan keluhan. Warga masuk ke akunnya, mengisi formulir berisi keluhan, waktu mulai, perkembangan gejala, dan riwayat yang relevan, lalu mengirim laporan ke fasilitas yang dipilih. Sistem menyimpan laporan dengan status terkirim, menegaskan bahwa laporan belum ditinjau petugas, dan melampirkan konteks paparan berupa rata-rata serta puncak prakiraan PM2.5 wilayah sejak gejala mulai. Petugas fasilitas kemudian mengklaim laporan, meninjau isinya bersama konteks paparan tersebut, dan dapat meminta informasi tambahan sebelum menerbitkan tanggapan. Tanggapan tersebut dapat berupa saran pemantauan mandiri, kontak lanjutan, atau anjuran pemeriksaan langsung di fasilitas. Setiap perubahan status tercatat beserta pelaku dan waktunya sehingga warga dapat mengikuti perkembangan laporannya.

*Use case* ketiga menyambungkan tanggapan jarak jauh dengan pemeriksaan langsung. Warga mencari fasilitas kesehatan melalui direktori yang disediakan kelompok mitra, lengkap dengan layanan dan jadwal operasionalnya. Setelah warga diperiksa, petugas menautkan pemeriksaan dengan akun Avela melalui proses verifikasi identitas yang disepakati. Petugas lalu menerbitkan hasil pemeriksaan yang mencantumkan nama petugas, fasilitas, waktu, dan arahan berikutnya. Hasil tersebut hanya dapat dibaca oleh warga yang bersangkutan, dan setiap koreksi disimpan sebagai versi baru.

Secara teknis, Avela terdiri atas aplikasi React Native berbasis Expo, layanan inti, dan layanan integrasi. Layanan inti berjalan di dalam kontainer Docker pada STB dan dapat diakses publik melalui Cloudflare Tunnel. Layanan integrasi berjalan di luar STB untuk memanggil API publik Open-Meteo serta layanan dua kelompok mitra, lalu mengirimkan potret prakiraan PM2.5 ke layanan inti secara berkala. Pemisahan ini menjaga STB tetap ringan karena hanya menangani autentikasi, pengelolaan laporan, penerbitan hasil, dan penyajian data yang sudah tersimpan. Avela juga menyediakan API bagi kelompok lain berupa peringatan asap per wilayah dan sinyal kesehatan wilayah, yaitu jumlah laporan anonim per wilayah, tanpa membuka data kesehatan perorangan.

Prototipe ini dikembangkan untuk keperluan tugas kuliah sehingga seluruh data warga, laporan, dan hasil pemeriksaan bersifat fiktif. Akun petugas merupakan simulasi dan diberi label yang jelas di aplikasi. Avela tidak menjanjikan waktu tanggapan karena belum ada fasilitas kesehatan yang benar-benar menjadi mitra. Laporan yang terkirim juga tidak berarti sedang dipantau terus-menerus oleh tenaga kesehatan. Batasan ini dicantumkan agar penilaian terhadap sistem berfokus pada perilaku perangkat lunak, bukan klaim layanan klinis.

## B. Bounded Context

Avela dibagi menjadi beberapa *bounded context* yang masing-masing memiliki model dan bahasanya sendiri. Konteks inti adalah Koordinasi Layanan, yang mengelola laporan gejala beserta konteks paparannya, antrean peninjauan, permintaan klarifikasi, tanggapan petugas, dan perpindahan status laporan. Di dalam konteks ini, laporan berarti catatan keluhan milik satu warga yang hanya dapat dibaca oleh pemiliknya dan petugas fasilitas tujuan. Aturan utamanya meliputi pemilik laporan yang tidak dapat diubah, pengiriman ulang yang tidak menggandakan laporan, serta tanggapan yang hanya dapat diterbitkan oleh petugas aktif di fasilitas tersebut. Konteks Hasil Pemeriksaan berada di sebelahnya dan mengelola catatan pemeriksaan langsung yang berversi serta tertaut ke akun warga yang benar. Konteks Sinyal Kesehatan Wilayah membaca laporan dari konteks inti dan hanya menghasilkan jumlah laporan per wilayah dan per hari, dengan jumlah yang kecil disembunyikan.

Konteks Lingkungan menormalisasi prakiraan Open-Meteo, yang dapat dilengkapi cuaca lokal BMKG, menjadi potret lingkungan yang memuat nilai, satuan, waktu berlaku, waktu pengambilan, sumber, dan tingkat kesegaran data. Konteks ini berjalan di layanan integrasi di luar STB, mengirimkan potretnya ke layanan inti, dan tidak pernah menerima identitas atau riwayat gejala warga. Konteks Panduan Kesehatan menyimpan konten perlindungan berversi beserta sumber dan status tinjauannya. Konteks Identitas dan Akses menangani autentikasi, peran warga dan petugas, keanggotaan petugas pada fasilitas, serta kunci API untuk kelompok lain. Konteks Notifikasi menyimpan penanda pembaruan di dalam aplikasi ketika laporan berubah status atau hasil pemeriksaan terbit. Seluruh konteks pendukung ini membantu konteks inti tanpa ikut menentukan aturan peninjauan laporan.

Dua konteks berasal dari kelompok lain dan terhubung melalui *anticorruption layer* di layanan integrasi. Konteks Direktori Fasilitas dimiliki kelompok mitra fasilitas kesehatan dan menyediakan daftar fasilitas, layanan yang tersedia, serta jadwal operasional. Konteks Informasi Kesehatan dimiliki kelompok mitra informasi kesehatan dan menyediakan konten edukasi yang ditampilkan Avela sebagai bagian dari panduan perlindungan. Avela menerjemahkan model kedua kelompok ke dalam istilahnya sendiri sehingga perubahan skema di sisi mitra tidak merusak konteks inti. Jika layanan mitra tidak tersedia, aplikasi menampilkan status tidak tersedia dan tetap mengizinkan warga membuka laporan serta hasil yang sudah ada.

Koordinasi Layanan bergantung pada Identitas dan Akses karena setiap tindakan memakai identitas yang diturunkan dari kredensial, bukan dari data kiriman aplikasi. Konteks Lingkungan bersikap *conformist* terhadap Open-Meteo dan BMKG karena Avela tidak dapat mengubah skema penyedia publik tersebut. Sebaliknya, Avela berperan sebagai *upstream* bagi kelompok lain melalui *open host service* berupa API peringatan asap, sinyal kesehatan wilayah, dan panduan perlindungan. Kunci API kelompok lain hanya memberi akses ke data nonsensitif dan tidak pernah membuka laporan, identitas, atau hasil pemeriksaan warga. Hubungan antarkonteks dirangkum pada tabel berikut.

| Konteks hulu | Konteks hilir | Pola hubungan | Data yang mengalir |
| --- | --- | --- | --- |
| Identitas dan Akses | Koordinasi Layanan, Hasil Pemeriksaan | *Customer–supplier* | Identitas, peran, dan keanggotaan fasilitas |
| Koordinasi Layanan | Hasil Pemeriksaan | *Customer–supplier* | Tautan laporan ke pemeriksaan |
| Lingkungan | Koordinasi Layanan | *Customer–supplier* | Potret PM2.5 untuk konteks paparan laporan |
| Koordinasi Layanan | Sinyal Kesehatan Wilayah | *Customer–supplier* | Jumlah laporan per wilayah, hari, dan jenis tanggapan |
| Koordinasi Layanan, Hasil Pemeriksaan | Notifikasi | *Published events* | Perubahan status dan terbitnya hasil |
| Open-Meteo dan BMKG | Lingkungan | *Conformist* | Prakiraan PM2.5 dan cuaca lokal |
| Direktori Fasilitas (mitra fasilitas kesehatan) | Koordinasi Layanan | *Anticorruption layer* | Fasilitas, layanan, dan jadwal |
| Informasi Kesehatan (mitra informasi kesehatan) | Panduan Kesehatan | *Anticorruption layer* | Konten edukasi kesehatan |
| Lingkungan, Sinyal Kesehatan Wilayah, dan Panduan Kesehatan | Kelompok lain | *Open host service* | Peringatan asap, sinyal wilayah, dan panduan nonsensitif |

## C. Dekomposisi Subdomain

```text
Domain  Layanan Kesehatan Warga saat Asap Karhutla
│
├── [Core] Koordinasi Episode Layanan
│   ├── Pelaporan Gejala dengan Konteks Paparan
│   ├── Peninjauan dan Klarifikasi
│   └── Penerbitan Tanggapan Petugas
│
├── [Supporting] Hasil Pemeriksaan Onsite
│   ├── Penautan Pasien ke Akun
│   └── Penerbitan Hasil Berversi
├── [Supporting] Sinyal Kesehatan Wilayah
│   └── Agregasi Laporan Anonim per Wilayah
├── [Supporting] Konteks Lingkungan
│   ├── Prakiraan PM2.5 (Open-Meteo)
│   └── Cuaca Lokal (BMKG, opsional)
├── [Supporting] Panduan Kesehatan
│   ├── Konten Perlindungan Berversi
│   └── Informasi Kesehatan (Mitra Informasi Kesehatan)
├── [Supporting] Direktori Fasilitas (Mitra Fasilitas Kesehatan)
│
├── [Generic] Identitas dan Akses
├── [Generic] Notifikasi dalam Aplikasi
└── [Generic] Katalog Wilayah Pilot
```

Domain Avela adalah layanan kesehatan warga saat asap karhutla, dengan Koordinasi Episode Layanan sebagai satu-satunya *core subdomain*. Subdomain ini menjadi pembeda utama karena menghubungkan laporan warga, lengkap dengan konteks paparan asapnya, dengan peninjauan petugas yang dapat dipertanggungjawabkan, bukan sekadar menampilkan data dari API publik. Di dalamnya terdapat tiga sub-subdomain, yaitu pelaporan gejala dengan konteks paparan, peninjauan dan klarifikasi, serta penerbitan tanggapan petugas. Ketiganya dibangun sendiri di layanan inti pada STB karena aturan kepemilikan laporan, perpindahan status, dan kewenangan petugas harus dikendalikan langsung oleh Avela. Karena itu, nilai Avela tetap terjaga meskipun sumber data lingkungan kelak diganti.

*Supporting subdomain* diperlukan agar alur inti berjalan, tetapi tidak menjadi pembeda utama Avela. Hasil Pemeriksaan Onsite melanjutkan episode layanan setelah warga datang ke fasilitas dan dibangun sendiri karena menyangkut ketepatan penautan pasien ke akun. Sinyal Kesehatan Wilayah mengolah laporan dari subdomain inti menjadi jumlah anonim per wilayah yang dapat dipakai kelompok lain. Konteks Lingkungan dan Panduan Kesehatan memberi bekal informasi sebelum warga terpapar dengan memanfaatkan Open-Meteo, cuaca BMKG bila tersedia, dan konten dari kelompok mitra informasi kesehatan. Direktori Fasilitas sepenuhnya disediakan oleh kelompok mitra fasilitas kesehatan sehingga Avela cukup membangun *adapter* untuk menerjemahkan datanya. Pembagian ini memusatkan tenaga tim dua orang pada bagian yang paling menentukan nilai sistem.

*Generic subdomain* berisi kebutuhan umum yang dapat memakai solusi standar. Identitas dan Akses menggunakan autentikasi berbasis token dengan peran warga dan petugas yang ditetapkan di sisi server, serta kunci API terpisah untuk kelompok lain. Notifikasi dalam aplikasi cukup berupa penanda pembaruan sehingga tidak memerlukan layanan pesan eksternal pada tahap awal. Katalog wilayah cukup berupa daftar wilayah pilot beserta koordinatnya sehingga tidak memerlukan layanan pencarian lokasi. Dengan pembagian tersebut, Avela berjalan sebagai satu *microservice* inti dengan modul internal yang terpisah jelas, sedangkan pemisahan fisik baru dilakukan jika memang dibutuhkan.

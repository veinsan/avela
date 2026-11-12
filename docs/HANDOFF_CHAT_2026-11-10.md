# Handoff Avela — Rangkuman Percakapan 10 November 2026

Dokumen ini merangkum percakapan secara kronologis. Ketika keputusan berubah, yang dijelaskan adalah arah terakhir yang masih berlaku. Usulan assistant dibedakan dari keputusan user. Tujuannya agar percakapan dapat dilanjutkan di chat lain tanpa mengulang penemuan konteks.

## 1. Konteks tugas dan bahan awal

User sedang mengerjakan tugas besar gabungan **II3160 Teknologi Sistem Terintegrasi (TST)** dan **II3140 Pengembangan Aplikasi Web & Mobile (PWAM)**. Tema yang dipilih adalah **Health & Wellbeing**, dengan fokus pemerataan akses informasi kesehatan antara kota dan pelosok melalui API publik, informasi kesehatan tepercaya, fasilitas kesehatan, serta dukungan personal.

Bahan yang diberikan dan sudah dibaca dalam chat ini:

| Bahan | Lokasi |
| --- | --- |
| PDF tugas besar, 28 halaman | `C:\Users\riant\Downloads\1794269199736_1_Tugas-Besar-TST-PWAM-1.pdf` |
| Rangkuman brainstorming sebelumnya | `C:\Users\riant\Downloads\rangkuman_diskusi_health_karhutla_napas.md` |
| Paper ToothFairy, 19 halaman | `C:\Users\riant\Downloads\B5AEE0368845D197C23A8E68642B97D50D23C294_datathon_2026 (2).pdf` |

Nama pada berkas brainstorming adalah nama historis. Nama produk yang berlaku sekarang hanya **Avela**.

User menginginkan proyek yang menarik, relevan untuk Indonesia, punya kedalaman teknis dan alur end-to-end, serta layak dikembangkan untuk kompetisi. Namun implementasinya tetap harus memenuhi tugas kuliah dan kapasitas tim dua orang.

### Ketentuan tugas yang penting

- Kelompok terdiri dari dua orang, dengan fokus backend/bisnis dan mobile. Identitas serta pembagian orangnya belum ditetapkan dalam chat.
- Membuat makalah DDD: deskripsi sistem, bounded context, dan dekomposisi subdomain.
- Satu microservice inti berjalan di Docker pada STB dan dapat diakses publik.
- Mengintegrasikan layanan **minimal dua kelompok mahasiswa lain**, dipakai nyata dalam fitur.
- API publik seperti Open-Meteo atau NASA **tidak menggantikan** dua integrasi kelompok tersebut.
- Deliverable PWAM adalah **React Native dengan Expo dan APK Android**, bukan website saja.
- Minimal empat layar, navigasi stack + tab, login, form dengan validasi, dan lapisan ApiService.js sesuai deck. Bila memakai TypeScript, ketentuan nama file perlu dipastikan.
- Loading, error, data kosong, dan kegagalan API kelompok lain harus ditangani.
- Ada unit test Jest, tabel uji fungsional/integrasi, branding, dan APK release melalui EAS.
- STB tidak digunakan untuk frontend, build mobile, model AI, atau layanan integrasi. Integrasi berada di luar STB atau di aplikasi mobile sesuai ketentuan.
- Gunakan data pribadi/pasien fiktif untuk tugas.
- Dokumentasi API, akses kelompok lain, repositori, README dalam format yang diminta, laporan tes, dan video dengan kedua anggota tampil diperlukan.
- Makalah DDD: akhir Minggu 13, mengikuti rentang deck **22 November 2026**.
- URL microservice dan dokumentasi di API Registry: akhir Minggu 14, **29 November 2026**.
- Pengumpulan akhir di Edunex: **13 Desember 2026 pukul 23.59 WIB**.

Markdown di repository adalah bahan perencanaan, bukan pengganti otomatis makalah final, README.pdf, README.txt, laporan testing PDF, APK, atau video.

## 2. Memahami ide karhutla dan syarat membekukan ide

Masalah yang dipilih adalah **dampak asap karhutla terhadap kesehatan warga Indonesia**. Informasi lingkungan harus membantu warga mengambil langkah perlindungan dan mengakses layanan kesehatan.

PM2.5 menjadi fokus informasi polutan. Deteksi methane bukan fokus kesehatan utama. Hotspot, meteorologi, dan data polusi dapat menjadi sumber konteks, tetapi tidak otomatis membuktikan sumber polusi atau kondisi paru-paru seseorang.

Ambisi prakiraan 6–24 jam pernah dibahas dan masih dapat dieksplorasi, tetapi **belum menjadi janji model buatan sendiri**. Kelayakan data historis, observasi pembanding, baseline, dan metode evaluasi harus dibuktikan dahulu.

Untuk freeze ide, dibutuhkan:

1. Pengguna utama dan masalah yang spesifik.
2. Satu alur penggunaan utama yang konkret.
3. Wilayah pilot dan batas MVP.
4. Bukti data/API yang benar-benar bisa dipakai.
5. Layanan inti Avela dan dua integrasi kelompok lain.
6. Peran AI, jika diperlukan, beserta cara mengevaluasinya.
7. Pembagian kerja, arsitektur deployment, jadwal, dan alternatif saat dependensi gagal.

**Status akhir: nama dan arah warga sudah jelas; scope implementasi belum di-freeze.**

## 3. Pelajaran dari paper ToothFairy

User memberikan paper ToothFairy sebagai benchmark kualitas proyek. Status pemenang kompetisi berasal dari keterangan user; tidak diverifikasi secara independen dalam chat ini.

Paper dibaca, termasuk diagram dan contoh hasil. Pelajaran yang diterapkan ke Avela:

- Pilih pengguna dan keputusan yang benar-benar ingin dibantu.
- Gabungkan data karena ada manfaat yang dapat dijelaskan, bukan untuk menambah jumlah model.
- Tentukan pembeda yang konkret dan dapat diuji.
- Hubungkan hasil analisis dengan langkah pengguna berikutnya.
- Pisahkan kualitas model, kegunaan aplikasi, dan dampak klinis.
- Jelaskan keterbatasan secara jujur.

Contoh pembeda ToothFairy adalah penggabungan bukti per gigi dan hidden caries flag. Avela tidak perlu meniru digital twin, banyak model visi, atau multi-agent LLM untuk mencapai kedalaman yang baik.

Paper melaporkan evaluasi retrieval dengan 15 pasangan tanya-jawab dan evaluasi agen pada empat kasus demonstrasi. Validasi klinis eksternal prospektif dan studi usability formal belum tersedia menurut paper. Kode, bobot, dataset, dan klaim hasil tidak diaudit secara independen.

## 4. Pengguna utama dan dua perjalanan Avela

Setelah mempertimbangkan peran fasilitas kesehatan, **arah terakhir berfokus pada warga sebagai pengguna utama**. Puskesmas, rumah sakit, atau posko pemeriksaan menjadi pihak pendukung layanan, bukan satu-satunya pengguna aplikasi.

User menginginkan dua perjalanan yang saling terhubung.

### A. Sebelum terpapar: memahami keadaan luar dan mempersiapkan diri

Warga dapat mengetahui kondisi kualitas udara di wilayahnya, makna informasi tersebut, dan hal yang perlu dipertimbangkan sebelum keluar rumah. Aplikasi menyajikan panduan perlindungan serta informasi gejala yang perlu diwaspadai berdasarkan sumber yang ditinjau.

Panduan tidak boleh menjanjikan bahwa tindakan tertentu pasti menyebabkan atau mencegah penyakit tertentu. Nilai polutan regional tidak sama dengan diagnosis atau dosis paparan individu.

### B. Setelah terpapar atau muncul keluhan: melapor dan memperoleh tindak lanjut

User mengusulkan agar warga dapat menuliskan gejala dan apa yang dirasakan, menambahkan foto bila relevan, lalu tenaga kesehatan menilai apakah perlu pemeriksaan langsung atau tindak lanjut lain.

Motivasi user: ketika kondisi berasap buruk, warga sebaiknya tidak melakukan perjalanan yang tidak diperlukan, tetapi kondisi berbahaya tetap harus segera mendapat pertolongan.

Assistant merekomendasikan alur berikut sebagai draft:

```text
Warga melihat kondisi lingkungan
    -> membaca panduan perlindungan
    -> melaporkan keluhan dari rumah
    -> tenaga kesehatan meninjau dan meminta informasi tambahan bila perlu
    -> warga menerima arahan tindak lanjut
    -> pemeriksaan onsite bila diperlukan
    -> hasil pemeriksaan dan arahan berikutnya muncul di akun warga
```

**Pembedaan penting:** user memang mengusulkan remote review, tetapi pertanyaan assistant untuk menjadikannya alur utama belum dijawab secara eksplisit. Dokumen masih mencatat **remote-first dengan onsite follow-up sebagai rekomendasi yang menunggu persetujuan scope**, bukan keputusan operasional final.

Hasil pemeriksaan onsite merupakan bagian yang dapat menyambung perjalanan tersebut. Rumah Sakit Santosa disebut sebagai contoh, **bukan mitra yang sudah setuju atau memiliki API yang sudah diakses**.

### Batas dan konsekuensi desain

- Diagnosis dan arahan obat berasal dari tenaga kesehatan, bukan AI otonom.
- Foto bersifat pendukung/opsional; tidak diperlakukan sebagai penentu kondisi paru-paru.
- Jalur pertolongan darurat tidak boleh mengharuskan pengguna menunggu balasan laporan.
- Laporan terkirim tidak sama dengan ditinjau, dipantau terus-menerus, atau diterima sebagai tanggung jawab klinis.
- Harus jelas siapa yang menerima laporan, jam layanan, status antrean, dan perilaku saat petugas tidak tersedia.
- Data hasil pemeriksaan hanya ditampilkan ke akun yang benar, dengan identitas petugas, fasilitas, waktu, dan versi.
- Lokasi fasilitas bukan bukti kapasitas, jadwal aktif, stok, atau kemitraan.
- Evakuasi otomatis, distribusi sembako, pengelolaan pengungsian, dan logistik bencana tidak masuk usulan MVP saat ini.
- Untuk demo, gunakan warga fiktif, petugas simulasi, dan data sintetis yang diberi label jelas.

Core domain yang direkomendasikan adalah **koordinasi episode layanan**: kepemilikan laporan, status, peninjauan, klarifikasi, respons, dan hasil pemeriksaan. Ini masih mengikuti pilihan final alur utama.

## 5. Nama dan workspace ditetapkan

User memilih nama **Avela** secara eksplisit. Jangan membuka kembali pemilihan nama atau menggunakan nama kerja sebelumnya untuk produk aktif.

- Workspace: `C:\Users\riant\Projects\avela`.
- Repository: [github.com/veinsan/avela](https://github.com/veinsan/avela).
- Dokumen proyek ditempatkan di `docs/`.
- Bahasa dokumen teknis: Inggris, mengikuti skill setup yang dipakai.
- Bahasa UI: usulan Bahasa Indonesia.
- Handoff ini ditulis dalam Bahasa Indonesia untuk melanjutkan percakapan user.

## 6. Dokumentasi proyek dibuat

User meminta dokumentasi lengkap menggunakan skill lokal project-setup. Skill dan seluruh referensinya dibaca. Awalnya dibuat 18 Markdown, kemudian ditambah riset API dan rencana branch sehingga terdapat **20 file Markdown sebelum handoff ini dibuat**.

Dokumen utama di `C:\Users\riant\Projects\avela\docs`:

| File | Fungsi |
| --- | --- |
| README.md | Indeks dokumentasi dan status proyek |
| PRD.md | Masalah, sasaran, user stories, acceptance criteria, MVP dan non-goals |
| AGENTS.md | Instruksi agent/developer dan aturan kerja |
| DESIGN.md | Usulan design system dan aturan interaksi |
| ARCHITECTURE.md | Kandidat stack, batas komponen, dependency, completion criteria |
| TODO.md | Status pekerjaan lintas sesi |
| WORKFLOW.md | Cara bekerja, verifikasi, dan handoff |
| PRODUCT_FLOWS.md | Journey warga/petugas, state laporan, dan kegagalan |
| DOMAIN_MODEL.md | DDD, bounded contexts, entity, dan invariant |
| API_CONTRACT.md | Draft endpoint serta kontrak integrasi |
| DATA_SOURCES.md | Shortlist API dan sisa audit kelayakan |
| API_RESEARCH.md | Request yang dijalankan dan batas buktinya |
| SAFETY_PRIVACY.md | Batas layanan, data sintetis, akses, dan privasi |
| TEST_PLAN.md | Skenario tes software dan rencana evaluasi |
| COURSE_REQUIREMENTS.md | Pemetaan ketentuan kuliah dan deadline |
| DECISIONS.md | Keputusan, usulan, pertanyaan terbuka, dan freeze criteria |
| BRANCH_PLAN.md | Branch, ownership, dependensi, merge, dan milestone |
| REFERENCES.md | Provenance sumber dan batas verifikasi |
| VALIDATION_REPORT.md | Hasil pemeriksaan dokumentasi |
| skills/review-avela-readiness/SKILL.md | Skill lokal untuk review klaim kesiapan fitur/demo |

PRD menjadi sumber scope, ARCHITECTURE sumber rencana teknis, DESIGN sumber aturan visual, dan TODO sumber status. `docs/AGENTS.md` tidak otomatis mencakup file di luar folder docs; agent harus membacanya secara eksplisit sebelum bekerja di repository.

Review dokumentasi memperbaiki dua masalah: DDD dan Registry dipisahkan sebagai milestone awal, serta pemilihan arah awal dipisahkan dari freeze akhir agar dependency tidak melingkar.

### Stack dan implementasi

- React Native/Expo dan APK merupakan ketentuan tugas.
- FastAPI/Python dan SQLite masih kandidat, bukan stack yang sudah dipilih/diinstal.
- Integrasi berada di luar STB; core case management berada di STB.
- Staff UI belum dipilih antara layar role-gated di mobile dan console web terpisah.
- Versi library, package manager, domain kelas, serta konfigurasi STB belum final.
- Belum ada aplikasi, scaffold, manifest, database, deployment, APK, atau test suite aplikasi.

## 7. API diperbaiki melalui public-apis dan sumber resmi

User meminta melihat [public-apis/public-apis](https://github.com/public-apis/public-apis) dan memperbaiki dokumentasi API. Directory digunakan untuk discovery, lalu dokumentasi resmi provider digunakan untuk menilai kecocokan dan batas penggunaan.

Shortlist terbaru:

| Sumber | Penggunaan yang direkomendasikan | Status |
| --- | --- | --- |
| Open-Meteo Air Quality | Prakiraan PM2.5 regional | Dokumentasi dibaca, dua kandidat kota diuji |
| Open-Meteo Geocoding | Pencarian wilayah manual | Pencarian Pekanbaru diuji |
| BMKG village weather | Konteks cuaca lokal tambahan | Contoh resmi Kemayoran diuji; kode pilot belum diverifikasi |
| OpenAQ v3 | Observasi stasiun/pembanding model opsional | Dokumentasi dibaca; key, stasiun, dan histori belum diperoleh |
| Peer directory dan OSM/Overpass terbatas | Koordinat/direktori fasilitas | Belum ada query fasilitas atau verifikasi layanan |
| Konten tepercaya yang ditinjau | Panduan kesehatan | Bukan API diagnosis/prescribing otomatis |

Empat request publik pada 10 November 2026 berhasil HTTP 200:

- Prakiraan Pekanbaru: 48 nilai PM2.5 non-null dari 48 titik waktu.
- Prakiraan Palangka Raya: 48 nilai PM2.5 non-null dari 48 titik waktu.
- Geocoding Pekanbaru: hasil Kota Pekanbaru, Riau, Indonesia.
- BMKG contoh Kemayoran: struktur lokasi dan tiga kelompok prakiraan tersedia.

Request URL dan metadata terpilih disimpan dalam API_RESEARCH. Raw response tidak disimpan. Ini membuktikan konektivitas dan struktur dasar pada saat pengujian, **bukan akurasi, uptime, atau kelayakan keseluruhan pilot**.

Batas integrasi yang sudah dicatat:

- Produk PM2.5 global CAMS yang relevan untuk Indonesia sekitar 45 km; jangan memakai klaim resolusi produk Eropa 11 km.
- Data model harus diberi label prakiraan, bukan pengukuran sensor.
- Pisahkan waktu berlaku data, waktu pengambilan, dan waktu terbit model bila tersedia. generationtime_ms adalah durasi pemrosesan server, bukan waktu terbit model.
- ID GeoNames tidak sama dengan kode BMKG adm4; butuh crosswalk yang diverifikasi.
- Free API Open-Meteo memiliki batas non-komersial dan kuota; atribusi tetap diperlukan.
- OpenAQ memerlukan key server-side dan audit cakupan stasiun.
- WAQI tidak dipilih sebagai fallback cache karena batas redistribusi/cache dan penggunaan komersial.
- Nominatim publik tidak dipilih sebagai autocomplete/fallback bebas; memiliki kebijakan ketat.
- Shared Overpass bukan backend produksi bebas batas. Direktori, geocoding, tile peta, dan status layanan adalah hal berbeda.
- API medis generik tidak menggantikan tenaga kesehatan atau izin akses data rumah sakit.
- Dua kelompok mahasiswa mitra tetap belum ditemukan/disepakati.

## 8. DESIGN.md diperbaiki memakai Impeccable

User meminta skill Impeccable. Skill tidak ditemukan lokal; assistant membaca sumber resmi [pbakaus/impeccable](https://github.com/pbakaus/impeccable), versi yang tercantum saat dibaca **4.8.2**, terutama petunjuk Operate, Android, dan dokumentasi desain.

Launcher tidak dijalankan karena tidak tersedia; konteks proyek dibaca langsung. Tidak ada instalasi skill global atau klaim bahwa Impeccable CLI telah melakukan audit.

Arah desain terkini:

- Tenang, jelas, fokus pada tugas warga.
- Teal sebagai aksen tindakan, latar terang hangat, teks gelap, dan light/dark theme.
- System font dengan hierarki yang eksplisit, bukan display font dekoratif.
- Prioritas informasi: kondisi lingkungan → langkah berikutnya → status respons petugas.
- Navigasi usulan: Beranda, Laporan, Fasilitas, Akun.
- Target sentuh Android minimum 48 × 48, dukungan Back, keyboard inset, pembesaran teks, dan TalkBack.
- Timeline prakiraan dengan unit/sumber/waktu, alternatif daftar, dan pemisahan data hilang.
- Status terkirim, ditinjau, diminta klarifikasi, dan ditanggapi tidak disamakan.
- Tidak memakai skor kesehatan buatan, 3D paru-paru dekoratif, glass/gradient berlebihan, atau peta yang menyiratkan kepastian layanan.

Pengecekan numerik: 22 pasangan teks light/dark memenuhi target 4.5:1; empat pasangan outline/focus memenuhi 3:1. Ini **bukan audit UI ter-render atau bukti aksesibilitas native**. Desain tetap usulan, belum aplikasi.

## 9. Rencana branch dibuat

Strategi yang direkomendasikan: **satu branch permanen main**, lalu branch pendek per pekerjaan. Tidak ada develop, backend, frontend, atau branch per-orang permanen.

Catalogue 22 branch yang dibuat nanti saat diperlukan:

```text
docs/mvp-scope
docs/api-feasibility
docs/peer-contracts
docs/stack-validation
docs/ddd-submission
chore/project-foundation
feat/auth-access
feat/mobile-foundation
feat/environment-api
feat/environment-mobile
feat/symptom-reports-api
feat/symptom-reports-mobile
feat/staff-review
feat/facilities-results-api
feat/facilities-results-mobile
feat/report-attachments
feat/guidance-accessibility
infra/stb-deployment
docs/api-registry
chore/android-release
docs/final-submission
research/pm25-baseline
```

Selain itu, fix/* dipakai sesuai bug yang benar-benar ditemukan. Attachment dan riset bersifat kondisional, bukan wajib dibuat.

Fondasi bersama digabung dahulu, kontrak disepakati, lalu backend/mobile dapat berjalan paralel. Tes mengikuti branch fiturnya. PR ke main dengan squash merge merupakan usulan workflow. Protection rule belum dikonfigurasi atau diperiksa.

Usulan tag milestone: v0.1.0 untuk core publik, v0.2.0 untuk alur terintegrasi, v1.0.0 untuk build pengumpulan. Belum ada tag/branch fitur/PR yang dibuat dalam chat ini. Nama branch sudah lolos git check-ref-format.

## 10. Commit, push, dan penghapusan paket setup

User beberapa kali secara eksplisit meminta commit/push, dan assistant menjalankannya. Semua perubahan proyek sampai penghapusan paket setup telah dipush ke main.

| Commit | Isi |
| --- | --- |
| 7347f64 | Dokumentasi awal dan paket skill setup |
| bff4f84 | Perbaikan shortlist API, bukti request, dan desain |
| a5b5e64 | Rencana branch dan workflow kolaborasi |
| f5fcb21 | Menghapus project-setup sesuai permintaan user dan memperbarui AGENTS |

**Keputusan final: folder project-setup/ sudah dihapus dari repository dan penghapusannya sudah dipush. Jangan dipulihkan.** Versi historisnya masih bisa dilihat melalui commit awal yang ditautkan REFERENCES.

Kondisi Git sebelum handoff ini dibuat:

- Branch lokal: main; tracking origin/main.
- Remote: https://github.com/veinsan/avela.
- HEAD: f5fcb21bd3d459dcd443ffb0e33a20197acc981b.
- Working directory bersih.

Saat push sempat terjadi Repository not found karena akun GitHub CLI aktif adalah lauvvy, sementara repository milik veinsan. Kredensial veinsan sudah tersedia dan berhasil digunakan khusus untuk proses push melalui credential helper sementara, tanpa mengganti akun aktif global. Jangan mencetak/menyimpan token ke dokumentasi atau Git; periksa kembali keadaan autentikasi bila diperlukan nanti.

Default dokumen menyerahkan Git mutations kepada user, tetapi instruksi eksplisit user untuk push mengotorisasi assistant melakukan commit/push pada pekerjaan yang diminta. Jangan meminta konfirmasi ulang untuk tindakan yang sudah jelas diotorisasi. Handoff ini sendiri belum di-commit atau dipush oleh tugas rangkuman.

## 11. Status terakhir dan pekerjaan berikutnya

### Sudah selesai

- Nama Avela dan workspace ditetapkan.
- Dokumentasi dasar lengkap dibuat dan diperiksa.
- Shortlist API ditingkatkan dengan sumber resmi dan empat request publik.
- DESIGN diperinci memakai panduan Impeccable.
- Rencana branch lengkap dibuat.
- Seluruh pekerjaan tersebut dan penghapusan project-setup sudah dipush.

### Masih terbuka

1. Konfirmasi alur utama remote-first atau onsite-first; jangan menganggap rekomendasi assistant sudah disetujui.
2. Pilih satu wilayah pilot. Pekanbaru/Riau dan Palangka Raya/Kalimantan Tengah masih kandidat.
3. Tentukan dua kelompok mitra serta kontrak dan fitur integrasinya.
4. Tentukan siapa peninjau laporan pada demo, jam/status layanan, dan batas simulasi.
5. Selesaikan audit data: kode BMKG pilot, fasilitas, observasi stasiun, freshness, permission, dan failure cases.
6. Pilih stack, package manager, versi, interface petugas, dan periksa STB sebenarnya.
7. Tentukan apakah foto/attachment masuk MVP serta kebijakan penyimpanannya.
8. Pilih konten/panduan kesehatan yang akan ditinjau dan aturan akses darurat.
9. Tentukan anggota, kelas K01/K02, nama Registry, dan domain.
10. Putuskan apakah custom forecasting memang perlu. Model AI bukan prasyarat vertical slice awal.

Status tracker: A-00, A-19, A-20 Done; A-02 In progress; pemilihan awal A-01 dan final scope gate A-17 masih Pending. Seluruh implementasi aplikasi masih Pending.

**Urutan lanjut yang masuk akal:** baca dokumen terbaru → pilih workflow/pilot → selesaikan bukti data dan peer → pilih stack → freeze scope → baru implementasi. DDD dan Registry harus tetap mengejar milestone awal, tidak menunggu APK final.

### Catatan konsistensi untuk chat berikutnya

DECISIONS D-02 masih mengandung frasa lama tentang mempertahankan setup package. Keputusan user terakhir dan commit f5fcb21 menggantikannya: paket sudah dihapus. Beberapa laporan validasi dan bagian BRANCH_PLAN merekam keadaan penghapusan yang saat itu belum di-commit; itu riwayat, bukan keadaan sekarang. AGENTS sudah diperbarui setelah penghapusan final.

Jangan menganggap jumlah dokumen, uji koneksi API, kelulusan kontras token, atau commit sebagai bukti aplikasi sudah berfungsi, model akurat, atau layanan klinis siap dipakai.

## 12. Prompt pembuka untuk chat baru

> Kita melanjutkan proyek Avela di C:\Users\riant\Projects\avela, repo https://github.com/veinsan/avela. Baca docs/HANDOFF_CHAT_2026-11-10.md, lalu docs/AGENTS.md, README.md, DECISIONS.md, TODO.md, dan PRD.md. Ini tugas gabungan TST/PWAM, dua orang, wajib microservice Docker di STB, aplikasi React Native/Expo APK, dan integrasi minimal dua kelompok lain. Arah produk berfokus pada warga: informasi/persiapan menghadapi asap karhutla, pelaporan gejala dari rumah untuk peninjauan tenaga kesehatan, dan hasil pemeriksaan onsite bila diperlukan. Remote-first masih rekomendasi yang perlu difinalkan. Dokumentasi, shortlist API yang diuji terbatas, design system usulan, dan branch plan sudah ada; belum ada implementasi aplikasi. Nama Avela final, project-setup sudah dihapus dan dipush, HEAD sebelum handoff f5fcb21. Bedakan keputusan user, usulan, simulasi, dan hasil verifikasi. Jangan mulai dengan menambah model AI kompleks atau mengasumsikan mitra rumah sakit/API klinis sudah tersedia.

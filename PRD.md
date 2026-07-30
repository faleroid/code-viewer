PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Sistem Manajemen, Review, dan Penilaian Tugas Praktikum Laboratorium Informatika**

**Versi Dokumen:** 1.0 (Draft)

**Tanggal:** 29 Juli 2026

**Disusun oleh:** Asisten Laboratorium (Aslab)

**Status:** Draft - menunggu review & persetujuan

**Target Stack:** Laravel + Inertia.js (React) + PostgreSQL

# 1\. Latar Belakang & Masalah

Saat ini proses pengumpulan dan penilaian tugas praktikum di laboratorium informatika masih dilakukan secara manual: mahasiswa mengumpulkan tugas melalui Google Form, dan aslab menilai satu per satu melalui spreadsheet. Proses ini menimbulkan sejumlah masalah nyata di lapangan:

- Tidak ada tempat terpusat untuk melihat kode/file yang dikumpulkan - aslab harus mengunduh dan membuka file satu per satu secara manual.
- Feedback ke mahasiswa sulit dilacak dan sering disampaikan lewat chat/grup, sehingga tidak terdokumentasi dengan baik.
- Rekap nilai di spreadsheet rawan human error (salah baris, salah rumus, tertimpa data lain).
- Mahasiswa tidak punya visibilitas real-time atas status tugas, deadline, maupun nilai - semua info tersebar di form, grup chat, dan spreadsheet yang berbeda.
- Proses review tidak efisien: tidak ada mekanisme komentar inline pada kode, sehingga feedback teknis (misalnya pada baris kode tertentu) sulit disampaikan dengan presisi.

Sistem baru ini bertujuan menggantikan alur manual tersebut dengan satu platform terpadu berbasis web yang mengotomasi proses submission, ekstraksi, review inline, dan penilaian.

# 2\. Tujuan & Sasaran

## 2.1 Tujuan Utama

- Menyediakan satu platform terpusat untuk pengumpulan tugas, review, dan penilaian menggantikan kombinasi Google Form + Spreadsheet.
- Meningkatkan efisiensi aslab dalam mereview kode mahasiswa melalui fitur ekstraksi otomatis dan komentar inline pada file kode.
- Memberikan visibilitas penuh kepada mahasiswa atas status tugas, deadline, hasil review, dan nilai secara real-time.
- Mendokumentasikan seluruh histori feedback dan nilai secara terstruktur dan dapat diaudit.

## 2.2 Sasaran Terukur (indikatif, dapat disesuaikan saat UAT)

- Waktu rata-rata review per tugas berkurang dibanding proses manual saat ini.
- 100% submission tugas tercatat di sistem (tidak ada lagi submission via Google Form).
- Mahasiswa dapat melihat status & nilai tugas tanpa perlu bertanya manual ke aslab.

# 3\. Ruang Lingkup

## 3.1 Dalam Lingkup (In-Scope) - MVP

- Manajemen user dengan 2 role utama: Aslab (reviewer/admin) dan Mahasiswa.
- Manajemen Mata Kuliah/Praktikum → Kelas → Modul → Tugas (hierarki berjenjang).
- Submission tugas dalam bentuk file .zip, dengan ekstraksi otomatis oleh sistem.
- Code viewer dengan syntax highlighting dan kemampuan memberi komentar inline per baris kode.
- Penilaian fleksibel: skor angka + feedback teks, dan/atau rubrik per-komponen - aslab dapat memilih metode per tugas.
- Dashboard statistik untuk aslab (progres review, distribusi nilai, keterlambatan submission).
- Dashboard untuk mahasiswa (status tugas, deadline, riwayat nilai, riwayat feedback).
- Notifikasi dasar (in-app, opsional email) untuk deadline mendekat dan hasil review terbit.

## 3.2 Di Luar Lingkup (Out-of-Scope) - Fase Awal

- Auto-grading/eksekusi otomatis kode mahasiswa (compile & run otomatis) - dicadangkan untuk fase lanjutan.
- Integrasi resmi & real-time dengan sistem akademik kampus (SIA/SSO kampus).
- Deteksi plagiarisme otomatis antar submission.
- Aplikasi mobile native (native app) - cukup web responsif.

# 4\. Peran Pengguna (User Roles)

| **Role**         | **Deskripsi**                              | **Kemampuan Utama**                                                                                                  |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Aslab            | Asisten lab yang mengelola & menilai tugas | Kelola kelas/modul/tugas, review kode, komentar inline, beri nilai, lihat statistik & progres, kelola user mahasiswa |
| Mahasiswa        | Peserta praktikum yang mengumpulkan tugas  | Submit tugas (zip), lihat deadline, lihat status & hasil review, lihat nilai & riwayat                               |
| Admin (opsional) | Superadmin sistem                          | Kelola akun aslab, kelola master data mata kuliah, audit log sistem                                                  |

# 5\. Alur Pengguna (User Flow)

## 5.1 Alur Aslab

- Login ke sistem.
- Membuat/memilih Mata Kuliah → Kelas → Modul → Tugas, lengkap dengan deadline dan metode penilaian (skor/rubrik).
- Memantau dashboard progres submission (siapa yang sudah/belum submit).
- Membuka submission mahasiswa → sistem menampilkan hasil ekstraksi struktur folder & file kode.
- Memberi komentar inline pada baris kode tertentu, dan/atau feedback umum.
- Memberi nilai (skor dan/atau rubrik) → submission berstatus 'Selesai Direview'.
- Nilai & feedback otomatis dapat dilihat mahasiswa terkait.

## 5.2 Alur Mahasiswa

- Login ke sistem.
- Melihat daftar tugas aktif beserta deadline pada dashboard.
- Mengunggah file .zip tugas (dapat resubmit selama sebelum deadline atau sesuai kebijakan aslab).
- Memantau status submission (Belum Dinilai / Sedang Direview / Sudah Dinilai).
- Membuka hasil review: melihat komentar inline pada kode dan nilai yang diberikan.
- Melihat statistik pribadi: rekap nilai per modul/mata kuliah, tren nilai, riwayat keterlambatan.

# 6\. Kebutuhan Fungsional (Functional Requirements)

## 6.1 Autentikasi & Manajemen User

| **ID** | **Requirement**                                                                                                                      | **Prioritas** |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| FR-1.1 | Sistem menyediakan login berbasis email/username & password (Laravel Breeze/Fortify + Inertia).                                      | Must          |
| FR-1.2 | Registrasi mahasiswa menggunakan NIM yang harus terdaftar pada whitelist (diimpor aslab via CSV) - mencegah pendaftaran sembarangan. | Must          |
| FR-1.3 | Aslab/Admin dapat menambah, mengedit, menonaktifkan akun user, serta mengimpor data mahasiswa massal (CSV/Excel).                    | Must          |
| FR-1.4 | Role-based access control (Aslab, Mahasiswa, Admin) pada seluruh route & aksi.                                                       | Must          |
| FR-1.5 | Reset password mandiri via email.                                                                                                    | Should        |

## 6.2 Manajemen Mata Kuliah, Kelas & Modul

| **ID** | **Requirement**                                                                                                                                                    | **Prioritas** |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| FR-2.1 | Aslab dapat membuat Mata Kuliah/Praktikum, lalu Kelas di dalamnya, lalu Modul di dalam kelas.                                                                      | Must          |
| FR-2.2 | Aslab dapat menugaskan mahasiswa ke satu atau lebih kelas (assign/enroll).                                                                                         | Must          |
| FR-2.3 | Aslab dapat membuat Tugas di dalam suatu Modul, dengan atribut: judul, deskripsi, deadline, bobot nilai, metode penilaian (skor/rubrik), lampiran soal (opsional). | Must          |
| FR-2.4 | Sistem mendukung banyak kelas paralel dalam satu mata kuliah/modul yang sama (misal Kelas A, B, C).                                                                | Must          |

## 6.3 Submission Tugas

| **ID** | **Requirement**                                                                                                                                              | **Prioritas** |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| FR-3.1 | Mahasiswa dapat mengunggah tugas dalam format .zip melalui form submission.                                                                                  | Must          |
| FR-3.2 | Sistem otomatis mengekstrak isi .zip di server dan menyimpan struktur folder/file untuk ditampilkan di code viewer.                                          | Must          |
| FR-3.3 | Sistem melakukan validasi dasar saat upload: ukuran maksimal file, format harus .zip, dan pengecekan isi berbahaya (mis. file executable) sebelum ekstraksi. | Must          |
| FR-3.4 | Sistem mencatat waktu submission dan menandai status keterlambatan (telat/tidak) relatif terhadap deadline.                                                  | Must          |
| FR-3.5 | Mahasiswa dapat melakukan resubmit sebelum deadline (versi lama tetap tersimpan sebagai riwayat).                                                            | Should        |
| FR-3.6 | Aslab dapat mengunduh kembali file .zip asli dari submission bila diperlukan.                                                                                | Could         |

## 6.4 Review & Komentar Inline

| **ID** | **Requirement**                                                                                                                    | **Prioritas** |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| FR-4.1 | Sistem menampilkan struktur folder hasil ekstraksi dalam bentuk file tree yang dapat dinavigasi.                                   | Must          |
| FR-4.2 | Sistem menampilkan isi file kode dengan syntax highlighting sesuai bahasa pemrograman.                                             | Must          |
| FR-4.3 | Aslab dapat menambahkan komentar pada baris kode tertentu (inline comment), mirip review pull request.                             | Must          |
| FR-4.4 | Aslab dapat menambahkan feedback umum (general comment) di luar baris kode tertentu.                                               | Must          |
| FR-4.5 | Mahasiswa dapat melihat seluruh komentar inline & umum pada submission miliknya (read-only), namun tidak dapat mengedit/menghapus. | Must          |
| FR-4.6 | Mahasiswa dapat membalas (reply) komentar aslab untuk keperluan klarifikasi (thread diskusi).                                      | Should        |

## 6.5 Penilaian

| **ID** | **Requirement**                                                                                                                                                                                                 | **Prioritas** |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| FR-5.1 | Aslab dapat memilih metode penilaian per tugas: (a) skor angka 0-100 + feedback teks, atau (b) rubrik dengan beberapa komponen berbobot (mis. Logika 40%, Style Code 20%, Dokumentasi 20%, Fungsionalitas 20%). | Must          |
| FR-5.2 | Untuk metode rubrik, sistem otomatis menghitung skor akhir berdasarkan bobot komponen.                                                                                                                          | Must          |
| FR-5.3 | Aslab dapat membuat template rubrik yang dapat dipakai ulang di tugas/modul lain.                                                                                                                               | Should        |
| FR-5.4 | Sistem menyimpan histori penilaian (siapa menilai, kapan, revisi nilai jika ada perubahan).                                                                                                                     | Must          |
| FR-5.5 | Nilai otomatis terlihat oleh mahasiswa terkait segera setelah aslab menyimpan/menerbitkan penilaian.                                                                                                            | Must          |

## 6.6 Dashboard & Statistik - Aslab

| **ID** | **Requirement**                                                                                      | **Prioritas** |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------- |
| FR-6.1 | Dashboard menampilkan jumlah submission masuk vs total mahasiswa, per tugas/modul.                   | Must          |
| FR-6.2 | Dashboard menampilkan antrian tugas yang belum direview, diurutkan berdasarkan deadline/waktu masuk. | Must          |
| FR-6.3 | Statistik distribusi nilai (rata-rata, tertinggi, terendah, grafik sebaran) per tugas/kelas.         | Should        |
| FR-6.4 | Laporan keterlambatan submission per mahasiswa/kelas.                                                | Should        |
| FR-6.5 | Ekspor rekap nilai ke Excel/CSV (transisi/cadangan bagi yang masih butuh format spreadsheet).        | Should        |

## 6.7 Dashboard & Statistik - Mahasiswa

| **ID** | **Requirement**                                                                                  | **Prioritas** |
| ------ | ------------------------------------------------------------------------------------------------ | ------------- |
| FR-7.1 | Dashboard menampilkan daftar tugas aktif beserta countdown deadline.                             | Must          |
| FR-7.2 | Dashboard menampilkan status tiap tugas: Belum Submit / Menunggu Review / Sudah Dinilai.         | Must          |
| FR-7.3 | Halaman riwayat nilai per mata kuliah/modul, termasuk rata-rata dan tren.                        | Must          |
| FR-7.4 | Mahasiswa dapat melihat detail feedback & komentar inline dari setiap tugas yang sudah direview. | Must          |

## 6.8 Notifikasi

| **ID** | **Requirement**                                                  | **Prioritas** |
| ------ | ---------------------------------------------------------------- | ------------- |
| FR-8.1 | Notifikasi in-app saat hasil review/nilai terbit.                | Should        |
| FR-8.2 | Notifikasi in-app/email pengingat H-1 atau H-3 sebelum deadline. | Should        |
| FR-8.3 | Notifikasi ke aslab saat ada submission baru masuk.              | Could         |

# 7\. Kebutuhan Non-Fungsional

| **Kategori**  | **Requirement**                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Performa      | Ekstraksi file .zip (ukuran wajar, mis. <50MB) selesai dalam hitungan detik; code viewer memuat file besar tanpa freeze (lazy load per file). |
| Keamanan      | Validasi tipe & isi file upload untuk mencegah zip bomb dan file berbahaya; sanitasi nama file/folder hasil ekstraksi; RBAC ketat per role.   |
| Skalabilitas  | Desain database & storage mendukung penambahan mata kuliah/kelas/modul baru tiap semester tanpa migrasi manual berat.                         |
| Usability     | UI responsif (mobile-friendly) khususnya untuk dashboard mahasiswa; code viewer nyaman dibaca di layar kecil maupun besar.                    |
| Reliabilitas  | Proses ekstraksi & penyimpanan submission dijalankan lewat queue job agar tidak memblok request utama dan tahan retry bila gagal.             |
| Auditabilitas | Setiap perubahan nilai tercatat dengan log (siapa, kapan, nilai lama → baru).                                                                 |
| Ketersediaan  | Target uptime sesuai kebutuhan operasional lab (tidak memerlukan SLA enterprise di fase awal).                                                |

# 8\. Gambaran Model Data (Entitas Utama)

Berikut entitas inti sebagai acuan awal desain database (detail skema disusun terpisah pada tahap technical design):

- users (id, name, email, nim, role, status)
- courses - Mata Kuliah/Praktikum (id, name, code)
- classes - Kelas (id, course_id, name, semester, aslab_id)
- class_student (pivot: class_id, user_id) - enrollment mahasiswa ke kelas
- modules - Modul (id, class_id, title, order)
- assignments - Tugas (id, module_id, title, description, deadline, grading_method, max_score)
- submissions (id, assignment_id, user_id, zip_path, extracted_path, submitted_at, is_late, status)
- submission_files (id, submission_id, file_path, file_type) - hasil ekstraksi per file
- inline_comments (id, submission_file_id, aslab_id, line_number, comment, parent_id) - mendukung reply/thread
- rubric_templates (id, name) & rubric_components (id, rubric_template_id, name, weight)
- grades (id, submission_id, aslab_id, score, feedback, graded_at) & grade_components (id, grade_id, rubric_component_id, score)
- notifications (standar Laravel notifications table)
- audit_logs (id, user_id, action, subject_type, subject_id, old_value, new_value, created_at)

# 9\. Rekomendasi Arsitektur & Tech Stack

| **Layer**       | **Rekomendasi**                                                        | **Catatan**                                                                                      |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Backend         | Laravel (terbaru, LTS)                                                 | Routing, business logic, queue, auth                                                             |
| Frontend Bridge | Inertia.js                                                             | SPA experience tanpa perlu bangun REST API terpisah                                              |
| Frontend UI     | Vue 3 (disarankan) atau React                                          | Sesuaikan dengan familiaritas tim; Vue umumnya lebih ringan dipasangkan dengan Inertia + Laravel |
| Styling         | Tailwind CSS                                                           | Cepat untuk membangun dashboard & komponen konsisten                                             |
| Code Viewer     | Library highlighting (mis. Shiki/Prism) dirender di sisi frontend      | Untuk syntax highlighting + anotasi komentar per baris                                           |
| Queue/Job       | Laravel Queue (database/Redis driver)                                  | Untuk proses ekstraksi .zip agar tidak memblok request                                           |
| Storage File    | Laravel Filesystem (local disk awal, S3-compatible untuk skala lanjut) | Simpan .zip asli + hasil ekstraksi                                                               |
| Database        | MySQL atau PostgreSQL                                                  | Sesuai preferensi tim/hosting                                                                    |
| Autentikasi     | Laravel Breeze/Fortify (Inertia stack) + custom whitelist NIM          | Lihat detail rekomendasi di bagian Asumsi                                                        |

# 10\. Asumsi & Rekomendasi Keputusan Terbuka

## 10.1 Rekomendasi Otentikasi & Data Mahasiswa

Karena sistem ini bersifat unofficial dan tidak memiliki akses resmi ke SIA/SSO kampus, scraping data mahasiswa dari sistem kampus TIDAK direkomendasikan - berisiko melanggar ketentuan penggunaan sistem kampus maupun aturan privasi data pribadi (PDP), dan datanya rawan basi/tidak sinkron. Rekomendasi alternatif yang lebih aman dan tetap efisien:

- Aslab mengumpulkan data mahasiswa dari sumber yang memang sudah legal diakses aslab (misalnya rekap peserta praktikum yang memang diberikan resmi oleh dosen/koordinator, bukan hasil scraping otomatis dari sistem kampus).
- Data tersebut diimpor ke sistem via fitur Import CSV/Excel (NIM, Nama, Email, Kelas) sebagai whitelist.
- Mahasiswa melakukan self-registration menggunakan NIM yang harus cocok dengan whitelist tersebut, lalu set password sendiri.
- Opsional: aktifkan verifikasi email agar akun tidak disalahgunakan pihak lain.
- Integrasi SSO/API resmi kampus dapat dipertimbangkan di fase lanjutan apabila pihak kampus/prodi memberikan akses resmi.

## 10.2 Asumsi Lain

- Satu mahasiswa dapat terdaftar di lebih dari satu kelas/mata kuliah dalam waktu bersamaan.
- Satu tugas hanya dinilai oleh satu aslab (tidak ada multi-reviewer di MVP), kecuali diputuskan lain.
- Ukuran maksimal file .zip perlu disepakati (misalnya 50MB) - akan difinalisasi saat technical design.
- Bahasa pemrograman yang didukung code viewer disesuaikan dengan mata kuliah yang berjalan (fleksibel, bukan daftar tertutup).

# 11\. Metrik Keberhasilan

| **Metrik**                             | **Baseline (Manual)**                           | **Target Setelah Implementasi**                                   |
| -------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Waktu rata-rata review 1 tugas         | Variatif, tergantung buka file manual satu-satu | Berkurang signifikan berkat code viewer + inline comment terpusat |
| Kesalahan input nilai                  | Rawan human error di spreadsheet                | Minimal, karena input terstruktur & tervalidasi sistem            |
| Transparansi status tugas ke mahasiswa | Tidak ada, mahasiswa harus bertanya manual      | Real-time via dashboard mahasiswa                                 |
| Sentralisasi data submission           | Tersebar di Google Form & Drive                 | 100% terpusat di satu sistem                                      |

# 12\. Roadmap Implementasi (Usulan Fase)

### Fase 1 - MVP

- Auth + manajemen user (whitelist NIM & import CSV).
- Manajemen Mata Kuliah → Kelas → Modul → Tugas.
- Submission .zip + ekstraksi otomatis + code viewer dasar.
- Inline comment & penilaian (skor + rubrik).
- Dashboard dasar untuk aslab & mahasiswa.

### Fase 2 - Penyempurnaan

- Statistik lanjutan & ekspor laporan.
- Notifikasi email & in-app lebih lengkap.
- Template rubrik reusable & manajemen versi submission.

### Fase 3 - Lanjutan (opsional, jangka panjang)

- Auto-run/auto-grading kode sederhana (sandbox eksekusi).
- Deteksi kemiripan/plagiarisme antar submission.
- Integrasi resmi dengan sistem akademik kampus (jika tersedia akses).

# 13\. Risiko & Mitigasi

| **Risiko**                                             | **Dampak**                              | **Mitigasi**                                                                                                           |
| ------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| File .zip berbahaya (zip bomb / berisi malware)        | Server overload / keamanan terganggu    | Batasi ukuran file, validasi rasio kompresi, scan tipe file sebelum ekstraksi, jalankan ekstraksi via queue terisolasi |
| Data mahasiswa tidak sinkron dengan data resmi kampus  | Mahasiswa gagal registrasi / data usang | Proses import berkala oleh aslab + mekanisme update manual oleh admin                                                  |
| Resistensi adopsi (mahasiswa/aslab terbiasa cara lama) | Sistem tidak terpakai optimal           | Onboarding/panduan singkat, migrasi bertahap per angkatan/kelas, tetap sediakan ekspor Excel sebagai jembatan transisi |
| Beban server saat banyak submission mendekati deadline | Ekstraksi/upload lambat/gagal           | Gunakan queue worker, monitoring, rate limiting bila perlu                                                             |

# 14\. Pertanyaan Terbuka untuk Tahap Selanjutnya

- Berapa jumlah maksimum aslab & mahasiswa yang perlu didukung sistem pada tahun ajaran berjalan?
- Apakah dibutuhkan multi-reviewer per tugas (lebih dari satu aslab menilai submission yang sama)?
- Apakah mahasiswa boleh resubmit setelah deadline dengan penalti otomatis, atau resubmit ditutup total setelah deadline?
- Bahasa/framework kode apa saja yang paling umum dikumpulkan (untuk prioritas syntax highlighting)?
- Apakah dibutuhkan mode gelap (dark mode) untuk code viewer, mengingat aslab akan lama membaca kode?

_- Akhir Dokumen -_
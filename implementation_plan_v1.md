# Implementation Plan: Penyelarasan Proyek dengan PRD

Analisis gap antara **PRD v1.0** dan **state proyek saat ini** menghasilkan rencana implementasi terstruktur berikut.

---

## Status Saat Ini — Apa yang Sudah Ada

| Area | Status | Detail |
|------|--------|--------|
| Auth (Login/Register) | ✅ Dasar | Laravel Breeze + Inertia, role field di users |
| RBAC Middleware | ✅ Dasar | `RoleMiddleware` ada, dipakai di routes |
| Hierarki Course → Class → Module → Assignment | ✅ CRUD Lengkap | Controllers + Pages + Migrations sudah ada |
| Enroll Mahasiswa ke Kelas | ✅ Ada | pivot `class_student`, enrollStudents action |
| Submission .zip + Ekstraksi | ✅ Ada | `ExtractSubmissionZipJob`, upload via form |
| Code Viewer + Syntax Highlighting | ✅ Ada | `CodeViewer.tsx`, `FileTreeViewer.tsx` |
| Inline Comment (Aslab → baris kode) | ✅ Ada | `InlineCommentController`, `InlineCommentThread.tsx` |
| Penilaian (Rubrik + Skor) | ✅ Ada | `RubricGrader.tsx`, `SubmissionController@grade` |
| ReviewWorkspace (full-screen code review) | ✅ Ada | 3-panel: file tree, code, rubric |
| Sidebar Navigation (Admin + Student) | ✅ Ada | Komponen reusable, 2 config (admin/student) |
| Dashboard Aslab | ✅ Dasar | StatCards, link ke Review |
| Dashboard Mahasiswa | ✅ Dasar | StatCards, link ke Daftar Tugas |
| Student: Daftar Tugas + Submit | ✅ Ada | DataTable + upload dialog |

---

## Gap Analysis — Fitur yang Belum Diimplementasi

### 🔴 Prioritas MUST (Wajib MVP)

| PRD ID | Fitur | Status |
|--------|-------|--------|
| FR-1.2 | Registrasi whitelist NIM (CSV import) | ❌ Belum ada |
| FR-1.3 | Import data mahasiswa massal (CSV) | ❌ Belum ada |
| FR-3.5 | Resubmit sebelum deadline (riwayat versi) | ❌ Belum ada |
| FR-4.4 | General feedback/comment (di luar baris kode) | ⚠️ Parsial — ada field feedback di grade, tapi tidak ada UI khusus |
| FR-4.5 | Mahasiswa lihat inline comments (read-only) | ❌ Feedback page tidak menampilkan inline comments di code viewer |
| FR-5.4 | Histori penilaian (audit siapa menilai kapan) | ❌ Belum ada audit_logs |
| FR-5.5 | Nilai otomatis terlihat mahasiswa setelah aslab simpan | ⚠️ Parsial — ada Feedback page tapi minim |
| FR-6.1 | Dashboard: submission masuk vs total mahasiswa | ❌ Data statistik belum dihitung |
| FR-6.2 | Dashboard: antrian review diurutkan deadline/waktu | ⚠️ Ada tabel tapi belum diurutkan/difilter per tugas |
| FR-7.1 | Dashboard mahasiswa: countdown deadline | ❌ Belum ada |
| FR-7.2 | Status tiap tugas (Belum Submit/Menunggu/Dinilai) | ⚠️ Parsial |
| FR-7.3 | Riwayat nilai per mata kuliah/modul | ❌ Halaman stub (kosong) |

### 🟡 Prioritas SHOULD

| PRD ID | Fitur | Status |
|--------|-------|--------|
| FR-1.5 | Reset password via email | ✅ Ada (Breeze default) |
| FR-4.6 | Mahasiswa reply komentar (thread diskusi) | ❌ Belum ada |
| FR-5.3 | Template rubrik reusable | ❌ Model ada tapi tidak ada UI/management |
| FR-6.3 | Statistik distribusi nilai (grafik) | ❌ Belum ada |
| FR-6.4 | Laporan keterlambatan submission | ❌ Belum ada |
| FR-6.5 | Ekspor rekap nilai ke Excel/CSV | ❌ Belum ada |
| FR-8.1 | Notifikasi in-app saat review terbit | ❌ Belum ada |
| FR-8.2 | Notifikasi deadline mendekat | ❌ Belum ada |

### 🟢 Prioritas COULD

| PRD ID | Fitur | Status |
|--------|-------|--------|
| FR-3.6 | Download .zip asli submission | ❌ Belum ada |
| FR-8.3 | Notifikasi aslab saat submission baru | ❌ Belum ada |

---

## User Review Required

> [!IMPORTANT]
> **Sidebar Mahasiswa — Hapus menu TIM**  
> Menu "TIM" (Daftar Tim, Tim Saya) di sidebar mahasiswa **tidak ada di PRD**. Ini akan dihapus dan diganti dengan menu yang sesuai PRD. Apakah Anda setuju?

> [!IMPORTANT]
> **Scope Implementasi**  
> Rencana ini fokus pada **seluruh fitur MUST** dan sebagian besar **SHOULD**. Fitur COULD dan Notifikasi email ditunda ke fase selanjutnya. Apakah skop ini sesuai?

---

## Open Questions

> [!WARNING]
> **Registrasi Whitelist NIM**: Apakah registrasi mahasiswa tetap menggunakan halaman Register bawaan Breeze yang dimodifikasi (validasi NIM terhadap whitelist), atau ingin flow yang sepenuhnya terpisah?

> [!WARNING]
> **Halaman Classes/Index** (`Admin/Classes/Index.tsx`): Saat ini ada halaman daftar kelas tersendiri. Di PRD, kelas diakses dari dalam Course → Show. Apakah halaman standalone classes/index tetap dipertahankan atau dihapus?

---

## Proposed Changes

Perubahan diorganisasi per fase kerja, dengan dependensi ditangani terlebih dahulu.

---

### Fase A: Restrukturisasi Sidebar & Layout

Memperbaiki struktur navigasi agar selaras dengan PRD dan menghilangkan menu yang tidak relevan.

---

#### [MODIFY] [adminNavigation.ts](file:///d:/LabCodeViewer/resources/js/Components/Sidebar/adminNavigation.ts)

Restrukturisasi sidebar admin menjadi:
```
DASHBOARD
AKADEMIK
  ├── Mata Kuliah (→ /courses)
  ├── Kelas (→ /classes)
SUBMISSION
  ├── Antrean Review (→ /submissions)
MANAJEMEN
  ├── Import Mahasiswa (→ /admin/import-students)
  ├── Template Rubrik (→ /admin/rubric-templates)
```

#### [MODIFY] [studentNavigation.ts](file:///d:/LabCodeViewer/resources/js/Components/Sidebar/studentNavigation.ts)

Restrukturisasi sidebar mahasiswa menjadi:
```
DASHBOARD
TUGAS
  ├── Daftar Tugas (→ /assignments)
  ├── Riwayat Submission (→ /assignments/history)
  ├── Nilai & Feedback (→ /assignments/grades)
```
- **Hapus**: Menu TIM (tidak ada di PRD)

#### [DELETE] [Student/Teams/Index.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Student/Teams/Index.tsx)
#### [DELETE] [Student/Teams/MyTeam.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Student/Teams/MyTeam.tsx)

Hapus halaman Tim yang tidak ada di PRD.

#### [MODIFY] [web.php](file:///d:/LabCodeViewer/routes/web.php)

Hapus route teams.index dan teams.my-team, tambahkan route baru untuk fitur-fitur yang akan dibuat.

---

### Fase B: Manajemen User — Import CSV & Whitelist NIM

Implementasi FR-1.2, FR-1.3: Aslab dapat mengimpor data mahasiswa via CSV, dan registrasi mahasiswa divalidasi terhadap whitelist NIM.

---

#### [NEW] [database/migrations/xxxx_create_student_whitelist_table.php](file:///d:/LabCodeViewer/database/migrations)

Tabel `student_whitelist`:
- `id`, `nim`, `name`, `email`, `class_name`, `imported_by`, `timestamps`

#### [NEW] [app/Models/StudentWhitelist.php](file:///d:/LabCodeViewer/app/Models/StudentWhitelist.php)

Model Eloquent untuk whitelist.

#### [NEW] [app/Http/Controllers/StudentImportController.php](file:///d:/LabCodeViewer/app/Http/Controllers/StudentImportController.php)

- `index()`: Tampilkan halaman import + daftar whitelist saat ini
- `import(Request)`: Parse CSV, validasi, simpan ke whitelist, auto-create user accounts
- `downloadTemplate()`: Download contoh format CSV

#### [NEW] [Pages/Admin/Students/Import.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Admin/Students/Import.tsx)

Halaman import CSV dengan:
- Upload area (drag & drop)
- Preview data sebelum import
- Tabel daftar mahasiswa yang sudah terdaftar
- Tombol download template CSV

#### [MODIFY] [Auth/Register.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Auth/Register.tsx)

Tambahkan field NIM, validasi di backend bahwa NIM harus ada di whitelist.

#### [MODIFY] [app/Http/Controllers/Auth/RegisteredUserController.php](file:///d:/LabCodeViewer/app/Http/Controllers/Auth)

Tambahkan validasi whitelist NIM saat registrasi.

---

### Fase C: Dashboard yang Informatif

Implementasi FR-6.1, FR-6.2, FR-7.1, FR-7.2, FR-7.3: Dashboard kaya data untuk Aslab dan Mahasiswa.

---

#### [MODIFY] [Pages/Admin/Dashboard.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Admin/Dashboard.tsx)

Perkaya dashboard aslab:
- **StatCards**: Kelas Aktif, Total Mahasiswa, Submission Pending, Tugas Dinilai
- **Grafik**: Distribusi submission per tugas (bar chart sederhana)
- **Tabel ringkas**: 5 submission terbaru yang menunggu review

#### [MODIFY] [web.php — dashboard route](file:///d:/LabCodeViewer/routes/web.php)

Hitung dan kirimkan statistik yang diperlukan ke frontend:
- Total mahasiswa enrolled
- Submission pending vs graded count
- Recent submissions

#### [MODIFY] [Pages/Student/Dashboard.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Student/Dashboard.tsx)

Perkaya dashboard mahasiswa:
- **StatCards**: Tugas Aktif, Tugas Selesai, Rata-rata Nilai
- **Countdown deadline**: Tugas terdekat dengan countdown timer
- **Status tugas**: Badge per tugas (Belum Submit / Menunggu Review / Sudah Dinilai)

---

### Fase D: Halaman Riwayat & Nilai Mahasiswa (Fungsional)

Implementasi FR-7.3: Halaman Riwayat dan Nilai yang saat ini stub menjadi fungsional.

---

#### [MODIFY] [Pages/Student/Assignments/History.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Student/Assignments/History.tsx)

Ubah dari stub menjadi fungsional:
- DataTable berisi semua submission mahasiswa
- Kolom: Tugas, Waktu Submit, Status, Late/On-time, Nilai
- Link ke halaman feedback per submission

#### [MODIFY] [Pages/Student/Assignments/Grades.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Student/Assignments/Grades.tsx)

Ubah dari stub menjadi fungsional:
- DataTable rekap nilai per tugas/modul
- Kolom: Mata Kuliah, Modul, Tugas, Nilai, Max Score, Feedback
- Rata-rata nilai keseluruhan di header

#### [MODIFY] [web.php — history & grades routes](file:///d:/LabCodeViewer/routes/web.php)

Kirimkan data submissions + grades yang sesuai ke frontend.

---

### Fase E: Feedback Mahasiswa yang Lengkap

Implementasi FR-4.5, FR-5.5: Mahasiswa dapat melihat inline comments pada kode mereka.

---

#### [MODIFY] [Pages/Student/Feedback.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Student/Feedback.tsx)

Rombak total menjadi mini code-review viewer:
- File tree (read-only)
- Code viewer dengan inline comments yang sudah diberikan aslab (read-only, highlighted)
- Panel nilai: skor, feedback umum, breakdown rubrik
- Tidak ada input — murni read-only

#### [MODIFY] [SubmissionController@feedback](file:///d:/LabCodeViewer/app/Http/Controllers/SubmissionController.php)

Kirimkan data lengkap: fileTree, fileIdMap, inline comments, grade + grade_components.

---

### Fase F: Audit Log & Histori Penilaian

Implementasi FR-5.4: Pencatatan riwayat perubahan nilai.

---

#### [NEW] [database/migrations/xxxx_create_audit_logs_table.php](file:///d:/LabCodeViewer/database/migrations)

Tabel `audit_logs`:
- `id`, `user_id`, `action`, `subject_type`, `subject_id`, `old_value` (JSON), `new_value` (JSON), `created_at`

#### [NEW] [app/Models/AuditLog.php](file:///d:/LabCodeViewer/app/Models/AuditLog.php)

Model Eloquent untuk audit log.

#### [MODIFY] [SubmissionController@grade](file:///d:/LabCodeViewer/app/Http/Controllers/SubmissionController.php)

Tambahkan pencatatan audit log setiap kali nilai disimpan/diubah.

---

### Fase G: Template Rubrik Reusable

Implementasi FR-5.3: Aslab dapat membuat template rubrik yang bisa dipakai ulang.

---

#### [NEW] [app/Http/Controllers/RubricTemplateController.php](file:///d:/LabCodeViewer/app/Http/Controllers/RubricTemplateController.php)

CRUD untuk template rubrik: index, store, update, destroy.

#### [NEW] [Pages/Admin/RubricTemplates/Index.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Admin/RubricTemplates/Index.tsx)

Halaman kelola template rubrik:
- DataTable daftar template
- Dialog create/edit dengan komponen rubrik dinamis (nama, bobot)
- Tombol "Gunakan Template" saat membuat tugas

#### [MODIFY] [Pages/Admin/Classes/Show.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Admin/Classes/Show.tsx)

Saat membuat tugas baru, tambahkan opsi pilih template rubrik sebagai preset.

---

### Fase H: Ekspor Rekap Nilai

Implementasi FR-6.5: Aslab dapat mengekspor rekap nilai ke Excel/CSV.

---

#### [NEW] [app/Http/Controllers/ExportController.php](file:///d:/LabCodeViewer/app/Http/Controllers/ExportController.php)

- `exportGrades(LabClass)`: Generate CSV/Excel rekap nilai seluruh mahasiswa per kelas
- Kolom: NIM, Nama, Tugas 1, Tugas 2, ..., Rata-rata

#### [MODIFY] [adminNavigation.ts](file:///d:/LabCodeViewer/resources/js/Components/Sidebar/adminNavigation.ts) (sudah di Fase A)

Tambahkan link ekspor di sidebar atau di halaman kelas.

---

### Fase I: Download ZIP Original & Resubmit

Implementasi FR-3.5, FR-3.6.

---

#### [MODIFY] [SubmissionController](file:///d:/LabCodeViewer/app/Http/Controllers/SubmissionController.php)

- `download(Submission)`: Return file .zip asli untuk diunduh
- `store()`: Allow resubmit — simpan submission lama, buat yang baru

#### [MODIFY] [web.php](file:///d:/LabCodeViewer/routes/web.php)

Tambahkan route `GET /submissions/{submission}/download`.

#### [MODIFY] [Pages/Admin/ReviewWorkspace.tsx](file:///d:/LabCodeViewer/resources/js/Pages/Admin/ReviewWorkspace.tsx)

Tambahkan tombol "Download ZIP" di header workspace.

---

## Verification Plan

### Automated Tests

Jalankan TypeScript compile check:
```bash
npx tsc --noEmit
```

Pastikan aplikasi build tanpa error:
```bash
npm run build
```

### Manual Verification

- Login sebagai Aslab → cek sidebar sudah sesuai struktur baru
- Login sebagai Mahasiswa → cek sidebar tanpa menu TIM
- Navigasi semua menu sidebar → pastikan tidak ada 404
- Test upload CSV import mahasiswa
- Test flow: buat tugas → mahasiswa submit .zip → aslab review → beri nilai → mahasiswa lihat feedback
- Test halaman Riwayat dan Nilai mahasiswa terisi data
- Test ekspor Excel rekap nilai

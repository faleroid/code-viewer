<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LabClassController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\InlineCommentController;
use App\Models\LabClass;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\SubmissionFile;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {

    // ──────────────────────────────────────────
    // Dashboard (role-aware)
    // ──────────────────────────────────────────
    Route::get('/dashboard', function () {
        $user = request()->user();

        if ($user->role === 'aslab' || $user->role === 'admin') {
            $classes = LabClass::with('course')->where('aslab_id', $user->id)->get();
            $submissions = Submission::with(['user', 'assignment'])
                ->whereIn('status', ['pending', 'reviewing'])
                ->get();

            return Inertia::render('DashboardAslab', [
                'classes' => $classes,
                'pendingSubmissions' => $submissions,
            ]);
        }

        $myClasses = LabClass::whereHas('students', fn($q) => $q->where('user_id', $user->id))
            ->with('course')
            ->get();

        $assignments = Assignment::whereIn('module_id', function ($q) use ($myClasses) {
            $q->select('id')->from('modules')->whereIn('lab_class_id', $myClasses->pluck('id'));
        })
        ->with(['submissions' => fn($q) => $q->where('user_id', $user->id)->with('grade')])
        ->get();

        return Inertia::render('DashboardMahasiswa', [
            'classes' => $myClasses,
            'assignments' => $assignments,
        ]);
    })->name('dashboard');

    // ──────────────────────────────────────────
    // Aslab & Admin Routes
    // ──────────────────────────────────────────
    Route::middleware('role:aslab,admin')->group(function () {
        // Course CRUD
        Route::resource('courses', CourseController::class);

        // Class CRUD
        Route::resource('classes', LabClassController::class);
        Route::post('/classes/{class}/enroll', [LabClassController::class, 'enrollStudents'])->name('classes.enroll');
        Route::delete('/classes/{class}/students/{student}', [LabClassController::class, 'removeStudent'])->name('classes.removeStudent');

        // Module CRUD
        Route::post('/modules', [ModuleController::class, 'store'])->name('modules.store');
        Route::put('/modules/{module}', [ModuleController::class, 'update'])->name('modules.update');
        Route::delete('/modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy');

        // Assignment CRUD
        Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
        Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');

        // Submission Review & Grading
        Route::get('/submissions/{submission}/review', [SubmissionController::class, 'review'])->name('submissions.review');
        Route::post('/submissions/{submission}/grade', [SubmissionController::class, 'grade'])->name('submissions.grade');

        // Inline Comments (create)
        Route::post('/inline-comments', [InlineCommentController::class, 'store'])->name('inline-comments.store');
    });

    // ──────────────────────────────────────────
    // Mahasiswa Routes
    // ──────────────────────────────────────────
    Route::middleware('role:mahasiswa')->group(function () {
        Route::post('/assignments/{assignment}/submit', [SubmissionController::class, 'store'])->name('submissions.store');
    });

    // ──────────────────────────────────────────
    // Shared Authenticated Routes
    // ──────────────────────────────────────────

    // View Assignment detail
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');

    // View submission feedback (both roles need this)
    Route::get('/submissions/{submission}/feedback', [SubmissionController::class, 'feedback'])->name('submissions.feedback');

    // Inline comments for a submission (read — both roles)
    Route::get('/submissions/{submission}/comments', [InlineCommentController::class, 'forSubmission'])->name('submissions.comments');

    // File content API — returns file content as JSON
    Route::get('/submission-files/{submissionFile}/content', function (SubmissionFile $submissionFile) {
        $fullPath = Storage::disk('local')->path($submissionFile->file_path);

        if (!file_exists($fullPath)) {
            return response()->json(['content' => '// File not found', 'error' => true], 404);
        }

        // Safety: only serve text files under 1MB
        $size = filesize($fullPath);
        if ($size > 1024 * 1024) {
            return response()->json(['content' => '// File too large to display', 'error' => true]);
        }

        $content = file_get_contents($fullPath);

        // Check if binary
        if (preg_match('/[\x00-\x08\x0E-\x1F]/', substr($content, 0, 512))) {
            return response()->json(['content' => '// Binary file — cannot display', 'error' => true]);
        }

        return response()->json([
            'content' => $content,
            'file_type' => $submissionFile->file_type,
            'file_path' => $submissionFile->file_path,
        ]);
    })->name('submission-files.content');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

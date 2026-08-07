<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LabClassController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\InlineCommentController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ──────────────────────────────────────────
    // Aslab & Admin Routes
    // ──────────────────────────────────────────

    Route::middleware('role:aslab,admin')->group(function () {
        Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
        Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
        Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
        Route::put('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');

        Route::resource('classes', LabClassController::class);
        Route::post('/classes/{class}/enroll', [LabClassController::class, 'enrollStudents'])->name('classes.enroll');
        Route::delete('/classes/{class}/students/{student}', [LabClassController::class, 'removeStudent'])->name('classes.removeStudent');
        Route::get('/classes/{class}/export-grades', [\App\Http\Controllers\ExportController::class, 'exportGrades'])->name('classes.export-grades');
        Route::post('/classes/{class}/assignments/{assignment}/schedule', [LabClassController::class, 'updateAssignmentSchedule'])->name('classes.assignments.schedule');
        Route::post('/classes/{class}/assignments/{assignment}/instant-release', [LabClassController::class, 'instantReleaseAssignment'])->name('classes.assignments.instant-release');

        Route::post('/modules', [ModuleController::class, 'store'])->name('modules.store');
        Route::put('/modules/{module}', [ModuleController::class, 'update'])->name('modules.update');
        Route::delete('/modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy');

        Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
        Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');

        Route::get('/submissions', [SubmissionController::class, 'index'])->name('submissions.index');
        Route::get('/submissions/{submission}/review', [SubmissionController::class, 'review'])->name('submissions.review');
        Route::post('/submissions/{submission}/grade', [SubmissionController::class, 'grade'])->name('submissions.grade');
        Route::resource('rubric-templates', \App\Http\Controllers\RubricTemplateController::class);
        Route::get('/discussions', [\App\Http\Controllers\DiscussionController::class, 'index'])->name('discussions.index');
    });

    // ──────────────────────────────────────────
    // Mahasiswa Routes
    // ──────────────────────────────────────────

    Route::middleware('role:mahasiswa,admin')->group(function () {
        Route::post('/assignments/{assignment}/submit', [SubmissionController::class, 'store'])->name('submissions.store');

        Route::get('/assignments', [AssignmentController::class, 'studentIndex'])->name('assignments.index');
        Route::get('/assignments/history', [AssignmentController::class, 'history'])->name('assignments.history');
        Route::get('/assignments/grades', [AssignmentController::class, 'grades'])->name('assignments.grades');
    });

    // ──────────────────────────────────────────
    // Shared Authenticated Routes
    // ──────────────────────────────────────────

    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::get('/submissions/{submission}/download', [SubmissionController::class, 'download'])->name('submissions.download');
    Route::get('/submissions/{submission}/feedback', [SubmissionController::class, 'feedback'])->name('submissions.feedback');
    Route::get('/submissions/{submission}/comments', [InlineCommentController::class, 'forSubmission'])->name('submissions.comments');
    Route::get('/submission-files/{submissionFile}/content', [SubmissionController::class, 'fileContent'])->name('submission-files.content');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/inline-comments', [InlineCommentController::class, 'store'])->name('inline-comments.store');
});

require __DIR__ . '/auth.php';

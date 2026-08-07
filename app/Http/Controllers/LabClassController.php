<?php

namespace App\Http\Controllers;

use App\Models\LabClass;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabClassController extends Controller
{
    public function index()
    {
        $classes = LabClass::with(['course', 'aslab'])->withCount('students')->get();
        $courses = Course::orderBy('name')->get(['id', 'name', 'code']);
        $aslabs = User::whereIn('role', ['aslab', 'admin'])->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'courses' => $courses,
            'aslabs' => $aslabs,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'semester' => 'required|string|max:50',
            'aslab_id' => 'required|exists:users,id',
        ]);

        LabClass::create($request->only('course_id', 'name', 'semester', 'aslab_id'));

        return redirect()->back()->with('success', 'Kelas berhasil dibuat.');
    }

    public function show(LabClass $class)
    {
        $class->load([
            'course.modules.assignments.classSchedules' => function ($q) use ($class) {
                $q->where('lab_class_id', $class->id);
            },
            'aslab',
            'students'
        ]);

        $availableStudents = User::where('role', 'mahasiswa')
            ->whereNotIn('id', $class->students->pluck('id'))
            ->get(['id', 'name', 'nim', 'email']);

        return Inertia::render('Admin/Classes/Show', [
            'labClass' => $class,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Update or create assignment schedule for a specific class.
     */
    public function updateAssignmentSchedule(Request $request, LabClass $class, \App\Models\Assignment $assignment)
    {
        $request->validate([
            'is_published' => 'required|boolean',
            'start_time' => 'nullable|date',
            'deadline' => 'nullable|date',
        ]);

        \App\Models\ClassAssignmentSchedule::updateOrCreate(
            [
                'lab_class_id' => $class->id,
                'assignment_id' => $assignment->id,
            ],
            [
                'is_published' => $request->is_published,
                'start_time' => $request->start_time,
                'deadline' => $request->deadline,
            ]
        );

        return redirect()->back()->with('success', 'Jadwal dan status rilis tugas berhasil disimpan.');
    }

    /**
     * Instantly release an assignment for a class ("Mulai Tugas Sekarang").
     */
    public function instantReleaseAssignment(LabClass $class, \App\Models\Assignment $assignment)
    {
        \App\Models\ClassAssignmentSchedule::updateOrCreate(
            [
                'lab_class_id' => $class->id,
                'assignment_id' => $assignment->id,
            ],
            [
                'is_published' => true,
                'start_time' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Tugas berhasil dirilis sekarang untuk kelas ini.');
    }

    public function update(Request $request, LabClass $class)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'semester' => 'required|string|max:50',
            'aslab_id' => 'required|exists:users,id',
        ]);

        $class->update($request->only('course_id', 'name', 'semester', 'aslab_id'));

        return redirect()->back()->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(LabClass $class)
    {
        $class->delete();

        return redirect()->route('courses.show', $class->course_id)->with('success', 'Kelas berhasil dihapus.');
    }

    /**
     * Enroll students to a class.
     */
    public function enrollStudents(Request $request, LabClass $class)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $class->students()->syncWithoutDetaching($request->student_ids);

        return redirect()->back()->with('success', 'Mahasiswa berhasil didaftarkan ke kelas.');
    }

    /**
     * Remove a student from a class.
     */
    public function removeStudent(LabClass $class, User $student)
    {
        $class->students()->detach($student->id);

        return redirect()->back()->with('success', 'Mahasiswa berhasil dikeluarkan dari kelas.');
    }
}

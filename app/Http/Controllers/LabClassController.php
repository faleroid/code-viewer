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

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
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
        $class->load(['course', 'aslab', 'students', 'modules.assignments']);

        $availableStudents = User::where('role', 'mahasiswa')
            ->whereNotIn('id', $class->students->pluck('id'))
            ->get(['id', 'name', 'nim', 'email']);

        return Inertia::render('Classes/Show', [
            'labClass' => $class,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function update(Request $request, LabClass $class)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'semester' => 'required|string|max:50',
        ]);

        $class->update($request->only('name', 'semester'));

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

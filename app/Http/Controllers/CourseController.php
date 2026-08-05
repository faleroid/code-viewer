<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::withCount(['labClasses', 'modules'])->orderBy('name')->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:courses,code',
        ]);

        Course::create($request->only('name', 'code'));

        return redirect()->route('courses.index')->with('success', 'Mata kuliah berhasil dibuat.');
    }

    public function update(Request $request, Course $course)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:courses,code,' . $course->id,
        ]);

        $course->update($request->only('name', 'code'));

        return redirect()->route('courses.index')->with('success', 'Mata kuliah berhasil diperbarui.');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('courses.index')->with('success', 'Mata kuliah berhasil dihapus.');
    }

    public function show(Course $course)
    {
        $course->load(['modules.assignments', 'labClasses.aslab', 'labClasses' => function ($q) {
            $q->withCount('students');
        }]);

        $aslabs = \App\Models\User::whereIn('role', ['aslab', 'admin'])->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'aslabs' => $aslabs,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'grading_method' => 'required|in:score,rubric',
            'max_score' => 'required|integer|min:1|max:1000',
        ]);

        Assignment::create($request->only('module_id', 'title', 'description', 'deadline', 'grading_method', 'max_score'));

        return redirect()->back()->with('success', 'Tugas berhasil dibuat.');
    }

    public function show(Request $request, Assignment $assignment)
    {
        $user = $request->user();

        $assignment->load([
            'module.labClass.course',
            'rubricComponents',
            'submissions' => function ($query) use ($user) {
                if ($user->role === 'mahasiswa') {
                    $query->where('user_id', $user->id);
                }
                $query->with(['user', 'grade']);
            }
        ]);

        return Inertia::render('Assignments/Show', [
            'assignment' => $assignment,
        ]);
    }

    public function update(Request $request, Assignment $assignment)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'grading_method' => 'required|in:score,rubric',
            'max_score' => 'required|integer|min:1|max:1000',
        ]);

        $assignment->update($request->only('title', 'description', 'deadline', 'grading_method', 'max_score'));

        return redirect()->back()->with('success', 'Tugas berhasil diperbarui.');
    }

    public function destroy(Assignment $assignment)
    {
        $assignment->delete();

        return redirect()->back()->with('success', 'Tugas berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\LabClass;
use App\Models\Submission;
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
            'rubric_template_id' => 'nullable|exists:rubric_templates,id',
        ]);

        $assignment = Assignment::create($request->only('module_id', 'title', 'description', 'deadline', 'grading_method', 'max_score'));

        if ($request->grading_method === 'rubric' && $request->rubric_template_id) {
            $template = \App\Models\RubricTemplate::with('components')->find($request->rubric_template_id);
            if ($template) {
                foreach ($template->components as $comp) {
                    \App\Models\RubricComponent::create([
                        'assignment_id' => $assignment->id,
                        'name' => $comp->name,
                        'weight' => $comp->weight,
                    ]);
                }
            }
        }

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

        return Inertia::render('Student/Assignments/Show', [
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

    public function studentIndex(Request $request)
    {
        $user = $request->user();
        $myClasses = LabClass::whereHas('students', fn($q) => $q->where('user_id', $user->id))->with('course')->get();
        $courseIds = $myClasses->pluck('course_id');
        $assignments = Assignment::whereIn('module_id', function ($q) use ($courseIds) {
            $q->select('id')->from('modules')->whereIn('course_id', $courseIds);
        })->with(['module.course', 'submissions' => fn($q) => $q->where('user_id', $user->id)->with('grade')])->get();

        return Inertia::render('Student/Assignments/Index', [
            'assignments' => $assignments,
            'classes' => $myClasses,
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $submissions = Submission::where('user_id', $user->id)
            ->with(['assignment.module.course', 'grade'])
            ->orderBy('submitted_at', 'desc')
            ->get();

        return Inertia::render('Student/Assignments/History', [
            'submissions' => $submissions,
        ]);
    }

    public function grades(Request $request)
    {
        $user = $request->user();
        $submissions = Submission::where('user_id', $user->id)
            ->whereNotNull('status')
            ->with(['assignment.module.course', 'grade'])
            ->orderBy('submitted_at', 'desc')
            ->get();

        return Inertia::render('Student/Assignments/Grades', [
            'submissions' => $submissions,
        ]);
    }
}

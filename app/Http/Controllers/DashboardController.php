<?php

namespace App\Http\Controllers;

use App\Models\LabClass;
use App\Models\Submission;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'aslab' || $user->role === 'admin') {
            $classes = LabClass::with('course')->where('aslab_id', $user->id)->get();
            $submissions = Submission::with(['user', 'assignment'])
                ->whereIn('status', ['pending', 'reviewing'])
                ->get();

            return Inertia::render('Admin/Dashboard', [
                'classes' => $classes,
                'pendingSubmissions' => $submissions,
            ]);
        }

        $myClasses = LabClass::whereHas('students', fn($q) => $q->where('user_id', $user->id))
            ->with('course')
            ->get();

        $courseIds = $myClasses->pluck('course_id');
        $assignments = Assignment::whereIn('module_id', function ($q) use ($courseIds) {
            $q->select('id')->from('modules')->whereIn('course_id', $courseIds);
        })
        ->with(['submissions' => fn($q) => $q->where('user_id', $user->id)->with('grade')])
        ->get();

        $completedCount = Submission::where('user_id', $user->id)->count();

        return Inertia::render('Student/Dashboard', [
            'classes' => $myClasses,
            'assignments' => $assignments,
            'completedCount' => $completedCount,
        ]);
    }
}

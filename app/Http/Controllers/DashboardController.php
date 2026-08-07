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
            $classes = LabClass::with([
                'course.modules.assignments.classSchedules',
                'aslab'
            ])
            ->when($user->role === 'aslab', function ($q) use ($user) {
                $q->where('aslab_id', $user->id);
            })
            ->get();

            $classes->each(function ($class) {
                if ($class->course && $class->course->modules) {
                    foreach ($class->course->modules as $module) {
                        if ($module->assignments) {
                            foreach ($module->assignments as $assignment) {
                                $filtered = $assignment->classSchedules->where('lab_class_id', $class->id)->values();
                                $assignment->setRelation('classSchedules', $filtered);
                                $assignment->setRelation('class_schedules', $filtered);
                            }
                        }
                    }
                }
            });

            $submissions = Submission::with(['user', 'assignment'])
                ->whereIn('status', ['pending', 'reviewing'])
                ->get();

            $courses = \App\Models\Course::with('modules.assignments')->orderBy('name')->get();
            $allClasses = LabClass::orderBy('name')->get(['id', 'name', 'course_id']);
            $rubricTemplates = \App\Models\RubricTemplate::orderBy('name')->get(['id', 'name']);

            return Inertia::render('Admin/Dashboard', [
                'classes' => $classes,
                'allClasses' => $allClasses,
                'courses' => $courses,
                'rubricTemplates' => $rubricTemplates,
                'pendingSubmissions' => $submissions,
            ]);
        }

        $myClasses = LabClass::whereHas('students', fn($q) => $q->where('user_id', $user->id))
            ->with('course')
            ->get();
        $myClassIds = $myClasses->pluck('id');

        $assignments = Assignment::whereHas('classSchedules', function ($q) use ($myClassIds) {
            $q->whereIn('lab_class_id', $myClassIds)
                ->where('is_published', true)
                ->where(function ($sub) {
                    $sub->whereNull('start_time')->orWhere('start_time', '<=', now());
                });
        })
        ->with([
            'module.course',
            'classSchedules' => function ($q) use ($myClassIds) {
                $q->whereIn('lab_class_id', $myClassIds);
            },
            'submissions' => fn($q) => $q->where('user_id', $user->id)->with('grade')
        ])
        ->get();

        $assignments->transform(function ($assignment) {
            $schedule = $assignment->classSchedules->first();
            if ($schedule && $schedule->deadline) {
                $assignment->deadline = $schedule->deadline;
            }
            return $assignment;
        });

        $completedCount = Submission::where('user_id', $user->id)->count();

        return Inertia::render('Student/Dashboard', [
            'classes' => $myClasses,
            'assignments' => $assignments,
            'completedCount' => $completedCount,
        ]);
    }
}

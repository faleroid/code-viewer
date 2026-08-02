<?php

namespace App\Http\Controllers;

use App\Models\InlineComment;
use App\Models\LabClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscussionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get class IDs managed by the user if role is aslab, or all if admin
        $managedClassIds = LabClass::when($user->role === 'aslab', function ($query) use ($user) {
            $query->where('aslab_id', $user->id);
        })->pluck('id');

        $discussions = InlineComment::whereNull('parent_id')
            ->whereHas('submissionFile.submission.assignment.module', function ($query) use ($managedClassIds) {
                $query->whereIn('lab_class_id', $managedClassIds);
            })
            ->with([
                'user:id,name,email,role',
                'submissionFile:id,submission_id,file_path',
                'submissionFile.submission' => function ($q) {
                    $q->select('id', 'assignment_id', 'user_id', 'status', 'submitted_at')
                      ->with([
                          'user:id,name,nim',
                          'assignment:id,title,module_id',
                          'assignment.module.labClass:id,name,course_id',
                          'assignment.module.labClass.course:id,name',
                      ]);
                },
                'replies' => function ($q) {
                    $q->with('user:id,name,role')->orderBy('created_at', 'asc');
                },
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                $lastReply = $comment->replies->last();
                
                // Determine thread status
                if ($comment->replies->count() === 0) {
                    $status = 'no_replies';
                } elseif ($lastReply && $lastReply->user && $lastReply->user->role === 'mahasiswa') {
                    $status = 'pending_aslab';
                } else {
                    $status = 'answered';
                }

                return [
                    'id' => $comment->id,
                    'line_number' => $comment->line_number,
                    'comment' => $comment->comment,
                    'created_at' => $comment->created_at->toISOString(),
                    'user' => $comment->user,
                    'submission_file_id' => $comment->submission_file_id,
                    'file_path' => $comment->submissionFile->file_path ?? '-',
                    'submission_id' => $comment->submissionFile->submission->id ?? null,
                    'student_name' => $comment->submissionFile->submission->user->name ?? '-',
                    'student_nim' => $comment->submissionFile->submission->user->nim ?? '-',
                    'assignment_title' => $comment->submissionFile->submission->assignment->title ?? '-',
                    'class_name' => $comment->submissionFile->submission->assignment->module->labClass->name ?? '-',
                    'course_name' => $comment->submissionFile->submission->assignment->module->labClass->course->name ?? '-',
                    'replies_count' => $comment->replies->count(),
                    'status' => $status,
                    'replies' => $comment->replies->map(fn($r) => [
                        'id' => $r->id,
                        'comment' => $r->comment,
                        'created_at' => $r->created_at->toISOString(),
                        'user' => $r->user,
                    ]),
                ];
            });

        return Inertia::render('Admin/Discussions/Index', [
            'discussions' => $discussions,
        ]);
    }
}

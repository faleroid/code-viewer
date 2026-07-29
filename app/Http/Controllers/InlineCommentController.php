<?php

namespace App\Http\Controllers;

use App\Models\InlineComment;
use App\Models\SubmissionFile;
use Illuminate\Http\Request;

class InlineCommentController extends Controller
{
    /**
     * Store a new inline comment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'submission_file_id' => 'required|exists:submission_files,id',
            'line_number' => 'required|integer|min:1',
            'comment' => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:inline_comments,id',
        ]);

        $comment = InlineComment::create([
            'submission_file_id' => $request->submission_file_id,
            'user_id' => $request->user()->id,
            'line_number' => $request->line_number,
            'comment' => $request->comment,
            'parent_id' => $request->parent_id,
        ]);

        $comment->load('user');

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    /**
     * Get all comments for a submission, grouped by file.
     */
    public function forSubmission($submissionId)
    {
        $comments = InlineComment::whereHas('submissionFile', function ($q) use ($submissionId) {
            $q->where('submission_id', $submissionId);
        })
        ->with(['user:id,name,role', 'replies.user:id,name,role'])
        ->whereNull('parent_id') // Only top-level comments
        ->get()
        ->groupBy('submission_file_id');

        return response()->json($comments);
    }
}

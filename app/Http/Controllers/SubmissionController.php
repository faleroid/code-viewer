<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Assignment;
use App\Models\SubmissionFile;
use App\Models\InlineComment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function store(Request $request, Assignment $assignment)
    {
        $request->validate([
            'file' => 'required|file|mimes:zip|max:51200', // max 50MB per PRD
        ]);

        $path = $request->file('file')->store('submissions/zips');

        $submission = Submission::create([
            'assignment_id' => $assignment->id,
            'user_id' => $request->user()->id,
            'zip_path' => $path,
            'submitted_at' => now(),
            'is_late' => now()->isAfter($assignment->deadline),
            'status' => 'pending',
        ]);

        \App\Jobs\ExtractSubmissionZipJob::dispatch($submission);

        return redirect()->back()->with('success', 'Tugas berhasil dikumpulkan dan sedang diproses.');
    }

    public function review(Submission $submission)
    {
        $submission->load(['user', 'assignment.module.labClass.course', 'assignment.rubricComponents']);

        $files = SubmissionFile::where('submission_id', $submission->id)->orderBy('file_path')->get();
        $fileTree = $this->buildNestedFileTree($files);

        // Load existing inline comments grouped by file
        $comments = InlineComment::whereIn('submission_file_id', $files->pluck('id'))
            ->with('user:id,name,role')
            ->whereNull('parent_id')
            ->with('replies.user:id,name,role')
            ->get()
            ->groupBy('submission_file_id');

        // Build rubric components: use assignment's own if they exist, else provide defaults
        $rubricComponents = $submission->assignment->rubricComponents;
        if ($rubricComponents->isEmpty()) {
            $rubricComponents = collect([
                ['id' => 0, 'name' => 'Nilai Keseluruhan', 'weight' => 100, 'max_score' => 100, 'current_score' => 0],
            ]);
        } else {
            $rubricComponents = $rubricComponents->map(fn($rc) => [
                'id' => $rc->id,
                'name' => $rc->name,
                'weight' => $rc->weight,
                'max_score' => 100,
                'current_score' => 0,
            ]);
        }

        // Load existing grade if any
        $existingGrade = $submission->grade;

        // Map file IDs for the frontend
        $fileIdMap = $files->pluck('id', 'file_path')->toArray();

        return Inertia::render('Admin/ReviewWorkspace', [
            'submission' => [
                'id' => $submission->id,
                'title' => $submission->assignment->title,
                'student' => $submission->user->name,
                'status' => $submission->status,
            ],
            'fileTree' => $fileTree,
            'rubricComponents' => $rubricComponents,
            'existingGrade' => $existingGrade,
            'existingComments' => $comments,
            'fileIdMap' => $fileIdMap,
        ]);
    }

    public function grade(Request $request, Submission $submission)
    {
        $request->validate([
            'components' => 'required|array',
            'feedback' => 'nullable|string',
        ]);

        $total = collect($request->components)->reduce(function ($sum, $comp) {
            $maxScore = $comp['max_score'] > 0 ? $comp['max_score'] : 1;
            return $sum + (($comp['current_score'] / $maxScore) * $comp['weight']);
        }, 0);

        \App\Models\Grade::updateOrCreate(
            ['submission_id' => $submission->id],
            [
                'aslab_id' => $request->user()->id,
                'score' => round($total, 2),
                'feedback' => $request->feedback,
                'graded_at' => now(),
            ]
        );

        $submission->update(['status' => 'graded']);

        return redirect()->route('dashboard')->with('success', 'Penilaian berhasil disimpan.');
    }

    public function feedback(Submission $submission)
    {
        $submission->load(['assignment', 'user', 'files']);
        $grade = $submission->grade;

        // Load inline comments for this submission
        $comments = InlineComment::whereIn('submission_file_id', $submission->files->pluck('id'))
            ->with('user:id,name,role', 'submissionFile:id,file_path')
            ->whereNull('parent_id')
            ->with('replies.user:id,name,role')
            ->get();

        return Inertia::render('Student/Feedback', [
            'submission' => $submission,
            'grade' => $grade,
            'inlineComments' => $comments,
        ]);
    }

    /**
     * Build a proper nested file tree from flat file paths.
     */
    private function buildNestedFileTree($files)
    {
        if ($files->isEmpty()) {
            return null;
        }

        $root = ['name' => 'root', 'path' => '/', 'children' => [], 'fileId' => null];

        foreach ($files as $file) {
            // Get path relative to the extraction directory
            $relativePath = $file->file_path;
            // Remove the "submissions/extracted/{id}/" prefix to get the relative path
            $parts = explode('/', $relativePath);
            // Skip first 3 parts: "submissions", "extracted", "{id}"
            $relevantParts = array_slice($parts, 3);

            $current = &$root;
            $pathSoFar = '';

            foreach ($relevantParts as $i => $part) {
                $pathSoFar .= ($pathSoFar ? '/' : '') . $part;
                $isLast = ($i === count($relevantParts) - 1);

                // Find existing child
                $found = false;
                foreach ($current['children'] as &$child) {
                    if ($child['name'] === $part) {
                        $current = &$child;
                        $found = true;
                        break;
                    }
                }
                unset($child);

                if (!$found) {
                    $newNode = [
                        'name' => $part,
                        'path' => $file->file_path,
                        'children' => $isLast ? null : [],
                        'fileId' => $isLast ? $file->id : null,
                    ];
                    $current['children'][] = $newNode;
                    // Point to the newly added child
                    $current = &$current['children'][count($current['children']) - 1];
                }
            }
            unset($current);
        }

        // Sort children: folders first, then files, alphabetically
        $this->sortTree($root);

        return $root;
    }

    private function sortTree(&$node)
    {
        if (empty($node['children'])) return;

        usort($node['children'], function ($a, $b) {
            $aIsFolder = !empty($a['children']);
            $bIsFolder = !empty($b['children']);
            if ($aIsFolder !== $bIsFolder) return $bIsFolder - $aIsFolder;
            return strcasecmp($a['name'], $b['name']);
        });

        foreach ($node['children'] as &$child) {
            $this->sortTree($child);
        }
    }
}

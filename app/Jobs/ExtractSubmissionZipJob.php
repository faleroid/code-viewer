<?php

namespace App\Jobs;

use App\Models\Submission;
use App\Models\SubmissionFile;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class ExtractSubmissionZipJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Submission $submission)
    {
    }

    public function handle(): void
    {
        $zipPath = Storage::disk('local')->path($this->submission->zip_path);
        
        $extractDir = 'submissions/extracted/' . $this->submission->id;
        $extractPath = Storage::disk('local')->path($extractDir);

        if (!file_exists($extractPath)) {
            mkdir($extractPath, 0755, true);
        }

        $zip = new ZipArchive;
        if ($zip->open($zipPath) === TRUE) {
            $zip->extractTo($extractPath);
            $zip->close();
            
            $this->submission->update([
                'extracted_path' => $extractDir,
                'status' => 'reviewing' // or pending review
            ]);

            $this->mapFilesToDatabase($extractPath, $extractDir);
        } else {
            $this->submission->update(['status' => 'error']);
        }
    }

    private function mapFilesToDatabase($basePath, $extractDir, $subPath = '')
    {
        $dir = $basePath . ($subPath ? '/' . $subPath : '');
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $fullPath = $dir . '/' . $file;
            $relativePath = ($subPath ? $subPath . '/' : '') . $file;
            
            if (is_dir($fullPath)) {
                $this->mapFilesToDatabase($basePath, $extractDir, $relativePath);
            } else {
                SubmissionFile::create([
                    'submission_id' => $this->submission->id,
                    'file_path' => $extractDir . '/' . $relativePath,
                    'file_type' => pathinfo($file, PATHINFO_EXTENSION),
                ]);
            }
        }
    }
}

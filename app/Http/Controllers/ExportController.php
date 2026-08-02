<?php

namespace App\Http\Controllers;

use App\Models\LabClass;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function exportGrades(LabClass $class)
    {
        $class->load([
            'course',
            'students',
            'modules.assignments.submissions.grade',
        ]);

        $assignments = collect();
        foreach ($class->modules as $module) {
            foreach ($module->assignments as $assignment) {
                $assignments->push($assignment);
            }
        }

        $fileName = 'Rekap_Nilai_' . preg_replace('/[^A-Za-z0-9_\-]/', '_', $class->name) . '_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($class, $assignments) {
            $file = fopen('php://output', 'w');

            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header row
            $headerRow = ['NIM', 'Nama Mahasiswa', 'Email'];
            foreach ($assignments as $assignment) {
                $headerRow[] = $assignment->title . ' (Max ' . $assignment->max_score . ')';
            }
            $headerRow[] = 'Rata-Rata Nilai';
            fputcsv($file, $headerRow);

            // Student rows
            foreach ($class->students as $student) {
                $row = [
                    $student->nim ?? '-',
                    $student->name,
                    $student->email,
                ];

                $scores = [];
                foreach ($assignments as $assignment) {
                    $submission = $assignment->submissions->firstWhere('user_id', $student->id);
                    if ($submission && $submission->grade) {
                        $row[] = $submission->grade->score;
                        $scores[] = $submission->grade->score;
                    } else {
                        $row[] = '-';
                    }
                }

                $avg = count($scores) > 0 ? round(array_sum($scores) / count($scores), 2) : 0;
                $row[] = $avg;

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

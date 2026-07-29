<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\LabClass;
use App\Models\Module;
use App\Models\Assignment;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::unguard();
        
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@labcode.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        $aslab = User::create([
            'name' => 'Asisten Lab',
            'email' => 'aslab@labcode.com',
            'password' => Hash::make('password'),
            'role' => 'aslab'
        ]);

        $mhs = User::create([
            'name' => 'Mahasiswa Test',
            'email' => 'mhs@labcode.com',
            'nim' => '12345678',
            'password' => Hash::make('password'),
            'role' => 'mahasiswa'
        ]);

        Course::unguard();
        $course = Course::create(['name' => 'Pemrograman Web', 'code' => 'IF2001']);
        
        LabClass::unguard();
        $class = LabClass::create(['course_id' => $course->id, 'name' => 'Kelas A', 'semester' => 'Ganjil 2026', 'aslab_id' => $aslab->id]);
        
        \Illuminate\Support\Facades\DB::table('class_student')->insert([
            'lab_class_id' => $class->id,
            'user_id' => $mhs->id,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Module::unguard();
        $module = Module::create(['lab_class_id' => $class->id, 'title' => 'Modul 1: HTML & CSS', 'order' => 1]);

        Assignment::unguard();
        Assignment::create([
            'module_id' => $module->id,
            'title' => 'Tugas 1: Landing Page',
            'description' => 'Buat landing page sederhana menggunakan HTML dan CSS',
            'deadline' => now()->addDays(7),
            'grading_method' => 'score',
            'max_score' => 100
        ]);
    }
}

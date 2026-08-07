<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_assignment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->dateTime('start_time')->nullable();
            $table->dateTime('deadline')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            $table->unique(['lab_class_id', 'assignment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_assignment_schedules');
    }
};

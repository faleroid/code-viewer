<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rubric_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rubric_template_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('assignment_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('weight'); // e.g. 40 for 40%
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rubric_components');
    }
};
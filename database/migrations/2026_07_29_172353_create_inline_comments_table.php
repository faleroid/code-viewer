<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inline_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_file_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // aslab or student replying
            $table->integer('line_number');
            $table->text('comment');
            $table->foreignId('parent_id')->nullable()->constrained('inline_comments')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inline_comments');
    }
};
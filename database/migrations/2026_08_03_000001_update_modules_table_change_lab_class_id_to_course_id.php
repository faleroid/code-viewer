<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            if (Schema::hasColumn('modules', 'lab_class_id')) {
                $table->dropForeign(['lab_class_id']);
                $table->dropColumn('lab_class_id');
            }
            if (!Schema::hasColumn('modules', 'course_id')) {
                $table->foreignId('course_id')->after('id')->nullable()->constrained()->cascadeOnDelete();
            }
            if (!Schema::hasColumn('modules', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            if (Schema::hasColumn('modules', 'course_id')) {
                $table->dropForeign(['course_id']);
                $table->dropColumn('course_id');
            }
            if (!Schema::hasColumn('modules', 'lab_class_id')) {
                $table->foreignId('lab_class_id')->nullable()->constrained()->cascadeOnDelete();
            }
            if (Schema::hasColumn('modules', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};

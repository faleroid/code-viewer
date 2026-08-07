<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabClass extends Model
{
    protected $guarded = [];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function aslab()
    {
        return $this->belongsTo(User::class, 'aslab_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'class_student', 'lab_class_id', 'user_id');
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function assignmentSchedules()
    {
        return $this->hasMany(ClassAssignmentSchedule::class);
    }
}

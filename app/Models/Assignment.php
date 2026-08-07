<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $guarded = [];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function rubricComponents()
    {
        return $this->hasMany(RubricComponent::class);
    }

    public function classSchedules()
    {
        return $this->hasMany(ClassAssignmentSchedule::class);
    }
}

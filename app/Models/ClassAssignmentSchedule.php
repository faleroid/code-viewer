<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassAssignmentSchedule extends Model
{
    protected $guarded = [];

    protected $casts = [
        'start_time' => 'datetime',
        'deadline' => 'datetime',
        'is_published' => 'boolean',
    ];

    public function labClass()
    {
        return $this->belongsTo(LabClass::class);
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function isAccessible(): bool
    {
        if (!$this->is_published) {
            return false;
        }

        if ($this->start_time && now()->lt($this->start_time)) {
            return false;
        }

        return true;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $guarded = [];

    protected $casts = [
        'graded_at' => 'datetime',
        'score' => 'decimal:2',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function aslab()
    {
        return $this->belongsTo(User::class, 'aslab_id');
    }

    public function components()
    {
        return $this->hasMany(GradeComponent::class);
    }
}

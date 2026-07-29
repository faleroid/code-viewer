<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $guarded = [];

    protected $casts = [
        'submitted_at' => 'datetime',
        'is_late' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function files()
    {
        return $this->hasMany(SubmissionFile::class);
    }

    public function grade()
    {
        return $this->hasOne(Grade::class);
    }

    public function inlineComments()
    {
        return $this->hasManyThrough(InlineComment::class, SubmissionFile::class);
    }
}

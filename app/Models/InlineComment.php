<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InlineComment extends Model
{
    protected $guarded = [];

    public function submissionFile()
    {
        return $this->belongsTo(SubmissionFile::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(InlineComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(InlineComment::class, 'parent_id');
    }
}

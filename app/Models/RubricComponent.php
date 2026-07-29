<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RubricComponent extends Model
{
    protected $guarded = [];

    public function rubricTemplate()
    {
        return $this->belongsTo(RubricTemplate::class);
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}

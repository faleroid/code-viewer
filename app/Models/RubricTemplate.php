<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RubricTemplate extends Model
{
    protected $guarded = [];

    public function components()
    {
        return $this->hasMany(RubricComponent::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $guarded = [];

    public function labClasses()
    {
        return $this->hasMany(LabClass::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }
}

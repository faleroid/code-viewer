<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\LabClass;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:1',
        ]);

        $order = $request->order ?? Module::where('course_id', $request->course_id)->max('order') + 1;

        Module::create([
            'course_id' => $request->course_id,
            'title' => $request->title,
            'description' => $request->description,
            'order' => $order,
        ]);

        return redirect()->back()->with('success', 'Modul berhasil dibuat.');
    }

    public function update(Request $request, Module $module)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:1',
        ]);

        $module->update($request->only('title', 'description', 'order'));

        return redirect()->back()->with('success', 'Modul berhasil diperbarui.');
    }

    public function destroy(Module $module)
    {
        $module->delete();

        return redirect()->back()->with('success', 'Modul berhasil dihapus.');
    }
}

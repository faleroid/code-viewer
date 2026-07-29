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
            'lab_class_id' => 'required|exists:lab_classes,id',
            'title' => 'required|string|max:255',
            'order' => 'nullable|integer|min:1',
        ]);

        $order = $request->order ?? Module::where('lab_class_id', $request->lab_class_id)->max('order') + 1;

        Module::create([
            'lab_class_id' => $request->lab_class_id,
            'title' => $request->title,
            'order' => $order,
        ]);

        return redirect()->back()->with('success', 'Modul berhasil dibuat.');
    }

    public function update(Request $request, Module $module)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'order' => 'nullable|integer|min:1',
        ]);

        $module->update($request->only('title', 'order'));

        return redirect()->back()->with('success', 'Modul berhasil diperbarui.');
    }

    public function destroy(Module $module)
    {
        $classId = $module->lab_class_id;
        $module->delete();

        return redirect()->back()->with('success', 'Modul berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\RubricTemplate;
use App\Models\RubricComponent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RubricTemplateController extends Controller
{
    public function index()
    {
        $templates = RubricTemplate::with('components')->get();

        return Inertia::render('Admin/RubricTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'components' => 'required|array|min:1',
            'components.*.name' => 'required|string|max:255',
            'components.*.weight' => 'required|numeric|min:0|max:100',
        ]);

        $template = RubricTemplate::create([
            'name' => $request->name,
        ]);

        foreach ($request->components as $comp) {
            RubricComponent::create([
                'rubric_template_id' => $template->id,
                'name' => $comp['name'],
                'weight' => $comp['weight'],
            ]);
        }

        return redirect()->back()->with('success', 'Template rubrik berhasil dibuat.');
    }

    public function update(Request $request, RubricTemplate $rubricTemplate)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'components' => 'required|array|min:1',
            'components.*.name' => 'required|string|max:255',
            'components.*.weight' => 'required|numeric|min:0|max:100',
        ]);

        $rubricTemplate->update(['name' => $request->name]);

        $rubricTemplate->components()->delete();
        foreach ($request->components as $comp) {
            RubricComponent::create([
                'rubric_template_id' => $rubricTemplate->id,
                'name' => $comp['name'],
                'weight' => $comp['weight'],
            ]);
        }

        return redirect()->back()->with('success', 'Template rubrik berhasil diperbarui.');
    }

    public function destroy(RubricTemplate $rubricTemplate)
    {
        $rubricTemplate->delete();

        return redirect()->back()->with('success', 'Template rubrik berhasil dihapus.');
    }
}

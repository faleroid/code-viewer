import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export type RubricComponent = {
    id: number | string;
    name: string;
    weight: number;
    max_score: number;
    current_score: number;
};

export interface RubricGraderProps {
    components: RubricComponent[];
    generalFeedback?: string;
    readonly?: boolean;
    onUpdateComponents?: (components: RubricComponent[]) => void;
    onUpdateGeneralFeedback?: (feedback: string) => void;
    onSubmit?: () => void;
}

export default function RubricGrader({
    components,
    generalFeedback = '',
    readonly = false,
    onUpdateComponents,
    onUpdateGeneralFeedback,
    onSubmit,
}: RubricGraderProps) {
    const updateScore = (index: number, value: string) => {
        if (!onUpdateComponents) return;
        const newComponents = [...components];
        newComponents[index] = {
            ...newComponents[index],
            current_score: parseFloat(value) || 0,
        };
        onUpdateComponents(newComponents);
    };

    const totalScore = components
        .reduce((sum, comp) => sum + ((comp.current_score / comp.max_score) * comp.weight), 0)
        .toFixed(2);

    const maxTotalScore = components.reduce((sum, comp) => sum + comp.weight, 0);

    return (
        <Card className="flex flex-col h-full shadow-sm">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex justify-between items-center">
                    <span>Penilaian Rubrik</span>
                    <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                        Total: {totalScore} / {maxTotalScore}
                    </Badge>
                </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                {components.map((comp, index) => (
                    <div key={comp.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="font-medium text-sm text-gray-700">
                                {comp.name} <span className="text-gray-400 font-normal">({comp.weight}%)</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={comp.current_score} 
                                    onChange={(e) => updateScore(index, e.target.value)}
                                    disabled={readonly}
                                    className="w-20 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    min="0"
                                    max={comp.max_score}
                                />
                                <span className="text-sm text-gray-500">/ {comp.max_score}</span>
                            </div>
                        </div>
                        {/* Range slider visual helper */}
                        <input 
                            type="range" 
                            value={comp.current_score} 
                            onChange={(e) => updateScore(index, e.target.value)}
                            disabled={readonly}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                            min="0" 
                            max={comp.max_score}
                        />
                    </div>
                ))}
                
                <div className="pt-4 border-t">
                    <label className="font-medium text-sm text-gray-700 mb-2 block">General Feedback</label>
                    <textarea 
                        value={generalFeedback}
                        onChange={(e) => onUpdateGeneralFeedback && onUpdateGeneralFeedback(e.target.value)}
                        disabled={readonly}
                        placeholder="Write overall feedback here..."
                        className="w-full text-sm p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 min-h-[100px]"
                    />
                </div>
            </CardContent>
            
            {!readonly && onSubmit && (
                <CardFooter className="border-t p-4 flex justify-end">
                    <Button onClick={onSubmit} className="w-full md:w-auto">Submit Grade</Button>
                </CardFooter>
            )}
        </Card>
    );
}

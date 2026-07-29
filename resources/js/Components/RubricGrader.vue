<script setup>
import { computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const props = defineProps({
    components: {
        type: Array,
        required: true,
        // Array of { id, name, weight, max_score, current_score }
    },
    generalFeedback: {
        type: String,
        default: ''
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:components', 'update:generalFeedback', 'submit']);

const updateScore = (index, value) => {
    const newComponents = [...props.components];
    newComponents[index].current_score = parseFloat(value) || 0;
    emit('update:components', newComponents);
};

const updateFeedback = (e) => {
    emit('update:generalFeedback', e.target.value);
};

const totalScore = computed(() => {
    return props.components.reduce((sum, comp) => {
        return sum + ((comp.current_score / comp.max_score) * comp.weight);
    }, 0).toFixed(2);
});

const maxTotalScore = computed(() => {
    return props.components.reduce((sum, comp) => sum + comp.weight, 0);
});
</script>

<template>
    <Card class="flex flex-col h-full shadow-sm">
        <CardHeader class="pb-3 border-b">
            <CardTitle class="text-lg flex justify-between items-center">
                <span>Penilaian Rubrik</span>
                <Badge variant="outline" class="text-blue-700 bg-blue-50 border-blue-200">
                    Total: {{ totalScore }} / {{ maxTotalScore }}
                </Badge>
            </CardTitle>
        </CardHeader>
        
        <CardContent class="flex-1 overflow-y-auto p-4 space-y-6">
            <div v-for="(comp, index) in components" :key="comp.id" class="space-y-2">
                <div class="flex justify-between items-center">
                    <label class="font-medium text-sm text-gray-700">
                        {{ comp.name }} <span class="text-gray-400 font-normal">({{ comp.weight }}%)</span>
                    </label>
                    <div class="flex items-center gap-2">
                        <input 
                            type="number" 
                            :value="comp.current_score" 
                            @input="e => updateScore(index, e.target.value)"
                            :disabled="readonly"
                            class="w-20 px-2 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            min="0"
                            :max="comp.max_score"
                        />
                        <span class="text-sm text-gray-500">/ {{ comp.max_score }}</span>
                    </div>
                </div>
                <!-- Range slider as visual helper -->
                <input 
                    type="range" 
                    :value="comp.current_score" 
                    @input="e => updateScore(index, e.target.value)"
                    :disabled="readonly"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    min="0" 
                    :max="comp.max_score"
                >
            </div>
            
            <div class="pt-4 border-t">
                <label class="font-medium text-sm text-gray-700 mb-2 block">General Feedback</label>
                <textarea 
                    :value="generalFeedback"
                    @input="updateFeedback"
                    :disabled="readonly"
                    placeholder="Write overall feedback here..."
                    class="w-full text-sm p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 min-h-[100px]"
                ></textarea>
            </div>
        </CardContent>
        
        <CardFooter v-if="!readonly" class="border-t p-4 flex justify-end">
            <Button @click="emit('submit')" class="w-full md:w-auto">Submit Grade</Button>
        </CardFooter>
    </Card>
</template>

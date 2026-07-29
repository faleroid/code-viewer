<script setup>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const props = defineProps({
    comments: {
        type: Array,
        required: true,
        default: () => []
    },
    lineNumber: {
        type: Number,
        required: true
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['reply', 'resolve', 'close']);

const replyText = ref('');

const submitReply = () => {
    if (replyText.value.trim()) {
        emit('reply', { text: replyText.value, line: props.lineNumber });
        replyText.value = '';
    }
};
</script>

<template>
    <Card class="w-80 shadow-lg border-blue-200">
        <div class="bg-blue-50 px-3 py-2 border-b border-blue-100 flex justify-between items-center text-sm font-semibold text-blue-800 rounded-t-lg">
            <span>Line {{ lineNumber }}</span>
            <button @click="emit('close')" class="text-blue-500 hover:text-blue-700">&times;</button>
        </div>
        
        <CardContent class="p-0">
            <div class="max-h-64 overflow-y-auto p-3 space-y-3">
                <div v-if="comments.length === 0" class="text-sm text-gray-500 italic text-center">
                    No comments yet.
                </div>
                
                <div v-for="(comment, index) in comments" :key="index" class="text-sm">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-medium text-gray-900">{{ comment.author }}</span>
                        <span class="text-xs text-gray-500">{{ comment.time }}</span>
                    </div>
                    <div class="text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                        {{ comment.text }}
                    </div>
                </div>
            </div>
            
            <div v-if="!readonly" class="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                <textarea 
                    v-model="replyText" 
                    placeholder="Write a comment..." 
                    class="w-full text-sm p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 mb-2 min-h-[60px]"
                ></textarea>
                <div class="flex justify-end gap-2">
                    <Button variant="outline" size="sm" @click="emit('close')">Cancel</Button>
                    <Button size="sm" @click="submitReply" :disabled="!replyText.trim()">Comment</Button>
                </div>
            </div>
        </CardContent>
    </Card>
</template>

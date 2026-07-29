<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { createHighlighter } from 'shiki';
import { MessageSquarePlus } from 'lucide-vue-next';

const props = defineProps({
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'javascript'
    },
    comments: {
        type: Array,
        default: () => [] // array of { line: number, text: string, author: string }
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['addComment']);

const highlightedHtml = ref('');
const isLoading = ref(true);
let highlighter = null;

const initShiki = async () => {
    try {
        highlighter = await createHighlighter({
            themes: ['github-light'],
            langs: ['javascript', 'php', 'html', 'css', 'vue']
        });
        highlightCode();
    } catch (e) {
        console.error('Failed to init Shiki', e);
        // Fallback
        highlightedHtml.value = `<pre><code>${escapeHtml(props.code)}</code></pre>`;
        isLoading.value = false;
    }
};

const escapeHtml = (unsafe) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

const highlightCode = () => {
    if (!highlighter || !props.code) {
        isLoading.value = false;
        return;
    }
    
    // Fallback to text if language not loaded
    const lang = highlighter.getLoadedLanguages().includes(props.language) ? props.language : 'text';
    
    // We add special classes to lines to handle hover and clicking
    const html = highlighter.codeToHtml(props.code, {
        lang,
        theme: 'github-light',
        transformers: [
            {
                line(node, line) {
                    node.properties['data-line'] = line;
                    node.properties.class = (node.properties.class || '') + ' relative group cursor-pointer hover:bg-gray-100 px-4 min-h-[1.5rem] flex';
                }
            }
        ]
    });
    
    highlightedHtml.value = html;
    isLoading.value = false;
};

watch(() => props.code, () => {
    highlightCode();
});

watch(() => props.language, () => {
    highlightCode();
});

onMounted(() => {
    initShiki();
});

const handleCodeClick = (e) => {
    if (props.readonly) return;
    
    const lineEl = e.target.closest('[data-line]');
    if (lineEl) {
        const lineNumber = parseInt(lineEl.getAttribute('data-line'), 10);
        emit('addComment', lineNumber);
    }
};

const getCommentsForLine = (line) => {
    return props.comments.filter(c => c.line === line);
};
</script>

<template>
    <div class="relative bg-white border border-gray-200 rounded-md overflow-hidden text-sm flex flex-col h-full">
        <div v-if="isLoading" class="p-4 flex items-center justify-center text-gray-500 h-full">
            Loading editor...
        </div>
        
        <div v-else class="overflow-auto flex-1 custom-scrollbar pb-10" @click="handleCodeClick">
            <div v-html="highlightedHtml" class="code-container font-mono text-xs md:text-sm"></div>
            
            <!-- We will absolute position the inline comments based on DOM later, 
                 or we can map them. For MVP, we can just let the parent handle the display 
                 of comments in a side panel, or we can render them inside the code viewer. -->
        </div>
    </div>
</template>

<style>
/* Adjust shiki generated pre/code tags */
.code-container pre {
    margin: 0;
    padding: 1rem 0;
    background-color: transparent !important;
}

.code-container code {
    display: block;
    min-width: fit-content;
}

/* Custom Line Numbers */
.code-container .line {
    counter-increment: step;
}
.code-container .line::before {
    content: counter(step);
    display: inline-block;
    width: 2rem;
    margin-right: 1.5rem;
    text-align: right;
    color: #9ca3af;
    user-select: none;
}
</style>

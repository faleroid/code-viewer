<script setup>
import { ref, computed } from 'vue';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-vue-next';

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    selectedFilePath: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['select']);

const isOpen = ref(false);

const isFolder = computed(() => {
    return props.node.children && props.node.children.length > 0;
});

const toggle = () => {
    if (isFolder.value) {
        isOpen.value = !isOpen.value;
    }
};

const selectFile = () => {
    if (!isFolder.value) {
        emit('select', props.node.path);
    }
};

const isSelected = computed(() => props.selectedFilePath === props.node.path);
</script>

<template>
    <div class="font-sans text-sm">
        <div 
            class="flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 rounded group"
            :class="{ 'bg-blue-50 text-blue-700': isSelected && !isFolder }"
            @click="isFolder ? toggle() : selectFile()"
        >
            <div class="mr-1 w-4 h-4 flex items-center justify-center">
                <template v-if="isFolder">
                    <ChevronDown v-if="isOpen" class="w-4 h-4 text-gray-500" />
                    <ChevronRight v-else class="w-4 h-4 text-gray-500" />
                </template>
            </div>
            
            <Folder v-if="isFolder" class="w-4 h-4 mr-2 text-yellow-500" />
            <File v-else class="w-4 h-4 mr-2 text-gray-500" :class="{ 'text-blue-500': isSelected }" />
            
            <span class="truncate">{{ node.name }}</span>
        </div>
        
        <div v-if="isFolder && isOpen" class="pl-4 border-l border-gray-200 ml-2">
            <FileTreeViewer
                v-for="(child, index) in node.children"
                :key="index"
                :node="child"
                :selected-file-path="selectedFilePath"
                @select="(path) => emit('select', path)"
            />
        </div>
    </div>
</template>

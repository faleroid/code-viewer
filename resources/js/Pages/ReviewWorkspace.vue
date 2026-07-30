<script setup>
import { ref, computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, router } from '@inertiajs/vue3';
import FileTreeViewer from '@/Components/FileTreeViewer.vue';
import CodeViewer from '@/Components/CodeViewer.vue';
import RubricGrader from '@/Components/RubricGrader.vue';
import InlineCommentThread from '@/Components/InlineCommentThread.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

const props = defineProps({
    submission: Object,
    fileTree: Object,
    rubricComponents: Array,
    existingGrade: Object,
    existingComments: Object, // { fileId: [comments] }
    fileIdMap: Object, // { filePath: fileId }
});

const selectedFilePath = ref('');
const selectedFileId = ref(null);
const selectedFileContent = ref('// Select a file from the tree to view its contents\n');
const selectedLanguage = ref('text');
const isLoadingFile = ref(false);

const rubricComps = ref(
    props.rubricComponents.map(c => ({ ...c }))
);
const generalFeedback = ref(props.existingGrade?.feedback || '');

// Comments: keyed by fileId
const comments = ref({});

// Load existing comments from backend
if (props.existingComments) {
    for (const [fileId, fileComments] of Object.entries(props.existingComments)) {
        comments.value[fileId] = fileComments.map(c => ({
            id: c.id,
            line: c.line_number,
            text: c.comment,
            author: c.user.name,
            time: new Date(c.created_at).toLocaleTimeString(),
            fileId: parseInt(fileId),
        }));
    }
}

const activeCommentLine = ref(null);

const handleFileSelect = async (path) => {
    selectedFilePath.value = path;
    activeCommentLine.value = null;

    // Resolve fileId from path
    const fileId = props.fileIdMap?.[path];
    selectedFileId.value = fileId || null;

    if (!fileId) {
        selectedFileContent.value = '// File ID not found';
        return;
    }

    // Fetch real file content from API
    isLoadingFile.value = true;
    try {
        const response = await fetch(route('submission-files.content', fileId));
        const data = await response.json();
        selectedFileContent.value = data.content || '// Empty file';

        const extMap = { js: 'javascript', html: 'html', css: 'css', php: 'php', vue: 'vue', json: 'json', md: 'text' };
        const ext = (data.file_type || '').toLowerCase();
        selectedLanguage.value = extMap[ext] || 'text';
    } catch (e) {
        selectedFileContent.value = '// Error loading file';
    } finally {
        isLoadingFile.value = false;
    }
};

const handleAddComment = (line) => {
    activeCommentLine.value = line;
};

const submitReply = (replyObj) => {
    if (!selectedFileId.value) return;

    // POST to backend
    router.post(route('inline-comments.store'), {
        submission_file_id: selectedFileId.value,
        line_number: replyObj.line,
        comment: replyObj.text,
    }, {
        preserveScroll: true,
        onSuccess: () => {
            // Add to local state immediately
            const fid = String(selectedFileId.value);
            if (!comments.value[fid]) {
                comments.value[fid] = [];
            }
            comments.value[fid].push({
                line: replyObj.line,
                text: replyObj.text,
                author: 'You',
                time: new Date().toLocaleTimeString(),
                fileId: selectedFileId.value,
            });
        },
    });
};

const getCommentsForCurrentFile = computed(() => {
    if (!selectedFileId.value) return [];
    return comments.value[String(selectedFileId.value)] || [];
});

const allComments = computed(() => {
    const result = {};
    for (const [fileId, fileComments] of Object.entries(comments.value)) {
        if (fileComments.length > 0) {
            result[fileId] = fileComments;
        }
    }
    return result;
});

const isSubmitting = ref(false);

const submitGrade = () => {
    isSubmitting.value = true;
    router.post(route('submissions.grade', props.submission.id), {
        components: rubricComps.value,
        feedback: generalFeedback.value,
    }, {
        onFinish: () => { isSubmitting.value = false; },
    });
};
</script>

<template>
    <Head title="Workspace Review" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    Review: {{ submission?.title }} — {{ submission?.student }}
                </h2>
                <Badge :variant="submission?.status === 'graded' ? 'default' : 'outline'"
                    :class="submission?.status === 'graded' ? 'bg-green-100 text-green-800 border-green-200' : ''">
                    {{ submission?.status }}
                </Badge>
            </div>
        </template>

        <div class="h-[calc(100vh-130px)] p-4 flex gap-4 max-w-[1600px] mx-auto">
            <!-- Left: File Tree -->
            <Card class="w-64 flex-shrink-0 flex flex-col h-full overflow-hidden shadow-sm">
                <div class="bg-gray-50 border-b p-3 font-semibold text-sm">Files</div>
                <CardContent class="p-2 overflow-y-auto flex-1">
                    <FileTreeViewer
                        v-if="fileTree"
                        :node="fileTree"
                        :selected-file-path="selectedFilePath"
                        @select="handleFileSelect"
                    />
                    <div v-else class="text-sm text-gray-500 italic p-2">
                        File belum diproses. Tunggu beberapa saat.
                    </div>
                </CardContent>
            </Card>

            <!-- Middle: Code Viewer -->
            <div class="flex-1 flex flex-col min-w-0 h-full relative">
                <div v-if="isLoadingFile" class="flex-1 flex items-center justify-center text-gray-500">
                    Loading file...
                </div>
                <CodeViewer
                    v-else
                    :code="selectedFileContent"
                    :language="selectedLanguage"
                    :comments="getCommentsForCurrentFile"
                    @add-comment="handleAddComment"
                />

                <!-- Floating Inline Comment Thread -->
                <div v-if="activeCommentLine !== null" class="absolute right-4 top-10 z-10">
                    <InlineCommentThread
                        :line-number="activeCommentLine"
                        :comments="getCommentsForCurrentFile.filter(c => c.line === activeCommentLine)"
                        @close="activeCommentLine = null"
                        @reply="submitReply"
                    />
                </div>
            </div>

            <!-- Right: Grading Panel -->
            <div class="w-80 flex-shrink-0 flex flex-col h-full">
                <Tabs defaultValue="rubric" class="h-full flex flex-col">
                    <TabsList class="w-full">
                        <TabsTrigger value="rubric" class="flex-1">Rubric</TabsTrigger>
                        <TabsTrigger value="comments" class="flex-1">All Comments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="rubric" class="flex-1 mt-0 min-h-0 h-full">
                        <RubricGrader
                            v-model:components="rubricComps"
                            v-model:generalFeedback="generalFeedback"
                            @submit="submitGrade"
                            :readonly="isSubmitting"
                        />
                    </TabsContent>

                    <TabsContent value="comments" class="flex-1 mt-0 min-h-0 h-full">
                        <Card class="h-full shadow-sm">
                            <CardContent class="p-4 overflow-y-auto h-full">
                                <h3 class="font-medium mb-4">Inline Comments Summary</h3>
                                <div v-if="Object.keys(allComments).length === 0" class="text-sm text-gray-500 italic">
                                    Belum ada komentar inline.
                                </div>
                                <div v-for="(fileComments, fileId) in allComments" :key="fileId" class="mb-4">
                                    <div class="text-sm font-semibold text-blue-600 mb-2">File #{{ fileId }}</div>
                                    <div v-for="c in fileComments" :key="c.time" class="text-sm mb-2 p-2 bg-gray-50 rounded border border-gray-100">
                                        <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                                            <span>Line {{ c.line }}</span>
                                            <span>{{ c.author }}</span>
                                        </div>
                                        <div>{{ c.text }}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

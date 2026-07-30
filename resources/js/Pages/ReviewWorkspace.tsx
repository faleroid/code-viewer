import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import FileTreeViewer from '@/Components/FileTreeViewer';
import CodeViewer from '@/Components/CodeViewer';
import RubricGrader, { RubricComponent } from '@/Components/RubricGrader';
import InlineCommentThread from '@/Components/InlineCommentThread';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface ReviewWorkspaceProps {
    submission: any;
    fileTree: any;
    rubricComponents: RubricComponent[];
    existingGrade?: any;
    existingComments?: Record<string, any[]>;
    fileIdMap?: Record<string, number>;
}

export default function ReviewWorkspace({
    submission,
    fileTree,
    rubricComponents = [],
    existingGrade,
    existingComments,
    fileIdMap,
}: ReviewWorkspaceProps) {
    const [selectedFilePath, setSelectedFilePath] = useState('');
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [selectedFileContent, setSelectedFileContent] = useState('// Select a file from the tree to view its contents\n');
    const [selectedLanguage, setSelectedLanguage] = useState('text');
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    const [rubricComps, setRubricComps] = useState<RubricComponent[]>(
        rubricComponents.map((c) => ({ ...c }))
    );
    const [generalFeedback, setGeneralFeedback] = useState(existingGrade?.feedback || '');

    // Comments: keyed by fileId
    const [comments, setComments] = useState<Record<string, any[]>>(() => {
        const initial: Record<string, any[]> = {};
        if (existingComments) {
            for (const [fileId, fileComments] of Object.entries(existingComments)) {
                initial[fileId] = fileComments.map((c: any) => ({
                    id: c.id,
                    line: c.line_number,
                    text: c.comment,
                    author: c.user?.name || 'User',
                    time: new Date(c.created_at).toLocaleTimeString(),
                    fileId: parseInt(fileId, 10),
                }));
            }
        }
        return initial;
    });

    const [activeCommentLine, setActiveCommentLine] = useState<number | null>(null);

    const handleFileSelect = async (path: string) => {
        setSelectedFilePath(path);
        setActiveCommentLine(null);

        const fileId = fileIdMap?.[path];
        setSelectedFileId(fileId || null);

        if (!fileId) {
            setSelectedFileContent('// File ID not found');
            return;
        }

        setIsLoadingFile(true);
        try {
            const response = await fetch(route('submission-files.content', fileId));
            const data = await response.json();
            setSelectedFileContent(data.content || '// Empty file');

            const extMap: Record<string, string> = {
                js: 'javascript',
                html: 'html',
                css: 'css',
                php: 'php',
                vue: 'vue',
                json: 'json',
                md: 'text',
            };
            const ext = (data.file_type || '').toLowerCase();
            setSelectedLanguage(extMap[ext] || 'text');
        } catch (e) {
            setSelectedFileContent('// Error loading file');
        } finally {
            setIsLoadingFile(false);
        }
    };

    const handleAddComment = (line: number) => {
        setActiveCommentLine(line);
    };

    const submitReply = (replyObj: { text: string; line: number }) => {
        if (!selectedFileId) return;

        router.post(
            route('inline-comments.store'),
            {
                submission_file_id: selectedFileId,
                line_number: replyObj.line,
                comment: replyObj.text,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const fid = String(selectedFileId);
                    setComments((prev) => ({
                        ...prev,
                        [fid]: [
                            ...(prev[fid] || []),
                            {
                                line: replyObj.line,
                                text: replyObj.text,
                                author: 'You',
                                time: new Date().toLocaleTimeString(),
                                fileId: selectedFileId,
                            },
                        ],
                    }));
                },
            }
        );
    };

    const currentFileComments = useMemo(() => {
        if (!selectedFileId) return [];
        return comments[String(selectedFileId)] || [];
    }, [selectedFileId, comments]);

    const allComments = useMemo(() => {
        const result: Record<string, any[]> = {};
        for (const [fileId, fileComments] of Object.entries(comments)) {
            if (fileComments.length > 0) {
                result[fileId] = fileComments;
            }
        }
        return result;
    }, [comments]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitGrade = () => {
        setIsSubmitting(true);
        router.post(
            route('submissions.grade', submission.id),
            {
                components: rubricComps,
                feedback: generalFeedback,
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Review: {submission?.title} — {submission?.student}
                    </h2>
                    <Badge
                        variant={submission?.status === 'graded' ? 'default' : 'outline'}
                        className={submission?.status === 'graded' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                    >
                        {submission?.status}
                    </Badge>
                </div>
            }
        >
            <Head title="Workspace Review" />

            <div className="h-[calc(100vh-130px)] p-4 flex gap-4 max-w-[1600px] mx-auto">
                {/* Left: File Tree */}
                <Card className="w-64 flex-shrink-0 flex flex-col h-full overflow-hidden shadow-sm">
                    <div className="bg-gray-50 border-b p-3 font-semibold text-sm">Files</div>
                    <CardContent className="p-2 overflow-y-auto flex-1">
                        {fileTree ? (
                            <FileTreeViewer
                                node={fileTree}
                                selectedFilePath={selectedFilePath}
                                onSelect={handleFileSelect}
                            />
                        ) : (
                            <div className="text-sm text-gray-500 italic p-2">
                                File belum diproses. Tunggu beberapa saat.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Middle: Code Viewer */}
                <div className="flex-1 flex flex-col min-w-0 h-full relative">
                    {isLoadingFile ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Loading file...
                        </div>
                    ) : (
                        <CodeViewer
                            code={selectedFileContent}
                            language={selectedLanguage}
                            comments={currentFileComments}
                            onAddComment={handleAddComment}
                        />
                    )}

                    {/* Floating Inline Comment Thread */}
                    {activeCommentLine !== null && (
                        <div className="absolute right-4 top-10 z-10">
                            <InlineCommentThread
                                lineNumber={activeCommentLine}
                                comments={currentFileComments.filter((c) => c.line === activeCommentLine)}
                                onClose={() => setActiveCommentLine(null)}
                                onReply={submitReply}
                            />
                        </div>
                    )}
                </div>

                {/* Right: Grading Panel */}
                <div className="w-80 flex-shrink-0 flex flex-col h-full">
                    <Tabs defaultValue="rubric" className="h-full flex flex-col">
                        <TabsList className="w-full">
                            <TabsTrigger value="rubric" className="flex-1">Rubric</TabsTrigger>
                            <TabsTrigger value="comments" className="flex-1">All Comments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="rubric" className="flex-1 mt-0 min-h-0 h-full">
                            <RubricGrader
                                components={rubricComps}
                                generalFeedback={generalFeedback}
                                onUpdateComponents={setRubricComps}
                                onUpdateGeneralFeedback={setGeneralFeedback}
                                onSubmit={submitGrade}
                                readonly={isSubmitting}
                            />
                        </TabsContent>

                        <TabsContent value="comments" className="flex-1 mt-0 min-h-0 h-full">
                            <Card className="h-full shadow-sm">
                                <CardContent className="p-4 overflow-y-auto h-full">
                                    <h3 className="font-medium mb-4">Inline Comments Summary</h3>
                                    {Object.keys(allComments).length === 0 ? (
                                        <div className="text-sm text-gray-500 italic">
                                            Belum ada komentar inline.
                                        </div>
                                    ) : (
                                        Object.entries(allComments).map(([fileId, fileComments]) => (
                                            <div key={fileId} className="mb-4">
                                                <div className="text-sm font-semibold text-blue-600 mb-2">File #{fileId}</div>
                                                {fileComments.map((c, idx) => (
                                                    <div key={idx} className="text-sm mb-2 p-2 bg-gray-50 rounded border border-gray-100">
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                            <span>Line {c.line}</span>
                                                            <span>{c.author}</span>
                                                        </div>
                                                        <div>{c.text}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

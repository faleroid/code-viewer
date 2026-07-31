import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';

export interface CommentItem {
    author: string;
    time?: string;
    text: string;
}

export interface InlineCommentThreadProps {
    comments: CommentItem[];
    lineNumber: number;
    readonly?: boolean;
    onReply?: (data: { text: string; line: number }) => void;
    onClose?: () => void;
}

export default function InlineCommentThread({
    comments = [],
    lineNumber,
    readonly = false,
    onReply,
    onClose,
}: InlineCommentThreadProps) {
    const [replyText, setReplyText] = useState('');

    const submitReply = () => {
        if (replyText.trim() && onReply) {
            onReply({ text: replyText, line: lineNumber });
            setReplyText('');
        }
    };

    return (
        <Card className="w-80 shadow-lg border-sky-200">
            <div className="bg-sky-50 px-3 py-2 border-b border-sky-100 flex justify-between items-center text-sm font-semibold text-sky-800 rounded-t-lg">
                <span>Line {lineNumber}</span>
                {onClose && (
                    <button onClick={onClose} className="text-sky-500 hover:text-sky-700">&times;</button>
                )}
            </div>
            
            <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto p-3 space-y-3">
                    {comments.length === 0 ? (
                        <div className="text-sm text-gray-500 italic text-center">
                            No comments yet.
                        </div>
                    ) : (
                        comments.map((comment, index) => (
                            <div key={index} className="text-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-900">{comment.author}</span>
                                    {comment.time && <span className="text-xs text-gray-500">{comment.time}</span>}
                                </div>
                                <div className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                                    {comment.text}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {!readonly && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                        <textarea 
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a comment..." 
                            className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-sky-500 focus:border-sky-500 mb-2 min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                            {onClose && (
                                <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                            )}
                            <Button size="sm" onClick={submitReply} disabled={!replyText.trim()}>Comment</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

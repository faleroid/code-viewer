import React, { useEffect, useState, useRef } from 'react';
import { createHighlighter, Highlighter } from 'shiki';

export interface CodeViewerProps {
    code: string;
    language?: string;
    comments?: Array<{ line: number; text: string; author: string }>;
    readonly?: boolean;
    onAddComment?: (line: number) => void;
}

const escapeHtml = (unsafe: string) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export default function CodeViewer({
    code,
    language = 'javascript',
    comments = [],
    readonly = false,
    onAddComment,
}: CodeViewerProps) {
    const [highlightedHtml, setHighlightedHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const highlighterRef = useRef<Highlighter | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initShiki = async () => {
            try {
                const hl = await createHighlighter({
                    themes: ['github-light'],
                    langs: ['javascript', 'php', 'html', 'css', 'vue', 'json', 'typescript']
                });
                highlighterRef.current = hl;
                if (isMounted) {
                    highlightCode(hl, code, language);
                }
            } catch (e) {
                console.error('Failed to init Shiki', e);
                if (isMounted) {
                    setHighlightedHtml(`<pre><code>${escapeHtml(code)}</code></pre>`);
                    setIsLoading(false);
                }
            }
        };

        initShiki();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (highlighterRef.current) {
            highlightCode(highlighterRef.current, code, language);
        }
    }, [code, language]);

    const highlightCode = (hl: Highlighter, codeText: string, langName: string) => {
        if (!codeText) {
            setIsLoading(false);
            return;
        }

        const lang = hl.getLoadedLanguages().includes(langName) ? langName : 'text';

        const html = hl.codeToHtml(codeText, {
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

        setHighlightedHtml(html);
        setIsLoading(false);
    };

    const handleCodeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (readonly || !onAddComment) return;

        const target = e.target as HTMLElement;
        const lineEl = target.closest('[data-line]');
        if (lineEl) {
            const lineNumber = parseInt(lineEl.getAttribute('data-line') || '0', 10);
            if (lineNumber > 0) {
                onAddComment(lineNumber);
            }
        }
    };

    return (
        <div className="relative bg-white border border-gray-200 rounded-md overflow-hidden text-sm flex flex-col h-full">
            {isLoading ? (
                <div className="p-4 flex items-center justify-center text-gray-500 h-full">
                    Loading editor...
                </div>
            ) : (
                <div className="overflow-auto flex-1 custom-scrollbar pb-10" onClick={handleCodeClick}>
                    <div 
                        dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
                        className="code-container font-mono text-xs md:text-sm"
                    />
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

export interface FileNode {
    name: string;
    path: string;
    children?: FileNode[];
}

export interface FileTreeViewerProps {
    node: FileNode;
    selectedFilePath?: string;
    onSelect?: (path: string) => void;
}

export default function FileTreeViewer({
    node,
    selectedFilePath = '',
    onSelect,
}: FileTreeViewerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const isFolder = Boolean(node.children && node.children.length > 0);
    const isSelected = selectedFilePath === node.path;

    const toggle = () => {
        if (isFolder) {
            setIsOpen(!isOpen);
        }
    };

    const selectFile = () => {
        if (!isFolder && onSelect) {
            onSelect(node.path);
        }
    };

    return (
        <div className="font-sans text-sm">
            <div 
                className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 rounded group ${
                    isSelected && !isFolder ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={isFolder ? toggle : selectFile}
            >
                <div className="mr-1 w-4 h-4 flex items-center justify-center">
                    {isFolder && (
                        isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                </div>
                
                {isFolder ? (
                    <Folder className="w-4 h-4 mr-2 text-yellow-500" />
                ) : (
                    <File className={`w-4 h-4 mr-2 text-gray-500 ${isSelected ? 'text-blue-500' : ''}`} />
                )}
                
                <span className="truncate">{node.name}</span>
            </div>
            
            {isFolder && isOpen && (
                <div className="pl-4 border-l border-gray-200 ml-2">
                    {node.children?.map((child, index) => (
                        <FileTreeViewer
                            key={child.path || index}
                            node={child}
                            selectedFilePath={selectedFilePath}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

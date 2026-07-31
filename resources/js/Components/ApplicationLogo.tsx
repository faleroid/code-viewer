import React from 'react';
import { Code2 } from 'lucide-react';

export default function ApplicationLogo(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={`inline-flex items-center justify-center text-sky-600 ${props.className || ''}`}>
            <Code2 className="w-8 h-8" />
        </div>
    );
}

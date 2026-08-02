import React from 'react';

interface TitleProps {
    title?: string;
    subtitle?: string;
}

export default function Title({ title, subtitle }: TitleProps) {
    return (
        <div className="flex flex-col">
            <h1 className="pb-2 text-2xl font-semibold text-slate-800">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
    );
}

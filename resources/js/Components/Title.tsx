import React from 'react';

interface TitleProps {
    title?: string;
    subtitle?: string;
}

export default function Title({ title, subtitle }: TitleProps) {
    return (
        <div className="py-6 flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
    );
}

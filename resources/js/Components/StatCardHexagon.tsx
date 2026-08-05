import React from 'react';
import { HexagonPattern } from "@/Components/ui/hexagon-pattern"
import { cn } from "@/lib/utils"

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ElementType;
    variant?: 'sky' | 'blue' | 'orange' | 'purple' | 'green' | 'red' | 'gray';
    iconBorderClass?: string;
    iconSlot?: React.ReactNode;
}

const variantStyles = {
    sky: 'border-sky-500 bg-sky-50/40 text-sky-600',
    blue: 'border-sky-500 bg-sky-50/40 text-sky-600',
    orange: 'border-orange-400 bg-orange-50/40 text-orange-500',
    purple: 'border-purple-500 bg-purple-50/40 text-purple-600',
    green: 'border-emerald-500 bg-emerald-50/40 text-emerald-600',
    red: 'border-rose-500 bg-rose-50/40 text-rose-600',
    gray: 'border-gray-400 bg-gray-50/40 text-gray-600'
};

export default function StatCardHexagon({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = 'sky',
    iconBorderClass,
    iconSlot
}: StatCardProps) {
    const badgeClasses = iconBorderClass || variantStyles[variant] || variantStyles.sky;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Background Grid Pattern */}
            <HexagonPattern
                radius={25}
                hexagons={[
                    [5, 2],
                    [6, 3],
                    [7, 1],
                ]}
                className={cn(
                    "[mask-image:linear-gradient(to_top_left,white,transparent,transparent)]"
                )}
            />

            <div className="relative z-10 flex flex-col justify-between h-28">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{title}</span>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-colors ${badgeClasses}`}>
                        {iconSlot ? (
                            iconSlot
                        ) : (
                            Icon && <Icon className="w-5 h-5 stroke-[2.5]" />
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div>
                    <div className="text-3xl font-semibold tracking-tight text-gray-900">
                        {value}
                    </div>
                    {subtitle && (
                        <p className="text-sm text-gray-900 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

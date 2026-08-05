import React from 'react';
import { GridPattern } from "@/Components/ui/grid-pattern"
import { cn } from "@/lib/utils"

export interface StatCardProps {
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
            <GridPattern
                width={28}
                height={28}
                squares={[
                    [8, 3],
                    [10, 2],
                    [5, 0],
                    [9, 1],
                    [4, 3],
                    [7, 1],
                ]}
                className={cn(
                    "[mask-image:linear-gradient(to_top_left,white_0%,transparent_50%)]"
                )}
            />

            <div className="relative z-10 flex flex-col justify-between h-fit">
                {/* Content Section */}
                <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center p-3 rounded-xl border-2 transition-colors shrink-0 ${badgeClasses}`}>
                        {iconSlot ? (
                            iconSlot
                        ) : (
                            Icon && <Icon className="w-6 h-6 stroke-[2]" />
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="text-xl font-semibold tracking-tight text-gray-900 leading-none">
                            {value}
                        </div>
                        {subtitle && (
                            <p className="text-sm text-gray-500 mt-1 font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

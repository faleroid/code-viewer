import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { SidebarItemProps } from './types';

export const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    activeId,
    onSelect,
    level = 0,
    openItems,
    toggleOpen,
}) => {
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isOpen = Boolean(openItems[item.id]);

    const isItemActive =
        item.isActive !== undefined
            ? item.isActive
            : activeId !== undefined
            ? activeId === item.id
            : false;

    const handleClick = (e: React.MouseEvent) => {
        if (item.disabled) {
            e.preventDefault();
            return;
        }

        if (item.onClick) {
            item.onClick(item, e);
        }

        if (hasChildren) {
            e.preventDefault();
            toggleOpen(item.id);
        } else if (onSelect) {
            onSelect(item);
        }
    };

    // Helper to render icon (Component vs ReactNode)
    const renderIcon = () => {
        if (!item.icon) return null;

        // Already a rendered React element (e.g. <MyIcon />)
        if (React.isValidElement(item.icon)) {
            return <span className="shrink-0">{item.icon}</span>;
        }

        // A component type (function, forwardRef object, memo object, etc.)
        const IconComponent = item.icon as React.ComponentType<{ className?: string }>;
        return (
            <IconComponent
                className={`h-5 w-5 shrink-0 transition-colors ${
                    isItemActive
                        ? 'text-sky-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                }`}
            />
        );
    };

    const isTopLevel = level === 0;

    const baseItemStyles = `
        group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm
        transition-all duration-200 select-none cursor-pointer text-left
        ${
            isItemActive
                ? 'bg-sky-50 text-sky-600 font-bold shadow-xs'
                : level === 0
                ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold uppercase tracking-wider'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal'
        }
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    const content = (
        <div className="flex items-center gap-3 min-w-0 flex-1">
            {renderIcon()}
            <span className="truncate">
                {item.label}
            </span>
        </div>
    );

    const rightAccessory = (
        <div className="flex items-center gap-2 ml-2 shrink-0">
            {item.badge && <span>{item.badge}</span>}
            {hasChildren && (
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                    {isOpen ? (
                        <Minus className="h-4 w-4 stroke-[2]" />
                    ) : (
                        <Plus className="h-4 w-4 stroke-[2]" />
                    )}
                </span>
            )}
        </div>
    );

    return (
        <li className="w-full list-none">
            {item.href && !hasChildren ? (
                <Link
                    href={item.disabled ? '#' : item.href}
                    onClick={handleClick}
                    className={baseItemStyles}
                >
                    {content}
                    {rightAccessory}
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    className={baseItemStyles}
                    disabled={item.disabled}
                >
                    {content}
                    {rightAccessory}
                </button>
            )}

            {/* Sub-menu nested tree with vertical left border */}
            {hasChildren && isOpen && (
                <div className="relative ml-4 pl-3.5 my-1 border-l border-slate-200/90 space-y-1">
                    <ul className="space-y-1">
                        {item.children!.map((child) => (
                            <SidebarItem
                                key={child.id}
                                item={child}
                                activeId={activeId}
                                onSelect={onSelect}
                                level={level + 1}
                                openItems={openItems}
                                toggleOpen={toggleOpen}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
};

import React, { useState, useEffect, useMemo } from 'react';
import { SidebarProps, SidebarNavItem } from './types';
import { SidebarItem } from './SidebarItem';

export const Sidebar: React.FC<SidebarProps> = ({
    items,
    activeId: controlledActiveId,
    defaultActiveId,
    onSelect,
    className = '',
    header,
    footer,
    allowMultipleOpen = true,
}) => {
    const [uncontrolledActiveId, setUncontrolledActiveId] = useState<string | undefined>(
        defaultActiveId
    );

    const currentActiveId = controlledActiveId !== undefined ? controlledActiveId : uncontrolledActiveId;

    // Helper function to get default open state map recursively
    const getInitialOpenStates = (
        navItems: SidebarNavItem[],
        targetActiveId?: string
    ): Record<string, boolean> => {
        const stateMap: Record<string, boolean> = {};

        const traverse = (itemList: SidebarNavItem[]): boolean => {
            let hasActiveChild = false;

            for (const item of itemList) {
                let isChildActive = false;

                if (item.children && item.children.length > 0) {
                    isChildActive = traverse(item.children);
                }

                if (item.id === targetActiveId || isChildActive) {
                    hasActiveChild = true;
                }

                if (item.defaultOpen || isChildActive) {
                    stateMap[item.id] = true;
                }
            }

            return hasActiveChild;
        };

        traverse(navItems);
        return stateMap;
    };

    const [openItems, setOpenItems] = useState<Record<string, boolean>>(() =>
        getInitialOpenStates(items, currentActiveId)
    );

    // Auto expand parent group if currentActiveId changes
    useEffect(() => {
        if (currentActiveId) {
            setOpenItems((prev) => {
                const autoExpanded = getInitialOpenStates(items, currentActiveId);
                return { ...prev, ...autoExpanded };
            });
        }
    }, [currentActiveId, items]);

    const toggleOpen = (id: string) => {
        setOpenItems((prev) => {
            if (allowMultipleOpen) {
                return { ...prev, [id]: !prev[id] };
            } else {
                const isCurrentlyOpen = !!prev[id];
                return isCurrentlyOpen ? {} : { [id]: true };
            }
        });
    };

    const handleSelect = (item: SidebarNavItem) => {
        if (controlledActiveId === undefined) {
            setUncontrolledActiveId(item.id);
        }
        if (onSelect) {
            onSelect(item);
        }
    };

    return (
        <aside
            className={`w-64 bg-white border-r border-slate-200/80 min-h-full flex flex-col p-4 space-y-3 font-sans ${className}`}
        >
            {header && <div className="mb-2">{header}</div>}

            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-1.5">
                    {items.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            activeId={currentActiveId}
                            onSelect={handleSelect}
                            level={0}
                            openItems={openItems}
                            toggleOpen={toggleOpen}
                        />
                    ))}
                </ul>
            </nav>

            {footer && <div className="mt-auto pt-3 border-t border-slate-100">{footer}</div>}
        </aside>
    );
};

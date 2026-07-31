import React from 'react';

export interface SidebarNavItem {
    /** Unique identifier for the item */
    id: string;
    /** Display text for the item */
    label: string;
    /** Target URL (if used as a link) */
    href?: string;
    /** Icon element or Lucide icon component */
    icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
    /** Custom badge content (e.g. counter, pill text, or icon) */
    badge?: React.ReactNode;
    /** Child menu items for multi-level navigation */
    children?: SidebarNavItem[];
    /** Whether the group is expanded by default */
    defaultOpen?: boolean;
    /** Manual override for active state */
    isActive?: boolean;
    /** Whether the item is disabled */
    disabled?: boolean;
    /** Custom click handler */
    onClick?: (item: SidebarNavItem, e: React.MouseEvent) => void;
}

export interface SidebarProps {
    /** Array of navigation menu items */
    items: SidebarNavItem[];
    /** Currently active item ID (for controlled active state) */
    activeId?: string;
    /** Default active item ID */
    defaultActiveId?: string;
    /** Callback triggered when a leaf item or menu item is clicked */
    onSelect?: (item: SidebarNavItem) => void;
    /** Additional CSS classes for the root sidebar container */
    className?: string;
    /** Optional custom header (e.g. brand logo or user profile) */
    header?: React.ReactNode;
    /** Optional custom footer */
    footer?: React.ReactNode;
    /** Accordion mode: allow multiple open groups (true by default) */
    allowMultipleOpen?: boolean;
}

export interface SidebarItemProps {
    item: SidebarNavItem;
    activeId?: string;
    onSelect?: (item: SidebarNavItem) => void;
    level?: number;
    openItems: Record<string, boolean>;
    toggleOpen: (id: string) => void;
}

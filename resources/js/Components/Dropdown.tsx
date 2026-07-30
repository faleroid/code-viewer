/* @refresh reset */
import { InertiaLinkProps, Link } from '@inertiajs/react';
import React, { createContext, useContext, useState } from 'react';

const DropdownContext = createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleOpen: () => void;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
});

const Dropdown = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropdownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropdownContext.Provider>
    );
};

const Trigger = ({ children }: { children: React.ReactNode }) => {
    const { open, setOpen, toggleOpen } = useContext(DropdownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white',
    children,
}: {
    align?: 'left' | 'right';
    width?: string;
    contentClasses?: string;
    children: React.ReactNode;
}) => {
    const { open, setOpen } = useContext(DropdownContext);

    if (!open) return null;

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <div
            className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
            onClick={() => setOpen(false)}
        >
            <div
                className={
                    `rounded-md ring-1 ring-black ring-opacity-5 ` +
                    contentClasses
                }
            >
                {children}
            </div>
        </div>
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: InertiaLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;

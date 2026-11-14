import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Search, Plus } from 'lucide-react';

export interface SearchableOption {
    value: string;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SearchableOption[];
    placeholder: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    disabled?: boolean;
    disabledPlaceholder?: string;
    className?: string;
    id?: string;
    actionLabel?: string;
    onActionClick?: () => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    options,
    placeholder,
    icon: Icon,
    disabled = false,
    disabledPlaceholder,
    className = '',
    id,
    actionLabel,
    onActionClick
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(
        () => options.find((o) => o.value === value),
        [options, value]
    );

    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase().trim();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
        );
    }, [options, searchQuery]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close when disabled
    useEffect(() => {
        if (disabled && isOpen) {
            setIsOpen(false);
            setSearchQuery('');
        }
    }, [disabled, isOpen]);

    // Keep highlighted index in bounds
    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchQuery, options]);

    const scrollHighlightedIntoView = (index: number) => {
        if (listRef.current) {
            const el = listRef.current.children[index] as HTMLElement;
            if (el && el.scrollIntoView) {
                el.scrollIntoView({ block: 'nearest' });
            }
        }
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery('');
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                e.preventDefault();
                setIsOpen(true);
                return;
            }
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = (prev + 1) % (filteredOptions.length || 1);
                    scrollHighlightedIntoView(next);
                    return next;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = prev <= 0 ? (filteredOptions.length || 1) - 1 : prev - 1;
                    scrollHighlightedIntoView(next);
                    return next;
                });
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchQuery('');
                break;
            default:
                break;
        }
    };

    const displayPlaceholder = disabled && disabledPlaceholder
        ? disabledPlaceholder
        : selectedOption && isOpen
        ? selectedOption.label
        : placeholder;

    return (
        <div ref={containerRef} className={`relative group ${className}`} id={id}>
            {/* Left Icon */}
            {Icon && (
                <Icon
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 ${
                        isOpen
                            ? 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                />
            )}

            {/* Interactive Searchable Input */}
            <input
                ref={inputRef}
                type="text"
                disabled={disabled}
                value={isOpen ? searchQuery : selectedOption ? selectedOption.label : ''}
                placeholder={displayPlaceholder}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => {
                    if (!disabled) {
                        setIsOpen(true);
                    }
                }}
                onClick={() => {
                    if (!disabled && !isOpen) {
                        setIsOpen(true);
                    }
                }}
                onKeyDown={handleKeyDown}
                className={`w-full py-3 pr-10 bg-slate-50 dark:bg-slate-800/80 border-2 rounded-xl outline-none transition-all text-sm font-medium ${
                    Icon ? 'pl-11' : 'pl-4'
                } ${
                    disabled
                        ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-400 cursor-not-allowed placeholder:text-slate-400/80 dark:placeholder:text-slate-500'
                        : isOpen
                        ? 'border-blue-500 bg-white dark:bg-slate-900 ring-4 ring-blue-500/10 text-slate-900 dark:text-white cursor-text'
                        : selectedOption
                        ? 'border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800'
                        : 'border-slate-100 dark:border-slate-700 text-slate-400 cursor-pointer hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800'
                }`}
                autoComplete="off"
                role="combobox"
                aria-expanded={isOpen}
            />

            {/* Right-side Controls: Clear button & Animated Chevron */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1 z-10">
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                            setSearchQuery('');
                            if (inputRef.current) inputRef.current.focus();
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Clear"
                    >
                        <X size={13} />
                    </button>
                )}
                <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => {
                        if (!disabled) {
                            if (isOpen) {
                                setIsOpen(false);
                                setSearchQuery('');
                            } else {
                                setIsOpen(true);
                                if (inputRef.current) inputRef.current.focus();
                            }
                        }
                    }}
                    className={`p-1 text-slate-400 transition-all ${
                        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:text-slate-600'
                    }`}
                >
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                    />
                </button>
            </div>

            {/* Custom Styled Dropdown Menu */}
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div
                        data-lenis-prevent
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-blue-950/15 overflow-hidden flex flex-col"
                    >
                        <div
                            ref={listRef}
                            data-lenis-prevent
                            onWheel={(e) => {
                                e.stopPropagation();
                            }}
                            className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-dropdown-scroll overscroll-contain"
                        >
                            {filteredOptions.length > 0 ? (
                                <>
                                    {filteredOptions.map((opt, idx) => {
                                        const isSelected = opt.value === value;
                                        const isHighlighted = idx === highlightedIndex;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleSelect(opt.value)}
                                                onMouseEnter={() => setHighlightedIndex(idx)}
                                                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                                                        : isHighlighted
                                                        ? 'bg-slate-100/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 font-medium'
                                                }`}
                                            >
                                                <div className="truncate mr-2">
                                                    <div className="truncate">{opt.label}</div>
                                                    {opt.subLabel && (
                                                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                                                            {opt.subLabel}
                                                        </div>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <Check
                                                        size={16}
                                                        className="text-blue-600 dark:text-blue-400 shrink-0 ml-2"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}

                                    {/* Bottom row item (non-sticky) */}
                                    {onActionClick && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsOpen(false);
                                                setSearchQuery('');
                                                onActionClick();
                                            }}
                                            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all flex items-center space-x-2 cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
                                        >
                                            <Plus size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                            <span className="truncate">{actionLabel || 'Station not in list? Add New'}</span>
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="py-6 px-4 text-center">
                                    <Search size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-3">
                                        No options matching &ldquo;{searchQuery}&rdquo;
                                    </p>
                                    {onActionClick && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsOpen(false);
                                                setSearchQuery('');
                                                onActionClick();
                                            }}
                                            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                                        >
                                            <Plus size={14} />
                                            <span>{actionLabel || 'Station not in list? Add New'}</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchableSelect;


import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { clsx } from 'clsx';

interface Option {
    label: string;
    value: string | number;
}

interface SearchableSelectProps {
    label?: string;
    value?: string | number | null;
    onChange: (val: string | number) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
}

export const SearchableSelect = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    disabled,
    required,
    error,
    className
}: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options
    const filteredOptions = options.filter(opt =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Find selected label
    const selectedOption = options.find(opt => String(opt.value) === String(value));

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className={clsx("space-y-1.5 w-full relative", className)} ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                className={clsx(
                    "flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-sm cursor-pointer transition-all min-h-[40px]",
                    error ? "border-red-500 ring-red-500/20" : "border-[hsl(var(--border))]",
                    disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "hover:border-indigo-400 focus-within:ring-2 ring-indigo-500/20 border-indigo-500",
                    isOpen && "ring-2 ring-indigo-500/20 border-indigo-500"
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className={clsx("truncate pr-2", !selectedOption && "text-slate-400")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </div>
                <div className="flex items-center text-slate-400">
                    {selectedOption && !disabled && !required && (
                        <div
                            className="p-1 hover:text-red-500 hover:bg-red-50 rounded-full mr-1 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                        >
                            <X size={14} />
                        </div>
                    )}
                    <ChevronDown size={16} className={clsx("transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>

            {/* Dropdown Panel */}
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[hsl(var(--border))] rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={String(opt.value)}
                                    className={clsx(
                                        "flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                                        String(value) === String(opt.value)
                                            ? "bg-indigo-50 text-indigo-700 font-medium"
                                            : "hover:bg-slate-50 text-slate-700"
                                    )}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    {String(value) === String(opt.value) && <Check size={14} className="text-indigo-600" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                                No results found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
        </div>
    );
};

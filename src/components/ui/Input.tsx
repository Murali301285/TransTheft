import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] block">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))] transition-colors">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={clsx(
                            'w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg py-2.5 px-4 text-[hsl(var(--foreground))] text-sm placeholder:text-[hsl(var(--muted-foreground)/0.5)] transition-all',
                            'focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error && 'border-[hsl(var(--danger))] focus:border-[hsl(var(--danger))] focus:ring-[hsl(var(--danger)/0.2)]',
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-[hsl(var(--danger))] animate-fade-in">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

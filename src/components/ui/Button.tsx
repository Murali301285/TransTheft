import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const variants = {
            primary: 'bg-[hsl(var(--primary))] text-white hover:opacity-90 shadow-md',
            secondary: 'bg-[hsl(var(--secondary))] text-white hover:opacity-90 shadow-md',
            outline: 'border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]',
            ghost: 'hover:bg-[hsl(var(--muted-foreground)/0.1)] text-[hsl(var(--foreground))]',
            danger: 'bg-[hsl(var(--danger))] text-white hover:opacity-90',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-6 py-2.5 text-base',
            lg: 'px-8 py-3 text-lg',
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={clsx(
                    'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)] focus:ring-offset-2',
                    variants[variant],
                    sizes[size],
                    isLoading && 'cursor-not-allowed opacity-70',
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

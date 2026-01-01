import * as React from "react"
import { clsx } from "clsx"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <label className={clsx("relative inline-flex items-center cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
                <input
                    type="checkbox"
                    className="sr-only peer"
                    ref={ref}
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                <div className={clsx(
                    "w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-[hsl(var(--primary))] dark:border-gray-600 transition-colors",
                    checked ? "bg-green-500" : "bg-gray-200"
                )}></div>
                <div className={clsx(
                    "absolute top-0.5 left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all peer-checked:translate-x-full peer-checked:border-white",

                )}></div>
            </label>
        )
    }
)
Switch.displayName = "Switch"

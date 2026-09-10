import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    unstyled?: boolean;
}

export function Tooltip({ content, children, position = 'right', className, unstyled }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updateCursorPosition = (e: React.MouseEvent) => {
        let x = e.clientX + 15;
        let y = e.clientY + 15;

        // Bounds check (Viewport)
        // Assuming max tooltip width ~320px and height ~220px
        if (x + 320 > window.innerWidth) {
            x = e.clientX - 330; // Flip to left of cursor
        } else if (x < 0) {
            x = 10;
        }

        if (y + 220 > window.innerHeight) {
            y = e.clientY - 230; // Flip to top of cursor
        }

        setCoords({ x, y });
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        updateCursorPosition(e);
        setIsVisible(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isVisible) {
            requestAnimationFrame(() => updateCursorPosition(e));
        }
    };

    return (
        <div
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsVisible(false)}
            className={className}
        >
            {children}
            {mounted && isVisible && createPortal(
                <div
                    className={unstyled 
                        ? "fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                        : "fixed z-[9999] bg-white text-slate-700 border border-slate-200 shadow-2xl rounded-lg p-3 text-xs animate-in fade-in zoom-in-95 duration-200 min-w-[200px] max-w-sm pointer-events-none"
                    }
                    style={{ top: coords.y, left: coords.x }}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
}

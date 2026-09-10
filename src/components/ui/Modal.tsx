import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling on body when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-slide-up relative text-left my-8 transform transition-all">
                    <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X size={18} />
                        </Button>
                    </div>
                    <div className="p-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showCloseButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
    showCloseButton = true
}: ModalProps) {
    const modalRoot = useRef<Element | null>(null);

    useEffect(() => {
        modalRoot.current = document.getElementById('modal-root');
        if (!modalRoot.current) {
            const div = document.createElement('div');
            div.id = 'modal-root';
            document.body.appendChild(div);
            modalRoot.current = div;
        }
    }, []);

    if (!modalRoot.current) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl'
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100]">
                    <div
                        className="fixed inset-0 bg-black/20"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`w-full ${maxWidthClasses[maxWidth]} bg-white rounded-lg shadow-lg relative`}
                            >
                                <div className="p-6">
                                    {(title || showCloseButton) && (
                                        <div className="flex items-center justify-between mb-4">
                                            {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
                                            {showCloseButton && (
                                                <button
                                                    onClick={onClose}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {children}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        modalRoot.current
    );
} 